var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {

  var app = 'share'
  var session_id = 'share';
  socket.join(app+'_'+session_id);

  socket.on('set_session', function (_app,_session_id) {
    socket.leave(app+'_'+session_id)
    app = _app;
    session_id = _session_id;
    socket.join(app+'_'+session_id);
  });

  socket.on('send_code', function (data) {
    io.sockets.in(app+'_'+session_id).emit('recive_code', data)
  });
});
