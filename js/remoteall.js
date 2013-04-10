var remoteAll = function (params, connectCallback) {
    var self = this
    this.defaults = {
        appId: 'appNan',
        uniqueSessionId: 'SecretStringForConnection',
        url: null,
        host: {
            protocol: 'http',
            domain: 'localhost',
            port: '8888'
        }
    }
    this.options = $.extend(this.defaults, params);
    if (!this.options.url) {
        this.options.url = this.options.host.protocol + '://' + this.options.host.domain + ':' + this.options.host.port;
    }

    this.socket = io.connect(this.options.url);

    this.socket.on('connect', function () {

        self.setSession(self.options.appId, self.options.uniqueSessionId)
        if (connectCallback) {
            connectCallback.call(self, arguments);
        }
    })

    this.handlers = {
        recive_code: []
    }
    this.on = function (event, callback) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(callback);
    };
    this.off = function (event) {
        this.handlers[event] = [];
    }
    this.trig = function (event) {
        var args = Array.prototype.slice.call(arguments, 1, arguments.length);
        for (var key in this.handlers[event]) {
            var func = this.handlers[event][key];
            func.apply(this, args);
        }
    }

    this.socket.on('members_list', function (list, session_id) {
        self.trig('members_list', list, session_id);
    });

    this.socket.on('on', function (member_data, session_id) {
        self.trig('on', member_data, session_id);
    });

    this.socket.on('off', function (member_data, session_id) {
        self.trig('off', member_data, session_id);
    });

    this.socket.on('recive_code', function (data, session_id) {
        self.trig('recive_code', data, session_id);
    })
    /**
     *
     * @param code
     * @param session_id
     */
    this.sendCode = function (code, session_id) {
        this.socket.emit('send_code', code, session_id);
    }
    /**
     *
     * @param appId
     * @param uniqueSessionId
     */
    this.setSession = function (appId, uniqueSessionId) {
        self.socket.emit('set_session', appId, uniqueSessionId);
    }
    /**
     *
     * @param session_id
     */
    this.addSession = function (session_id, member_data) {
        this.socket.emit('add_session', session_id, member_data);
    }
    /**
     *
     * @param session_id
     */
    this.removeSession = function (session_id) {
        this.socket.emit('remove_session', session_id);
    }
}
