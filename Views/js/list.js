"use strict";

var app = new Vue({
    el: "#app",
    data: {
        wait: 800, // time to wait before sending data
        timeouts: {},
        classes: { // css class names
            success: 'success',
            error: 'error',
            warning: 'warning',
            fade: 'fade',
            buttonActive: 'btn-primary',
            button: 'btn-light'
        },
        selected: '5',
        searchQuery: '',
        gridData: [],
        gridColumns: { // each gridData[] item property has a matching gridColumns property name
            id: {
                sort: true
            },
            name: {
                sort: true,
                input: true,
            },
            calibration: {
                sort: true,
                title: _('calibration'),
                values: [
                    {name: 'Option 1 +4.3', value: "0001"},
                    {name: 'SCT013 +5', value: "SCT013"},
                    {name: 'Option 3 +2.1', value: "0003"},
                    {name: 'Option 4 -0.5', value: "0004"}
                ]
            },
            voltage: {
                sort: true,
                title: _('voltage'),
                values: [
                    {name: 'V1', value: "v1"},
                    {name: 'V2', value: "v2"},
                    {name: 'V3', value: "v3"},
                    {name: 'V4', value: "v4"},
                    {name: 'V5', value: "v5"},
                ]
            },
            power: {
                sort: true,
                noHeader: true,
                title: _('power'),
                hideNarrow: true
            },
            realPower: {
                label: 'RP',
                sort: true,
                noHeader: true,
                title: _('realPower')
            },
            actualPower: {
                label: 'AP',
                sort: true,
                noHeader: true,
                title: _('actualPower')
            },
            current: {
                label: 'I',
                sort: true,
                noHeader: true,
                title: _('Current')
            },
            view: {
                icon: '#icon-arrow_forward',
                noHeader: true,
                link: true,
                title: _('View this stm32config')
            }
        },
        status: {
            message: '',
            title: ''
        }
    },
    watch: {
        gridData: {
            handler: function(val){
                _debug.log('#app:gridData::changed')
                if(val.length === 0) {
                    this.Notify(_("Nothing downloaded, try again"), true);
                } else {
                    this.Notify(_('Found %s results').replace('%s', val.length))
                }
            },
            deep: true
        }
    },
    mounted: function () {
        this.reload();
    },
    methods: {
        reload: function () {
            // on load request server data
            let vm = this;
            vm.Notify(_('Loading'), true);
            stm32config.list().then(function(data){
                // handle success - populate gridData[] array
                // add urls for edit and view
                data.forEach(function(v,i) {
                    if(typeof data[i] === 'object') {
                        let id = data[i].id;
                        data[i].view = path + 'stm32config/view?id=' + id;
                        data[i].edit = path + 'stm32config/edit?id=' + id;
                    }
                });
                vm.gridData = data;
    
            }, function(xhr,message){
                vm.Notify = ({
                    success: false,
                    title: _('Error loading.'),
                    message: message,
                    total: 0,
                    url: this.url
                }, true)
            })
            this._timeouts = {}
        },


        // ---------------------------------------
        // METHOD NAME MATCHES gridColumns{} KEYS (aka field names):
        // ---------------------------------------

        /**
         * update the name property of an individual entry
         * pass success() or error() to ajax promise to execute on finish
         *
         * @event event:handler
         *
         * @param Event event
         * @param Object item
         * @param String property
         * @param mixed value
         * @param Function success
         * @param Function error
         * @return void
         *
         */
        name: function(event, item, property, value, success, error){
            try {
                this.Set_field_delayed(event, item, property, value, success, error)
            } catch (error) {
                _debug.error (_('JS Error'), field, error, arguments);
            }
        },
        calibration: function(event, item, property, value, success, error){
            try {
                this.Set_field(event, item, property, value, success, error)
            } catch (error) {
                _debug.error (_('JS Error'), field, error, arguments);
            }
        },
        realPower: function(event, item, property, value, success, error){
            // toggle public status
            try {
                var id = item.id
                var field = 'realPower';
                var value = !item[field];
                this.Set_field(event, item, id, field, value, function() {
                    item[field] = value;
                });
            } catch (error) {
                _debug.error (_('JS Error'), field, error, arguments);
            }
        },
        actualPower: function(event, item, property, value, success, error){
            // toggle public status
            try {
                var id = item.id
                var field = 'actualPower';
                var value = !item[field];
                this.Set_field(event, item, id, field, value, function() {
                    item[field] = value;
                });
            } catch (error) {
                _debug.error (_('JS Error'), field, error, arguments);
            }
        },
        current: function(event, item, property, value, success, error){
            // toggle public status
            try {
                var id = item.id
                var field = 'current';
                var value = !item[field];
                this.Set_field(event, item, id, field, value, function() {
                    item[field] = value;
                });
            } catch (error) {
                _debug.error (_('JS Error'), field, error, arguments);
            }
        },



        // ----------
        // UTILITIES
        // ----------

        /**
         * CALL CUSTOM FUNCTION FOR EACH FIELD
         * called by inputs and clicks
         *
         * @param Event event
         * @param Object item
         * @param String property
         * @param mixed value
         * @param Function success
         * @param Function error
         * @return void
         */
        Handler: function(event, item, property, value, success, error) {
            if(typeof this[property] === 'function') {
                // call the fields' function, passing the dataGrid[] item that matches the index
                this[property](event, item, property, value, success, error);
            }
        },
        /**
         * send data to server. runs success() and error() as required
         *
         * @param Event event
         * @param Object item
         * @param String property
         * @param mixed value
         * @param Function success
         * @param Function error
         * @return void
         */
        Set_field: function(event, item, id, field, value, success, error) {
            // sanitize input
            // @todo: more work could be done to check all the possible inputs
            console.log('emrys')
            switch(typeof value) {
                case 'string':
                    _value = value.trim();
                    break;
                default:
                    _value = value;
            }
            _debug.log('#app:Set_field()', {item, id, field, _value})

            // set the stm32config value calling success() or error() on completion
            stm32config.set(field, id, _value).then(success, error);
        },
        /**
         * wait for pause in user input before sending data to server
         */
        Set_field_delayed: function(event, item, property, value, success, error){
            var vm = this;
            var timeout_key = item.id+'_'+property;
            window.clearTimeout(this._timeouts[timeout_key]);
            this._timeouts[timeout_key] = window.setTimeout( function() {
                // call set field with parameters and callback functions
                // for succesfull ajax transaction or error
                // for fast servers you dont need this, as the save happens before you see it
                saving = window.setTimeout(function(){
                    vm.Notify({
                        'title': _('Saving')
                    }, true)
                }, vm.wait)

                vm.Set_field(event, item, item.id, property, value,
                    // on success
                    function(data, message, xhr){
                        // on succesful save ...
                        window.clearTimeout(saving)
                        // display success message to user
                        _debug.log (_('SUCCESS'), message, arguments);
                        vm.Notify(_('Saved'))
                        if (typeof success == 'function') {
                            success(event)
                        }
                    },
                    // on error ...
                    function(xhr, message) {
                        // display error message to user
                        vm.Notify(message)
                        if (typeof error == 'function') {
                            error(event)
                        }
                        // pass error to catch statement
                        throw ['500_'+property, message].join(' ');
                    }
                )
            }, this.wait);
        },
        /**
         * display feedback to user
         */
        Notify: function(status, persist) {
            // display message to user
            this.status = status
            var vm = this
            // stop previous delay
            window.clearTimeout(this.statusTimeout);
            if(!persist) {
                // wait until status is reset
                this.statusTimeout = window.setTimeout(function(){
                    // reset to show the total
                    console.log('Notify()', vm.status);
                    vm.status = {message: vm.status.total};
                }, this.wait * 3);
            }
        }
    }
})

app.reload = function() {
    stm32config.list()
}