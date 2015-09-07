require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var utils = require('cloud/utils/core');

/** String -> String -> Object -> Task(Error, _) */
var extractAndCompare = curry(3, function (refKey, targetProperty, headers) {
    return utils.TaskFromEither(map(
        utils.compareKeys(refKey),
        utils.getProperty(targetProperty, headers)));
});

/** { headers: Object } -> Task(Error, _) */
var ensureAPIKeys = compose(
    async.parallel,
    apply2(
        chain(extractAndCompare(CONFIG.APPLICATION_ID, 'x-parse-application-id')),
        chain(extractAndCompare(CONFIG.REST_API_KEY, 'x-parse-rest-api-key'))),
    utils.getProperty('headers'));

module.exports = function (req, res, next) {
    ensureAPIKeys(req)
        .rejectedMap(function (e) {
            return {
                code: CONFIG.CODES.INVALID_API_KEY,
                message: CONFIG.ERRORS.MISSING_API_KEY
            };
        })
        .fork(next, next.bind(null, null));
};
