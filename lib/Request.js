var noop = function () { return this; },
    isObject = function (obj) {
        return typeof obj === 'function' || (typeof obj === 'object' && !!obj);
    },
    Task = require('cloud/lib/Folktale.js').data.Task;

function Request(functionRequest) {
    if (!isObject(functionRequest)) { return new InvalidRequest('Invalid request'); }
    if (!isObject(functionRequest.params) || !isObject(functionRequest.body)) {
        return new InvalidRequest('Invalid request parameters');
    }

    var mergeWithBody = function (object) {
        Object.getOwnPropertyNames(object).forEach(function (p) {
            if (p !== 'length') { functionRequest.body[p] = object[p]; }
        });
    };

    mergeWithBody(functionRequest.params);
    mergeWithBody(functionRequest.query);

    return new ValidRequest(functionRequest.body);
}

function InvalidRequest(msg) { this.error = msg; }

function ValidRequest(params, task) {
    this.params = params;
    this.task = task || Task.empty();
}

Request.prototype.extractParams = function extractParams() { return this.params || {}; };

InvalidRequest.prototype = Object.create(Request.prototype);
ValidRequest.prototype = Object.create(Request.prototype);

/** @Request[Task[e, a]] => (Object -> a -> b) -> Request[Task[e, b]] */
InvalidRequest.prototype.pmap = noop;
ValidRequest.prototype.pmap = function (f) {
    return new ValidRequest(this.params, this.task.map(f(this.params)));
};

/** @Request[Task[e, a]] => (a -> b) -> Request[Task[e, b]] */
InvalidRequest.prototype.map = noop;
ValidRequest.prototype.map = function (f) {
    return new ValidRequest(this.params, this.task.map(f));
};

/** @Request[Task[e, a]] => e -> w -> Request[Task[w, a]] */
InvalidRequest.prototype.rejectedMap = function (f) {
    return new InvalidRequest(f(this.error));
};
ValidRequest.prototype.rejectedMap = noop;

/** @Request[Task[_, a]], T:Task[_] => ((Object -> a) -> T) -> Request[T] */
InvalidRequest.prototype.pchain = noop;
ValidRequest.prototype.pchain = function (f) {
    return new ValidRequest(this.params, this.task.chain(f(this.params)));
};

/** @Request[Task[_, a]], T:Task[_] => a -> T -> Request[T] */
InvalidRequest.prototype.chain = noop;
ValidRequest.prototype.chain = function (f) {
    return new ValidRequest(this.params, this.task.chain(f));
};

/** T:Task[_] => Object -> T -> Request[T] */
InvalidRequest.prototype.through = noop;
ValidRequest.prototype.through = function (f) {
    return new ValidRequest(this.params, f(this.params));
};

/** Unit -> String */
InvalidRequest.prototype.toString = function () {
    return "InvalidRequest ('" + JSON.stringify(this.error) + "')";
};

ValidRequest.prototype.toString = function () {
    return "ValidRequest: \n" + JSON.stringify(this.params) + "\n" +
        (this.task && this.task.toString() || "- No task -");
};

/** @Request[Task[e, a]] => Unit -> Task[e, a] */
InvalidRequest.prototype.emerge = function () { return Task.rejected(this.error); };
ValidRequest.prototype.emerge = function () { return this.task; };

/** Boolean */
InvalidRequest.prototype.isValid = false;
ValidRequest.prototype.isValid = true;

/** ------------- Exports -------------- */
Request.through = function through(f, request) {
    if (arguments.length < 2) { return through.bind(null, f); }
    return request.through(f);
};

Request.emerge = function emerge(request) { return request.emerge(); };

Request.pmap = function pmap(f, request) {
    if (arguments.length < 2) { return pmap.bind(null, f); }
    return request.pmap(f);
};

Request.pchain = function pchain(f, request) {
    if (arguments.length < 2) { return pchain.bind(null, f); }
    return request.pchain(f);
};

Request.extractParams = function extractParams(request) { return request.extractParams(); };

module.exports = Request;
