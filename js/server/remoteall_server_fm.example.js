var forever = require('forever-monitor');

var child = new (forever.Monitor)('remoteall_server.js', {
    max: 5,
    silent: true,
    options: []
});

child.on('exit', function () {
    console.log('remoteall_server.js has exited after 3 restarts');
});

child.start();