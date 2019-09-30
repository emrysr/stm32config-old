"use strict";


Vue.component("modal", {
    template: "#modal",
    props: ['gridData','selected','samples'],
    data: function () {
        return {
            animating: false,
            loading: false,
            xyz: new Date,// used as stm write response
            abc: new Date// used as stm read response
        }
    },
    filters: {
        // format date to local time using the moment.js library
        formatDate: function(date) {
            if (!date) return '';
            return moment(date).fromNow();
            // var m = moment(date);
            // return m.diff(moment(), 'minutes') > 0 ? m.fromNow() : '';
        },
        time: function(date) {
            if (!date) return '';
            return moment(date).format('LTS');
        }
    },
    computed: {
        isShown: function() {
            if(this.entry) {
                return this.entry !== null
            }
        },
        entry: function() {
            var match;
            for(let n in this.gridData) {
                let entry = this.gridData[n];
                if (this.selected && (entry.id.toString() === this.selected.toString())) {
                    match = entry;
                }
            }
            return match;
        }
    },
    methods: {
        mouseOver: function(event) {
            event.target.title = this.$options.filters.formatDate(this.getLatestSample().lastUpdate);
        },
        close: function(event) {
            var vm = this
            this.animating = true;
            vm.$emit('modal:hide', event)
            setTimeout(function(){
                vm.$emit('modal:hidden', event)
                vm.animating = false;
            }, 100)
        },
        show: function(event) {
            this.animating = true;
            var vm = this;
            vm.$emit('modal:show', event)
            setTimeout(function(){
                vm.$emit('modal:shown', event)
                vm.animating = false;
            }, 300)
        },
        plot: function () {
            var selector = '#modal-graph'
            var latest =  this.getLatestSample();
            if(latest.success && document.querySelector(selector)) {
                // call jquery addon with the correct args
                plot(selector, latest.dataset);
            } else {
                console.log('no data to plot or no placeholder')
            }
        },
        getMin: function() {
            if(!this.samples[this.selected]) return 0;
            var min;
            var dataset = this.samples[this.selected].dataset[0];
            for(var n in dataset) {
                var point = dataset[n][1]
                if (!min || point < min) {
                    min = point
                }
            }
            return min.toFixed(3)
        },
        getMax: function() {
            if(!this.samples[this.selected]) return 0;
            var max;
            var dataset = this.samples[this.selected].dataset[0];
            for(var n in dataset) {
                var point = dataset[n][1];
                if (!max || point > max) {
                    max = point
                }
            }
            return max.toFixed(3)
        },
        getMean: function() {
            if(!this.samples[this.selected]) return 0;
            var points = [];
            var sum = 0;
            var dataset = this.samples[this.selected].dataset[0];
            for(var n in dataset) {
                var point = dataset[n][1];
                points.push(point);
                sum += point;
            }
            return (sum/points.length).toFixed(3)
        },
        reload: function(event) {
            // @todo: ajax request to api
            var vm = this;
            var dropdown = event.target.parentNode;
            // simulate ajax api request
            this.loading = true;
            this.$emit('loading', event);

            setTimeout(function(){
                vm.loading = false;
                vm.$emit('loaded', event);
                // cache api responses
                if (typeof vm.samples[vm.selected] !== 'object') {
                    vm.samples[vm.selected] = {}
                }
                var d1 = [];
                for (var i = 0; i < 14; i += 0.5) {
                    d1.push([i, Math.sin(i+=Math.random())]);
                }
                vm.samples[vm.selected] = {
                    dataset: [d1],
                    lastUpdate: new Date(),
                    success: true
                }
                dropdown.open = true;
                vm.plot();
            }, 500)
        },
        expand: function(event) {
            var dropdown = event.target.parentNode;
            if(!dropdown.open) {
                if(!this.isSampleLoaded()) {
                    this.reload(event)
                } else {
                    // already loaded do nothing but expand
                    dropdown.open = true;
                    this.plot();
                }
            } else {
                dropdown.open = false;
            }
        },
        save: function () {
            //fields auto save
            //todo: 
        },
        get: function(prop) {
            // return api response from getting property prop
            return 'OK 200';
        },
        set: function(prop) {
            // return api response from setting property prop
            return 'OK 200';
        },
        getLatestSample: function() {
            if(!this.samples && !this.selected && !this.samples[this.selected]) return false;
            return this.samples[this.selected] || {success: false};
        },
        isSampleLoaded: function() {
            var latest = this.getLatestSample()
            if(typeof latest !== 'undefined') {
                return latest.success === true;
            } else {
                return false;
            }
        }
    },
    created: function() {
        this.animating = this.selected == ''
    }
})

