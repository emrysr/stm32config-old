<?php
namespace Emoncms;

class Stm32api
{
    public function __construct()
    {
        $this->connected = false;
        $this->ready = true;
        $this->connection = false;
// @todo: this will need to be set somewhere??
        $this->api = realpath('../stm32config/stm32api.py');
        $this->python = 'python2';
        $this->connect();
    }
    /**
     * get connection id
     *
     * @return void
     */
    private function connect()
    {
        // connect to STM32 return connection id
        $this->connection = `$this->python $this->api CONNECT`;
        return $this->connection;
    }

    public function set($params) {
        if(!$this->connection) {
            $this->connect();
        }
        // @todo: while loop to test for connection until connected

        $id = $params['id'];
        $properties = $params['properties'];
        $values = $params['values'];
        $responses = array();

        // loop through multiple set requests as single requests;
        foreach ($properties as $index=>$property) {
            $value = $values[$index];
            $responses[] = `$this->python $this->api $this->connection SET $property $value`;
        }
        return $responses;
    }

    public function get($params) {
        if(!$this->connection) {
            $this->connect();
        }
        // @todo: while loop to tcreateRequestest for connection until connected

        $id = $params['id'];
        $properties = $params['properties'];
        $responses = array();

        // loop through multiple set requests as single requests;
        foreach ($properties as $index=>$property) {
            $responses[] = `$this->python $this->api -c$this->connection -eGET$property -i$id`;
        }
        return $responses;
    }
}
