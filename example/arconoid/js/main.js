REMOTE_ALL_CONFIG.uniqueSessionId = 'SecretSession_' + Math.random();
//REMOTE_ALL_CONFIG.app = 'myApp';

var ra = new remoteAll(REMOTE_ALL_CONFIG, function (context, args) {
    // do nothing
});
var timer = null;
ra.on('recive_code', function (data, session_id) {
    if( (data.button_code=='LENTER' || data.button_code=='RENTER') && data.event_name =='button_down'){ //reset game
        restartGame()
        return
    }

    switch (data.event_name) {
        case 'button_down':
            switch (data.button_code) {
                case 'LEFT': // 'Left' key
                    bLeftBut = true;
                    break;
                case 'RIGHT': // 'Right' key
                    bRightBut = true;
                    break;
            }
            break;
        case 'button_up':

            switch (data.button_code) {
                case 'LEFT': // 'Left' key
                    bLeftBut = false;
                    break;
                case 'RIGHT': // 'Right' key
                    bRightBut = false;
                    break;

            }

            break;
    }



})



