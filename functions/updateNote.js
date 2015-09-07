require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var core = require('cloud/utils/core'),
    utils = require('cloud/utils/kattebel');

/** Object -> Either(Error, Task(Error, Note) */
var updateNote = function (params) {
    var content = core.getProperty('content', params),
        uuid = core.getProperty('uuid', params);

    return content.isLeft ?
        content :
        uuid.map(utils.filterBy('uuid'))
            .map(core.getObject(Note))
            .map(chain(core.updateObject({ content: content.get() }, [])));
};

/** Object -> Task(Error, Note) */
module.exports = compose(
    core.TaskFromEither,
    updateNote);
