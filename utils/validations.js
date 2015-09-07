require('cloud/lib/bringPureFunctional.js').into(this);
const CONFIG = require('cloud/config.js');

var validate = {};

/** String -> { code: Number } -> Maybe(String) */
validate.email = function validateEmail(email, options) {
    return email && email.match && email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) !== null ?
        Maybe.Nothing() :
        Maybe.of(options.error);
};

/** String -> { min: Number, max: Number, code: Number } -> Maybe(String) */
validate.name = function validateName(name, options) {
    options.max = options.max !== undefined ? options.max : Number.POSITIVE_INFINITY;
    options.min = options.min !== undefined ? options.min : Number.NEGATIVE_INFINITY;
    return name && name.length <= options.max && name.length >= options.min && name.match &&
        name.match(/[\w\u00C0-\u017F -]+/) !== null ?
            Maybe.Nothing() :
            Maybe.of(options.error);
};

/** String -> { min: Number, max: Number, code: Number } -> Maybe(String) */
validate.string = function validateString(string, options) {
    options.max = options.max !== undefined ? options.max : Number.POSITIVE_INFINITY;
    options.min = options.min !== undefined ? options.min : Number.NEGATIVE_INFINITY;
    return typeof string === 'string' ?
        (string.length > options.min ?
            (string.length < options.max ?
                Maybe.Nothing() :
                Maybe.of(options.error)) :
            Maybe.of(options.error)) :
        Maybe.of(options.error);
};

/** Number -> { min: Number, max: Number, code: Number } -> Maybe(String) */
validate.number = function validateNumber(number, options) {
    options.max = options.max !== undefined ? options.max : Number.POSITIVE_INFINITY;
    options.min = options.min !== undefined ? options.min : Number.NEGATIVE_INFINITY;
    return !Number.isNaN(+number) && number != null ?
        (number > options.min ?
            (number < options.max ?
                Maybe.Nothing() :
                Maybe.of(options.error)) :
            Maybe.of(options.error)) :
        Maybe.of(options.error);
};

/** Number -> { min: Number, max: Number, code: Number } -> Maybe(String) */
validate.integer = function validateInteger(integer, options) {
    var error = validate.number(integer, options);
    return parseInt(integer, 10) === +integer ?
        (error.isNothing ?
            Maybe.Nothing() :
            error) :
        Maybe.of(options.error);
};

/** String -> { containedIn: a[], code: Number } -> Maybe(String) */
validate.enumee = function validateEnumee(enumee, options) {
    options.containedIn = options.containedIn || [];
    return options.containedIn.length === 0 || options.containedIn.indexOf(enumee) !== -1 ?
        Maybe.Nothing() :
        Maybe.of(options.error);
};

/** String -> { containsOr: a[], containsAnd: a[], containsOnly: a[], code: Number } -> Maybe(String) */
validate.list = function validateList(list, options) {
    options.containsOr = options.containsOr || [];
    options.containsAnd = options.containsAnd || [];
    options.containsOnly = options.containsOnly || [];

    var containsOr = function (list, contains) {
        return !contains.reduce(function (missing, el) {
            return missing && list.indexOf(el) === -1;
        }, true) || contains.length === 0;
    };

    var containsAnd = function (list, contains) {
        return contains.reduce(function (contained, el) {
            return contained && list.indexOf(el) !== -1;
        }, true);
    };

    var containsOnly = function (list, contains) {
        return contains.length === 0 || list.length > 0 && !list.reduce(function (stranger, el) {
            return stranger || contains.indexOf(el) === -1;
        }, false);
    };

    return Array.isArray(list) ?
        (containsOr(list, options.containsOr) ?
            (containsAnd(list, options.containsAnd) ?
                (containsOnly(list, options.containsOnly) ?
                    Maybe.Nothing() :
                    Maybe.of(options.error)) :
                Maybe.of(options.error)) :
            Maybe.of(options.error)) :
        Maybe.of(options.error);
};

/** a -> { code: Number } -> Maybe(String) */
validate.exist = function validateExist(elem, options) {
    return elem != null ?
        Maybe.Nothing() :
        Maybe.of(options.error);
};

/** a -> { message: String } -> Just(String) */
validate.error = function returnError(field, options) { return Maybe.of(options.message); };

/** Object[] -> Parse.Cloud.FunctionRequest -> Parse.Cloud.FunctionResponse */
var validateBeforeSave = curry(4, function validateBeforeSave(model, validations, request, response) {
    validateAll(validations, request.object).fork(function (e) {
        response.error({
            entity: model.entityName,
            code: e.code,
            message: e.message
        });
    }, response.success);
});

/** M:Parse.Object => { type: String, field: String, _:_ } -> M -> Task(String, model) */
var validateAll = curry(2, function (validations, model) {
    return validations
        .map(function (args) {
            var options = {};
            Object.keys(args).forEach(function (k) {
                if (k !== 'field' && k !== 'type') { options[k] = args[k]; }
            });
            return validate[args.type].bind(null, model.get(args.field), options);
        })
        .reduce(function (e, v) { return e.isNothing ? v() : e; }, Maybe.Nothing())
        .cata({ Nothing: Task.of.bind(null, model), Just: function (m) {
            return Task.rejected({ message: m, code: CONFIG.CODES.VALIDATION_FAILED });
        }});
});

exports.beforeSave = validateBeforeSave;
exports.all = validateAll;
Object.keys(validate).forEach(function (k) { exports[k] = validate[k]; });
