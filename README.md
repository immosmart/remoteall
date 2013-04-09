## Server

### Requirements 
* [node.js](http://nodejs.org/) 
* [Socket IO & Socket IO client](http://socket.io) (`> npm install socket.io && npm install socket.io-client`)

### Start server

Create `./js/server/remoteall_server.config.js` (can be based on `./js/server/remoteall_server.config.example.js`) and run it on your `%NODEJS_SERVER%`

    > node ./js/server/remoteall_server.js

## Clients


Both (or more) clients (remote controller and controlled app) should connect  to server with one `uniqueSessionId` and `appId`
If You need to do something after connection You can do it in callback where `context` current `remoteAll`

    var ra = new remoteAll(REMOTE_ALL_CONFIG, function (context, args) {
        // If You need to do something after connection
    });

where `REMOTE_ALL_CONFIG` parts for `%NODEJS_SERVER%` @see [config.example.js](https://github.com/immosmart/remoteall/blob/master/js/config.example.js)

    var REMOTE_ALL_CONFIG = {
        appId : 'appNan',
        uniqueSessionId : 'SecretStringForConnection',
        url : null, //if defined @host@ will be ignored
        host : {
            protocol:'http',
            domain:'localhost',
            port:'8888'
        }
    }

clients will work with `%NODEJS_SERVER% = http://localhost:8888/`

### Remote controller 

RC can send codes or data throw remoteall server

    ra.sendCode({code:'xxx_code',index:'2'});
    
  or
  
    ra.sendCode('CODE_XXX');

### Controlled APP

You should add callback for event `recive_code` where
`data` contains `{code:'xxx_code',index:'2'}` or `'CODE_XXX'` received from RC and
`session_id` contains  ID of session  used to transfer information

    ra.on('recive_code', function (data, session_id) {
      //do something
    })
    
so you can add more than one event handler

    ra.on('recive_code', function (data, session_id) {
      //do something else
    })

or u can delete all handlers

    ra.off('recive_code')

### NonJS client API

If you need to send some data for Controlled APP using http/POST request u should send some params to `%NODEJS_SERVER%/emit`:
* app(string) - `appId`
* session_id(string) - `uniqueSessionId`
* emit_data(json|string|number`) - data to send

### MultiSession

Clients can be connected to additional sessions
    
    ra.addSession('additionalSessionId')
    ra.addSession('additionalSessionId2')

also clients can disconnect from session(s)

    ra.addSession('additionalSessionId2')

Next code will be recieved by clients connected to session with `additionalSessionId` only

    ra.sendCode('CODE_YYY','additionalSessionId')

## Example

@see [example with JS and NonJS(POST) Remote Controller](https://github.com/immosmart/remoteall/blob/master/example/client_and_rc/)

@see [example with code sender](https://github.com/immosmart/remoteall/blob/master/example/one_page_client_and_rc/index.html)
