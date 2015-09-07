require('cloud/lib/bringPureFunctional.js').into(this);
const CONFIG = require('cloud/config.js');

/* ---------------- Backend utils --------------- */

/** Function -> { message: String, code: Number } */
var formatErrorResponse = curry(2, function (entity, error) {
    if (+error.code === 111) { error.code = CONFIG.CODES.WRONG_DATA_FORMAT; }

    if (+error.code === 142) { //Cloud Code Hook Failure
        try { error = JSON.parse(error.message); }
        catch (e) { error = error || ""; }
    }

    if ([200, 201, 204].indexOf(+error.code) !== -1) { // Fields missing from User
        error.message = CONFIG.ERRORS.MISSING_KEY({201: "password", 200: "username", 204: "email"}[+error.code]);
        error.code = CONFIG.CODES.MISSING_KEY;
    }

    if ([202, 203].indexOf(+error.code) !== -1) { // Already taken field from User
        error.code = CONFIG.CODES.VALIDATION_FAILED;
    }

    return error.code && error.message ?
        { entity: entity, code: error.code, message: error.message } :
        { code: CONFIG.CODES.INTERNAL_ERROR, message: CONFIG.ERRORS.INTERNAL_ERROR(error) };
});

/** Object[] -> Object
 *  Takes an array of objects of the following form : { key: value }
 *  and gather them into a single object containing all previous keys.
 * */
var regroup = function regroup(describers) {
    return describers.reduce(function (merge, object) {
        var property = Object.keys(object)[0];
        if (property != null) { merge[property] = object[property]; }
        return merge;
    }, {});
};

/** String -> Parse.Object[] -> a[] */
var pluck = curry(2, function (key, objects) {
    return objects.map(function (obj) { return obj.get(key); });
});

/** String -> Parse.Object[] -> a[] */
var pluckFlat = curry(2, function (key, objects) {
    return objects.map(function (obj) { return obj.get(key).pop(); });
});

/** String -> Object -> Object */
var asNamedObject = curry(2, function (key, data) {
    var obj = {};
    obj[key] = data;
    return obj;
});

/** a -> Object -> Either(Error, b) */
var getProperty = curry(2, function (key, object) {
    return "function" === typeof object || "object" === typeof object && !!object ?
        Either.fromNullable(object[key]).leftMap(function () { return {
            code: CONFIG.CODES.MISSING_KEY,
            message: CONFIG.ERRORS.MISSING_KEY(key),
        }; }) :
        Either.Left({
            code: CONFIG.CODES.WRONG_DATA_FORMAT,
            message: CONFIG.ERRORS.WRONG_DATA_FORMAT(key, "object"),
        });
});

/** M::Parse.Object => M -> String[] -> String -> Task(String, M) */
var getObjectById = curry(3, function (model, includes, id) {
    return (new Task(function(reject, resolve) {
        (new Parse.Query(model))
            .equalTo('objectId', id)
            .include(includes)
            .first()
            .then(function success(data) {
                data ? resolve(data) : reject({
                    code: CONFIG.CODES.ENTITY_NOT_FOUND,
                    message: CONFIG.ERRORS.ENTITY_NOT_FOUND
                });
            }, reject);
    })).rejectedMap(formatErrorResponse(model.entityName));
});

/** M::Parse.Object => M -> Parse.Query -> Parse.Query -> Task(String, M[])*/
var getObjects = curry(2, function (model, filter) {
    return (new Task(function(reject, resolve) {
        filter(new Parse.Query(model))
            .find()
            .then(resolve, reject);
    })).rejectedMap(formatErrorResponse(model.entityName));
});

var getObject = curry(2, function (model, filter) {
    return (new Task(function (reject, resolve) {
        filter(new Parse.Query(model))
            .first()
            .then(function success(data) {
                data ? resolve(data) : reject({
                    code: CONFIG.CODES.ENTITY_NOT_FOUND,
                    message: CONFIG.ERRORS.ENTITY_NOT_FOUND
                });
            }, reject);
    })).rejectedMap(formatErrorResponse(model.entityName));
});

/** Parse.Object -> Parse.Query -> Parse.Query -> Task(String, Number)*/
var countObjects = curry(2, function (model, filter) {
    return (new Task(function(reject, resolve) {
        filter(new Parse.Query(model))
            .count()
            .then(resolve, reject);
    })).rejectedMap(formatErrorResponse(model.entityName));
});

/**
 * M:Parse.Object => M -> Number -> Object -> Parse.Query -> Parse.Query -> Task[String, M[]]
 */
