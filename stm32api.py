#!/usr/bin/python2

import sys, getopt, uuid, json

_DEBUG = False
_API_VERSION = 0.1

def main(argv):
  action = 'CONNECT'
  connection = None
  jsonFormat = False
  debug = _DEBUG
  version = _API_VERSION
  options = {}
  try:
    #`$this->python $this->api -c$this->connection -eGET$property -i$id`
    opts, args = getopt.getopt(argv, "c:a:i:p:jhvd", ["connection=", "action=", "id=", "property=", "json", "help", "version","debug"])
    
    for opt, arg in opts:
      if opt in ("-c", "--connection"):
        connection = arg
      elif opt in ("-j", "--json"):
        jsonFormat = True
      elif opt in ("-d", "--debug"):
        debug = True
      elif opt in ("-a", "--action"):
        action = arg
      elif opt in ("-i", "--id"):
        options['id'] = arg
      elif opt in ("-p", "--property"):
        options['property'] = arg
      elif opt in ("-h", "--help"):
        raise getopt.GetoptError('', 100)
      elif opt in ("-v", "--version"):
        action = 'VERSION'

    if connection is not None:
      options['success'] = True

      if action == 'LIST':
        # todo: get list of values. (TBC)
        message = 'List all'
        if (True) :
          options['data'] = ['a','b','c','d','e','f']
          options['success'] = True
        else :
          options['data'] = None
          options['success'] = False

      elif action == 'GET':
        message = 'Get value of property'
        # todo: get the value from the chip and set key/value to options['data']
        options['data'] = { options['property']: 'FAKE VALUE' }


      elif action == 'SET':
        # todo: set the value on the chip and set options['success'] to True if succesful
        if (True) :
          message = 'Setting value successful'
          options['success'] = True
          options['data'] = {}
        else :
          message = 'Nothing changed'
          options['success'] = False
          options['data'] = {}

      else:
        # return error when action not in above list
        options['success'] = False
        raise getopt.GetoptError('Unrecognized action. Bad Request', 400)

      options['message'] = message
      options['connection'] = connection

    else:
      # no unique connection id given. return one with error message
      options['success'] = False
      options['message'] = 'no connection given'
      options['connection'] = "%s" % uuid.uuid1()

    if action == 'VERSION':
      # todo: get STM32 chip version or api version ? (TBC)
      message = 'v%s' % version
      print message
      sys.exit(2)

    options['action'] = action

    # DEBUG CONNECTION ID
    if (debug == True) :
      print ''
      print '______DEBUG_______'
      print 'JSON output: %s' % (jsonFormat == True)
      print 'connection: "%s"' % connection
      print 'action:     "%s"' % action
      print 'options:     %s' % ', '.join((str(key)+"="+str(value)) for key,value in options.items())
      print 'args:        %s' % ', '.join(str(x) for x in args)
      print ''
      print '______OUTPUT_______:'
      print ''

    # output json version of data
    if (jsonFormat) :
      print json.dumps(options)
    else:
      print options

    if (debug == True) :
      print ""
      print "______END_______"

  except getopt.GetoptError as e:
    if (not jsonFormat) :
      print e
      print "EmonCMS STM32 API. Version: v%s" % version
      print """
  Arguments:
    -c [--connection=]  unique identifier for request. Required.
    -p [--property=]    data item property to get or set
    -a [--action=]      action to perform
    -i [--id=]          unique id of data item to search for
    -j [--json]         return output as JSON. All responses have {success: bool, message: string, data: mixed}
                        Returned values held in "data" property.
    -d [--debug]      return version number
    -v [--version]      return version number
    -h [--help]         show this help

  Actions:
    GET  - request variable
    SET  - set variable
    LIST  - set variable
    VERSION - get version

  Examples:
    Get the value of the property "XYZ" of item "#12". Return results as "JSON" data. Identified as "AAAA"
        ./stm32api.py -cAAAA -aGET -i12 -pXYZ --json

    Set the value of the property "size" of item "0x1C31" to "0x21B1". Return results as "JSON" data. Identified as "set_0001"
        ./stm32api.py --connection=set_0001 --action=SET --id="0x21B1" --property="size" --json
        
    Get a list of all properties. Response tagged with id "1234"
        ./stm32api.py -c 1234 --action=LIST

    Show this Help
        ./stm32api.py --help

    Show the version number
        ./stm32api.py -v
"""
    else:
      options['message'] = e[0]
      print json.dumps(options)

    sys.exit(2)

if __name__ == "__main__":
  main(sys.argv[1:])
