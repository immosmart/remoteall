var REMOTE_ALL_SERVER_CONFIG = {
    host: {
        domain: '127.0.0.1',
        port: '8888'
    }
}

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , io_client = require('socket.io-client')
    , fs = require('fs')
    , qs = require('querystring')

app.listen(REMOTE_ALL_SERVER_CONFIG.host.port);

function handler(req, res) {

    if (req.url == '/emit') {
        if (req.method == 'POST') {
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var POST = qs.parse(body);
                var app = POST.app ? POST.app : null;
                var session_id = POST.session_id ? POST.session_id : null;
                var emit_data = POST.emit_data ? POST.emit_data : null;

                if (!app || !session_id || !emit_data) {
                    res.writeHead(400);
                    res.end('Need all POST params app,session_id,emit_data');
                }

                try {
                    var emit_data_parsed = JSON.parse(emit_data);
                } catch (e) {
                    emit_data_parsed = emit_data;
                }
                if (!s_socket) {
                    var s_socket = io_client.connect(REMOTE_ALL_SERVER_CONFIG.host.protocol + '://' + REMOTE_ALL_SERVER_CONFIG.host.domain + ':' + REMOTE_ALL_SERVER_CONFIG.host.port);
                    s_socket.emit('set_session', app, session_id);
                }

                s_socket.emit('send_code', emit_data_parsed);

                res.writeHead(200);
                res.end('OK');
            });
        } else {
            res.writeHead(400);
            res.end('Only POST requests');
        }
    } else {
        res.writeHead(404);
        res.end('');
    }


//    fs.readFile(__dirname + '/index.html',
//        function (err, data) {
//            if (err) {
//                res.writeHead(500);
//                return res.end('Error loading index.html');
//            }
//            res.writeHead(200);
//            res.end(data);
//        });

}

io.sockets.on('connection', function (socket) {

    var app = 'share'
    var session_id = 'share';
    socket.join(app + '_' + session_id);

    //set main Session/Room that used for communications
    socket.on('set_session', function (_app, _session_id) {
        socket.leave(app + '_' + session_id)
        app = _app;
        session_id = _session_id;
        socket.join(app + '_' + session_id);
    });

    //connect to additional session
    socket.on('add_session', function (_session_id) {
        console.log('add session '+_session_id);
        socket.join(app + '_' + _session_id);
    });

    //disconnect from additional session
    socket.on('remove_session', function (_session_id) {
        console.log('add session '+_session_id);
        socket.leave(app + '_' + _session_id);
    });


    socket.on('send_code', function (data,_session_id) {
        var ses_id = _session_id?_session_id:session_id;
        io.sockets.in(app + '_' + ses_id).emit('recive_code', data)
    });
});


