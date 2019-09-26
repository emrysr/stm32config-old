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
    public function __construct()
    {
        $this->ready = true;
    }

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

    public function get()
    {
        return "list";
    }
}
