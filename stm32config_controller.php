<?php

/**
 * All Emoncms code is released under the GNU Affero General Public License.
 * See COPYRIGHT.txt and LICENSE.txt.
 * 
 * ---------------------------------------------------------------------
 * Emoncms - open source energy visualisation
 * Part of the OpenEnergyMonitor project:
 * @see http://openenergymonitor.org
 * @source https://github.com/emoncms/stm32config/
 */

// no direct access
defined('EMONCMS_EXEC') or die('Restricted access');

/**
 * output returned the main controller for this stm32config/[action] request
 *
 * @return string|array adds to the main controller's [content] property
 */
function stm32config_controller()
{
    global $route, $session, $path;
    $result = false;
    $v = time();
    require "Modules/stm32config/stm32config_model.php";
    $config = new Emoncms\Stm32config();

    if (!$session['write']) return false;

    if ($route->format === 'html') {
        if ($route->action === '' || $route->action === 'view') {
            $result = sprintf('<link href="%s%s?v=%s" rel="stylesheet">', $path, "Modules/stm32config/Views/css/stm32config.css", $v);
            $result .= sprintf('<script src="%s%s?v=%s"></script>', $path, "Modules/stm32config/Views/js/stm32config.js", $v);
            $result .= view("Modules/stm32config/Views/list.php", array('path' => $path, 'v' => $v, 'id' => get('id')));
            return $result;
        }
    }

    else if ($route->format === 'json')
    {
        if ($route->action === 'list') {
            return $config->getAll();
        }
    }
    return array('content' => $result);
}