var app = new Vue({
    el: "#app",
    data: {
        wait: 800, // time to wait before sending data
        timeouts: {},
        classNames: { // css class names
            success: 'success',
            error: 'error',
            warning: 'warning',
            fade: 'fade',
            buttonActive: 'btn-primary',
            button: 'btn-light',
            selectedRow: 'info'
        },
        loading: false,
        selected: document.currentScript.dataset.selected, // passed as [data-selected=""] in the <script> tag that loads this page
        searchQuery: '',
        samples: {},
        gridData: [],
        gridColumns: { // each gridData[] item property has a matching gridColumns property name
            view: {
                icon: '#icon-keyboard_arrow_right',
                noHeader: true,
                link: true,
                title: _('View this stm32config'),
                handler: function(event, item, property, value, success, error, always) {
                    try {
                        let vm = app;
                        event.preventDefault();
                        // toggle on/off if already selected
                        if(vm.selected == item.id) {
                            vm.selected = '';
                        } else {
                            vm.selected = parseInt(item.id);
                        }

                    } catch (error) {
                        _debug.error (_('JS Error'), property, error, arguments);
                    }
                },
                messages: {
                    success: _('Saved'),
                    error: _('Error'),
                    always: _('Done')
                }
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
                title: _('Real Power (RP) as input'),
                handler: function(event, item, property, value, success, error, always) {
                    item[property] = !item[property]
                }
            },
            actualPower: {
                label: 'AP',
                sort: true,
                noHeader: true,
                title: _('Actual Power (AP) as input'),
                handler: function(event, item, property, value, success, error, always) {
                    item[property] = !item[property]
                }
            },
            current: {
                label: 'I',
                sort: true,
                noHeader: true,
                title: _('Current (I) as input'),
                handler: function(event, item, property, value, success, error, always) {
                    item[property] = !item[property]
                },
                messages: {
                    success: _('Current Input Saved'),
                    error: _('Error, Current Input Not Saved'),
                    always: _('Done')
                }
            }
        },
        status: {
            message: 'ready',
            title: _('Loading...')
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
        },
        loading: function(newVal) {
            if (typeof this.status !== 'object') {
                this.status = {title: this.status}
            }
            this.status.title = newVal ? _('Loading...'): '';
        }
    },
    mounted: function () {
        this.reload();
    },
    created: function () {
        _debug.log('list app created()')
        // pass on root event handler to relevant function
        this.$root.$on('event:handler', function(event, item, property, value, success, error, always) {
            var success_func = function() {
                if (typeof success === 'function') success.call(this, arguments);
                item[property] = value;// set the global dataStore
            }
            if(this.gridColumns[property] && this.gridColumns[property].handler && typeof this.gridColumns[property].handler === 'function') {
                this.gridColumns[property].handler(event, item, property, value, success_func, error, always);
            }
        });
    },
    methods: {
        reload: function () {
            this.loading = true;
            // on load request server data
            let vm = this;
            vm.Notify(_('Loading...'), true);
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
            if(typeof status !== 'object') {
                status = {title: status}
            }
            this.status = status
            var vm = this
            // stop previous delay
            window.clearTimeout(this.statusTimeout);
            if(!persist) {
                // wait until status is reset
                this.statusTimeout = window.setTimeout(function(){
                    // reset to show the total
                    console.log('Notify()', vm.status);
                    vm.status = {title: vm.status + " found"};
                }, this.wait * 3);
            }
        }
    },
    computed: {
        modal: function() {
            var modal = {};
            modal.show = true;
            modal.classList = {
                'hide': this.selected == '',
                'fade': this.selected == ''
            }
            return modal
        }
    }
})

// app.reload = function() {
//     stm32config.list()
// }