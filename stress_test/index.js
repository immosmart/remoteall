//var s_socket;
var i = 0;
var io_client = require('socket.io-client');
var sockets = [];
setInterval(function () {
    i++;
    console.log(i);

    var s_socket = io_client.connect('http://localhost:1234', {'force new connection': true});

    s_socket.emit('set_session', 'stress', 'debug' + Math.random());
    /**/
    (function (s_socket) {
        setInterval(function () {
            s_socket.emit('send_code', {
                a: Math.random(),
                b: Math.random(),
                c: Math.random(),
                d: Math.random(),
                e: Math.random(),
                f: Math.random(),
                g: Math.random()
            });
        }, 2000 * Math.random() + 2000);
    })(s_socket)

    //node_modules

    s_socket.emit('add_session', 'stress_member', {
        a: Math.random(),
        b: Math.random(),
        c: Math.random(),
        d: Math.random(),
        e: Math.random(),
        f: Math.random(),
        g: Math.random()
    });

    sockets[i] = s_socket;

}, 50);

