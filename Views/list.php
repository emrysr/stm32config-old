<div class="container w-auto">
    <div id="app">
        <div class="alert" :class="{'alert-warning':true}" v-if="status.message" v-cloak>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="alert-heading" if="status.title">{{ status.title }}</h4>
            {{ status.message }}
        </div>

        <div class="d-flex justify-content-between my-3">
            <h2 class="m-0">
                <?php echo _('STM32 Config') ?> <svg class="icon text-info"><use xlink:href="#icon-stm32"></use></svg> 
                <a v-if="gridData.length === 0" href="<?php echo $path ?>stm32config" class="btn btn-success btn-small" :title="_('Reload') + '&hellip;'" @click.prevent="reload()">
                <svg class="icon"><use xlink:href="#icon-spinner11"></use></svg></a>
            </h2>
            <form v-if="gridData.length > 0" id="search" class="form-inline m-0">
                <div class="form-group position-relative">
                    <input id="search-box" name="query" v-model="searchQuery" type="search" class="form-control mb-0" aria-describedby="searchHelp" placeholder="<?php echo _('Search') ?>" title="<?php echo _('Search the data by any column') ?>">
                    <button v-if="searchQuery!==''" id="searchclear" @click.prevent="searchQuery = ''" class="btn btn-link position-absolute" style="right: 0">
                        <svg class="icon"><use xlink:href="#icon-close"></use></svg>
                    </button>
                    <small id="searchHelp" class="form-text text-muted sr-only help-block"><?php echo _('Search the data by any column') ?>.</small>
                </div>
            </form>
        </div>
        <!-- custom component to display grid data-->
        <grid-data :grid-data="gridData"
            :columns="gridColumns"
            :filter-key="searchQuery"
            :caption="status.title"
            :class-names="classNames"
            :selected="selected"
            @update:total="status=arguments[0]"
        ></grid-data>

        <modal v-if="selected!==''":grid-data="gridData" 
            :selected="selected" 
            @modal:hide = "selected = ''"
            @modal:hidden = ""
            @modal:show = ""
            @modal:shown = ""
            @loading = "loading = true"
            @loaded = "loading = false"
        ></modal>

    </div>

</div><!-- eof .container -->

<script>
/**
 * return plain js object with gettext translated strings
 * @return object
 */
function getTranslations(){
    return {
        'Error': "<?php echo _('Error') ?>",
        'Error loading': "<?php echo _('Error loading') ?>",
        'Found %s entries': "<?php echo _('Found %s entries') ?>",
        'JS Error': "<?php echo _('JS Error') ?>",
        'Reload': "<?php echo _('Reload') ?>",
        'Loading': "<?php echo _('Loading') ?>…",
        'Saving': "<?php echo _('Saving') ?>…",
        'Label this dashboard with a name': "<?php echo _('Label this dashboard with a name') ?>",
        'Short title to use in URL.\neg \"roof-solar\"': "<?php echo _('Short title to use in URL.\neg \"roof-solar\"') ?>",
        'Adds a \"Default Dashboard\" bookmark in the sidebar.\nAlso visible at \"dashboard/view\"': "<?php echo _('Adds a \"Default Dashboard\" bookmark in the sidebar.\nAlso visible at \"dashboard/view\"') ?>",
        'Allow this Dashboard to be viewed by anyone': "<?php echo _('Allow this Dashboard to be viewed by anyone') ?>",
        'Clone the layout of this dashboard to a new Dashboard': "<?php echo _('Clone the layout of this dashboard to a new Dashboard') ?>",
        'Edit this dashboard layout': "<?php echo _('Edit this dashboard layout') ?>",
        'Delete this dashboard': "<?php echo _('Delete this dashboard') ?>…",
        'View this dashboard': "<?php echo _('View this dashboard') ?>…",
        'Edit Layout': "<?php echo _('Edit Layout') ?>"
    }
}
</script>

<script type="text/x-template" id="modal">
    <!-- Modal -->
    <div>
        <div v-if="entry" class="modal" :class="{'fade': animating || !isShown, 'in': isShown}" tabindex="-1" role="dialog">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" @click.prevent="close">×</button>
                <h3>More Details {{entry.name}}</h3>
                <div v-if="loading">
                    <div class="loader spinner">
                        <svg class="icon"><use xlink:href="#icon-reload"></use></svg>
                    </div>
                    <p>{{loading ? 'Loading...': ''}}</p>
                </div>
            </div>
            <div class="modal-body">
                <details @toggle="plot">
                    <summary>Request sample</summary>
                    <div id="graph" style="width:50%;height:100px;margin: auto"></div>
                </details>
            </div>
            <div class="modal-footer">
                <button class="btn" data-dismiss="modal" aria-hidden="true" @click.prevent="close">Close</button>
                <button class="btn btn-primary" @click.prevent="save">Save changes</button>
            </div>
        </div>
        <div v-if="isShown" @click="close" class="modal-backdrop in"></div>
    </div>
</script>
<script>
    function plot(data){
        $.plot($("#graph"), data);
    }
</script>

<link href="<?php echo $path; ?>Lib/bootstrap-datetimepicker-0.0.11/css/bootstrap-datetimepicker.min.css" rel="stylesheet">
<link href="<?php echo $path; ?>Modules/graph/graph.css?v=<?php echo $v; ?>" rel="stylesheet">

<script src="<?php echo $path;?>Lib/flot/jquery.flot.min.js"></script>
<script src="<?php echo $path;?>Lib/flot/jquery.flot.resize.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<!-- debug code -->
<script>
    _SETTINGS.showErrors = false

    if(!_SETTINGS.showErrors) {
        Vue.config.productionTip = true;
    }

    // filter to capitalize strings. usage: {{ text | captialize }}
    Vue.filter('capitalize', function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    var _debug = {
        log: function(){
            if(!_SETTINGS.showErrors) {
                console.trace.apply(this,arguments);
            }
        },
        error: function(){
            if(!_SETTINGS.showErrors) {
                console.error('Error')
                console.trace.apply(this, arguments);
            }
        }
    }
</script>

<!-- gridjs js and templates -->
<?php //echo sprintf('<script src="%s%s"></script>', $path, "Lib/vue.min.js"); ?>
<?php echo sprintf('<script src="%s%s?v=%s"></script>', $path, "Lib/gridjs/grid.js", $v); ?>
<?php include_once("Lib/gridjs/grid.html"); ?>
<!-- vuejs templates -->
<?php echo sprintf('<script src="%s%s?v=%s" data-selected="%s"></script>', $path, "Modules/stm32config/Views/js/list.js", $v, $id); ?>
