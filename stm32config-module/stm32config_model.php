<?php
namespace Emoncms;
/*
 All Emoncms code is released under the GNU Affero General Public License.
 See COPYRIGHT.txt and LICENSE.txt.
 
 ---------------------------------------------------------------------
 Emoncms - open source energy visualisation
 Part of the OpenEnergyMonitor project:
 http://openenergymonitor.org
*/

// no direct access
defined('EMONCMS_EXEC') or die('Restricted access');

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\UriInterface;
interface RequestFactoryInterface
{
    /**
     * Create a new request.
     *
     * @param string $method The HTTP method associated with the request.
     * @param UriInterface|string $uri The URI associated with the request. 
     */
    public function createRequest(string $method, $uri): RequestInterface;
}

/**
 * STM32 Config Methods
 */
class Stm32Config
{
    /**
     * test to ensure all is ready
     */
    public function __construct()
    {
        $this->ready = true;
        $this->stm32api = null;
    }

    /**
     * list all items for list page
     * 
     * @return array
     */
    public function getAll()
    {
        return array(
            array("id"=>1,"port"=>"CT1","name"=>"CT1","calibration"=>"SCT013","voltage"=>"v1","power"=>"200W","realPower"=>true,"actualPower"=>false,"current"=>false),
            array("id"=>2,"port"=>"CT2","name"=>"CT2","calibration"=>"SCT013","voltage"=>"v3","power"=>"100W","realPower"=>false,"actualPower"=>true,"current"=>false),
            array("id"=>3,"port"=>"CT3","name"=>"CT3","calibration"=>"SCT013","voltage"=>null,"power"=>"30W","realPower"=>false,"actualPower"=>false,"current"=>true),
            array("id"=>4,"port"=>"CT4","name"=>"CT4","calibration"=>"SCT013","voltage"=>null,"power"=>"30W","realPower"=>false,"actualPower"=>false,"current"=>false),
            array("id"=>5,"port"=>"CT5","name"=>"CT5","calibration"=>"SCT013","voltage"=>null,"power"=>"30W","realPower"=>false,"actualPower"=>true,"current"=>false),
            array("id"=>6,"port"=>"CT6","name"=>"CT6","calibration"=>"SCT013","voltage"=>null,"power"=>"30W","realPower"=>false,"actualPower"=>true,"current"=>false),
            array("id"=>7,"port"=>"CT7","name"=>"CT7","calibration"=>"SCT013","voltage"=>null,"power"=>"30W","realPower"=>false,"actualPower"=>false,"current"=>false),
        );
    }

    /**
     * get the property values of an item by id
     *
     * @param object $params {properties,id}
     * @return void
     */
    public function get($params)
    {
        global $route;
        $id = $params['id'];
        $properties = $params['properties'];
        $values = array();

        /*
        ------------------
        put stm32 api code here to set the $values array
        ------------------
        eg:-
        $item = $this->send("GET $id");
        $values[$prop] = $item[$prop];
        */
        
        // fake the result until STM32 api created
        foreach($properties as $prop) {
            $values[] = time();
        }
        return array(
            'success' => true,
            'req' => array (
                'url' => $route->controller,
                'action' => $route->action,
                'params' => $params
            ),
            'data' => array (
                'id'=> $id,
                'properties'=> $properties,
                'values' => $values
            )
        );
    }
    
    /**
     * set the property values of an item by id
     *
     * @param object $params {properties,values,id}
     * @return void
     */
    public function set($params)
    {
        global $route;
        require "Modules/stm32config/Lib/stm32api.php";
        $this->stm32api = new Stm32api();
var_dump($this->stm32api);
exit('dave');
        $id = $params['id'];
        $properties = $params['properties'];
        $values = $params['values'];

        $api_response = $this->stm32api->set(array(
            'id' => $id,
            'properties' => $properties,
            'values' => $values
        ));
        return array(
            'success' => true,
            'req' => array (
                'controller' => $route->controller,
                'action' => $route->action,
                'params' => $params
            ),
            'data' => $api_response
        );
    }

// python calling functions
    private function send($params) {
        return $this->stm32api->get($params);
    }
}
