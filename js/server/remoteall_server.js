var REMOTE_ALL_SERVER_CONFIG = require('./remoteall_server.config.js')

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , io_client = require('socket.io-client')
    , fs = require('fs')
    , qs = require('querystring'),
    _ = require('lodash');

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
                console.log(POST);
                var app = POST.app ? POST.app : null;
                var session_id = POST.session_id ? POST.session_id : null;
                var emit_data = POST.emit_data ? POST.emit_data : null;

                if (!app || !session_id || !emit_data) {
                    res.writeHead(400, {
                        'Access-Control-Allow-Origin': '*'
                    });
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

                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*'
                });
                res.end('OK');
            });
        } else {
            res.writeHead(400, {
                'Access-Control-Allow-Origin': '*'
            });
            res.end('Only POST requests');
        }
    } else {
        res.writeHead(404, {
            'Access-Control-Allow-Origin': '*'
        });
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
var rooms = {};
io.sockets.on('connection', function (socket) {

    var app = 'share'
    var session_id = 'share';
    var my_rooms = {};
    var my_member_data;

    socket.join(app + '_' + session_id);

    //set main Session/Room that used for communications
    socket.on('set_session', function (_app, _session_id) {
        socket.leave(app + '_' + session_id)
        app = _app;
        session_id = _session_id;
        socket.join(app + '_' + session_id);
    });

    //connect to additional session
    socket.on('add_session', function (_session_id, member_data) {
        console.log('add session ' + _session_id);
        var fullSessID = app + '_' + _session_id;

        //if passed member_data and not double enter in room
        if (member_data && !my_rooms[_session_id]) {
            //store member data to send it after disconnect or remove session
            my_member_data = member_data;

            //store room id
            my_rooms[_session_id] = true;

            //create new member list if not exists
            if (!rooms[fullSessID]) {
                rooms[fullSessID] = [];
            }

            //sending members list to new member
            socket.emit('members_list', rooms[fullSessID], _session_id);

            //store new member
            rooms[fullSessID].push(member_data);

            //notify members about new
            io.sockets.in(fullSessID).emit('on', member_data, _session_id);
        }

        socket.join(fullSessID);
    });

    //kick by request or disconnect
    function removeSession(_session_id) {
        console.log('remove session ' + _session_id);
        var fullSessID = app + '_' + _session_id;
        socket.leave(fullSessID);

        if (my_rooms[_session_id]) {

            //remove current member from room
            rooms[fullSessID] = _.filter(rooms[fullSessID], function (member_data) {
                return member_data !== my_member_data;
            });

            //remove empty rooms
            if (!rooms[fullSessID].length) {
                delete rooms[fullSessID]
            }

            //notify members about disconnect
            io.sockets.in(fullSessID).emit('off', my_member_data, _session_id);
        }
    };

    //disconnect from additional session
    socket.on('remove_session', removeSession);


    socket.on('send_code', function (data, _session_id) {
        var ses_id = _session_id ? _session_id : session_id;
        io.sockets.in(app + '_' + ses_id).emit('recive_code', data, ses_id);
    });

    socket.on('disconnect', function () {
        for (var _session_id in my_rooms) {
            removeSession(_session_id);
        }
        my_rooms = {};
    });
});


