require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var core = require('cloud/utils/core'),
    utils = require('cloud/utils/kattebel');

/** String -> Parse.Object -> Object */
var get = curry(2, function extract(attr, parseObject) {
    return parseObject.get(attr);
});

/** String -> Task(Error, Note) */
var findNote = function findNote(identifier) {
    return +parseInt(identifier, 10) === +identifier ?
        core.getObject(Sync, utils.filterBy('syncCode', +identifier)).map(get('note')) :
        core.getObject(Note, utils.filterBy('uuid', identifier));
};

/** Object -> Task(Error, Note) */
module.exports = compose(
    core.TaskFromEither,
    map(findNote),
    core.getProperty('identifier'));
