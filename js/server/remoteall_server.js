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
var Room = function (session_id) {
    this.session_id = session_id;
    this.members = [];
}
Room.add = function (app, session_id, socket, data) {
    var room = rooms[app + '_' + session_id];
    if (!room) {
        room = rooms[app + '_' + session_id] = new Room(session_id);
    }
    room.add(socket, data);
}
Room.remove = function (app, session_id, socket) {
    var room = rooms[app + '_' + session_id];
    console.log(app , session_id, room);
    if (!room) {
        return;
    }
    room.remove(socket);
    if (!room.members.length) {
        room.destroy(app);
    }
}
Room.prototype = {
    add: function (socket, data) {
        if (data) {
            this.send('on', data);
            socket.emit('members_list', _.map(this.members, function (member) {
                return member.data;
            }), this.session_id);
        }

        this.members.push({socket: socket, data: data});

    },
    remove: function (socket) {
        var i = 0;
        var data;

        this.members = _.filter(this.members, function (member) {
            if (member.socket == socket && member.data) {
                data = member.data;
            }
            if (member.socket == socket) {

            }
            return member.socket != socket;
        });
        if (data) {
            this.send('off', data);
        }
    },
    code: function (data) {
        this.send('recive_code', data);
    },
    send: function (name, data) {
        _.each(this.members, function (member) {
            member.socket.emit(name, data, this.session_id);
        });
    },
    destroy: function (app) {
        this.members = undefined;
        delete rooms[app + '_' + this.session_id];
    }
}


io.sockets.on('connection', function (socket) {

    var app = 'share'
    var session_id = 'share';
    var my_rooms = {};

    //Room.add(app + '_' + session_id);
    //socket.join(app + '_' + session_id);

    //set main Session/Room that used for communications
    socket.on('set_session', function (_app, _session_id) {

        Room.remove(app, session_id, socket);
        delete my_rooms[session_id];
        app = _app;
        session_id = _session_id;
        my_rooms[session_id] = true;
        Room.add(app, session_id, socket);
    });

    //connect to additional session
    socket.on('add_session', function (_session_id, member_data) {
        my_rooms[_session_id] = true;
        Room.add(app, _session_id, socket, member_data);
    });

    //disconnect from additional session
    socket.on('remove_session', function (session_id) {
        delete my_rooms[app + '_' + session_id];
        Room.remove(app, session_id, socket);
    });


    socket.on('send_code', function (data, _session_id) {
        var ses_id = _session_id ? _session_id : session_id;
        rooms[app + '_' + ses_id].code(data, ses_id);
    });

    socket.on('disconnect', function () {
        //console.log('disconnect');
        for (var _session_id in my_rooms) {

            Room.remove(app, _session_id, socket);
        }
        my_rooms = undefined;
    });
});


