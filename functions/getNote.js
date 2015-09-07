require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var utils = require('cloud/utils/core');


/** String -> String -> String -> Parse.query -> Parse.query */
var filterBy = curry(4, function filterBy(column, value, includes, query) {
    var q = query
        .equalTo(column, value)
        .include(includes);

    return column === 'uuid' ?
        q :
        q.greaterThan('expiresAt', Date.now());
});

var get = curry(2, function extract(attr, parseObject) {
    return parseObject.get(attr);
});

/** String -> Task(Error, Note) */
var findNote = function findNote(identifier) {
    return +parseInt(identifier, 10) === +identifier ?
        utils.getObject(Sync, filterBy('syncCode', +identifier, 'note')).map(get('note')) :
        utils.getObject(Note, filterBy('uuid', identifier, ""));
};

/** Object -> Task(Error, Note) */
module.exports = compose(
    utils.TaskFromEither,
    map(findNote),
    utils.getProperty('identifier'));
