require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var utils = require('cloud/utils/core');

/** String -> Parse.Query -> Parse.Query */
var filterByUuid = curry(2, function (uuid, query) {
    return query.equalTo('uuid', uuid);
});

/** Object -> Either(Error, Task(Error, Note) */
var updateNote = function (params) {
    var content = utils.getProperty('content', params),
        uuid = utils.getProperty('uuid', params);

    return content.isLeft ?
        content :
        uuid.map(filterByUuid)
            .map(utils.getObject(Note))
            .map(chain(utils.updateObject({ content: content.get() }, [])));
};

/** Object -> Task(Error, Note) */
module.exports = compose(
    utils.TaskFromEither,
    updateNote);