var getPage = curry(4, function (model, size, params, filter) {
    var page = Maybe.fromEither(getProperty('page', params));

    if (page.isNothing) { return getObjects(model, filter); }

    var getExplicitPage = function (nbToSkip) {
        return getObjects(model, function (query) {
            return filter(query)
                .ascending('created_at')
                .limit(size)
                .skip(nbToSkip);
        });
    };

    var getLatestPage = countObjects(model, filter)
            .map(function (c) { return Math.floor((c-1) / size) * size; })
            .chain(getExplicitPage);

    return parseInt(page.get(), 10) >= 0 ?
        getExplicitPage(size * parseInt(page.get(), 10)) : (
            page.get() === "latest" ?
                getLatestPage :
                new Task.rejected({
                    code: CONFIG.CODES.WRONG_DATA_FORMAT,
                    message: CONFIG.ERRORS.WRONG_DATA_FORMAT('page', 'positive number or literal `latest`')
                }));
});

/** M:Parse.Object => M -> Object -> String[] -> Task(String, M) */
var saveObject = curry(3, function (model, params, includes) {
    return (new Task(function (reject, resolve) {
        (new model(params)).save().then(function (instance) {
            includes.length === 0 ?
                resolve(instance) :
                (new Parse.Query(model))
                    .equalTo('objectId', instance.id)
                    .include(includes)
                    .first()
                    .then(resolve, reject);
        }, reject);
    })).rejectedMap(formatErrorResponse(model.entityName));
});

/** { model: Parse.Object, name: String }[] -> Object -> Task(String, Object) */
var pickObjects = curry(2, function (describers, params) {
    return async.parallel(describers.map(function (param) {
        return TaskFromEither(getProperty(param.name + 'Id', params)
            .leftMap(formatErrorResponse(param.model.entityName))
            .map(getObjectById(param.model, []))
        ).map(asNamedObject(param.name));
    })).map(regroup);
});

/** Either(String, Task(String, a)) -> Task(String, a) */
var TaskFromEither = function (either) {
    return either.leftMap(function (e) { return Task.rejected(e); }).merge();
};

/** M:Parse.Object => M -> Object -> Task(String, M) */
var find = curry(2, function (model, params) {
    return TaskFromEither(getProperty(model.keyId, params)
        .map(getObjectById(model, []))
        .leftMap(formatErrorResponse(model.entityName)));
});

/** String -> String -> Task(Error, _) */
var compareKeys = curry(2, function(refKey, key) {
    return refKey === key ?
        Task.of() :
        Task.rejected({
            code: CONFIG.CODES.INVALID_API_KEY,
            message: CONFIG.ERRORS.INVALID_API_KEY(key)
        });
});

var merge = function (dest, src) {
    var merged = {};
    Object.getOwnPropertyNames(dest).forEach(function (p) { merged[p] = dest[p]; });
    Object.getOwnPropertyNames(src).forEach(function (p) { merged[p] = src[p]; });
    return merged;
};

/** Object -> Object */
var gatherParams = function (req) {
    var merged = merge(merge(req.body, req.params), req.query);
    delete merged.length;
    return merged;
};

/** (Request -> Task(Error, Object)) -> (express.Request, express.response, express.next) -> Unit)  */
var toMiddleware = function (apiFunction) {
    return function (req, res, next) {
        apiFunction(gatherParams(req))
            .rejectedMap(formatErrorResponse(null))
            .fork(next, compose(res.json.bind(res), toJSON));
    };
};

/** a -> Boolean */
var isObject = function (obj) {
    return typeof obj === 'function' || (typeof obj === 'object' && !!obj);
};

/** a -> a */
var toJSON = function toJSON(o) {
    if (!isObject(o)) { return o; }
    if (Array.isArray(o)) { return o.map(toJSON); }
    if (o._serverData !== undefined) {
        var json = toJSON(o._serverData);
        json.className = o.className;
        json.createdAt = o.createdAt;
        json.objectId = o.id;
        json.updatedAt = o.updatedAt;
        return json;
    }
    return Object.keys(o).reduce(function (json, k) { json[k] = toJSON(o[k]); return json; }, {});
};

/* -------------- Public Interface -------------- */
exports.TaskFromEither = TaskFromEither;

exports.asNamedObject = asNamedObject;
exports.compareKeys = compareKeys;
exports.countObjects = countObjects;
exports.find = find;
exports.formatErrorResponse = formatErrorResponse;
exports.getObjectById = getObjectById;
exports.getObjects = getObjects;
exports.getPage = getPage;
exports.getProperty = getProperty;
exports.isObject = isObject;
exports.pickObjects = pickObjects;
exports.pluck = pluck;
exports.pluckFlat = pluckFlat;
exports.regroup = regroup;
exports.saveObject = saveObject;
exports.toJSON = toJSON;
exports.toMiddleware = toMiddleware;
exports.getObject = getObject;
