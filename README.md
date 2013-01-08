## Server

Just run 

    > node ./js/server/remoteall_server.js

## Clients


Both (or more) clients (remote controller and controlled app) should connect  to server with one `uniqueSessionId` and `appId`
If You need to do something after connection You can do it in callback where `context` current `remoteAll`

    var ra = new remoteAll({
        appId:'appNan',
        uniqueSessionId:'SecretStringForConnection',
        host:{
            protocol:'http',
            domain:'remoteall.org',
            port:'8888'
        }
    }, function (context, args) {
        // If You need to do something after connection
    });


### Remote controller 

RC can send codes or data throw remoteall server

    ra.sendCode({code:'xxx_code',index:'2'});
    
  or
  
    ra.sendCode('CODE_XXX');

### Controlled app

You should add callback for event `recive_code` where `data` contains `{code:'xxx_code',index:'2'}` or `'CODE_XXX'` received from RC

    ra.on('recive_code', function (data) {
      //do something
    })
    
so you can add more than one event handler

    ra.on('recive_code', function (data) {
      //do something else
    })

or u can delete all handlers

    ra.off('recive_code')

## Example


@see [example.html](https://github.com/immosmart/remoteall/blob/master/example.html)
