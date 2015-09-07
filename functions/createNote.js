require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var core = require('cloud/utils/core'),
    utils = require('cloud/utils/kattebel');

/** Unit -> Task(Error, { uuid: String }) */
var chooseUuid = function () {
    return (new Task(function findUniqueUuid(reject, resolve) {
        var uuid = core.generateUuid();
        core
            .objectExists(Note, utils.filterBy('uuid', uuid))
            .fork(reject, function (alreadyTaken) {
                alreadyTaken ?
                    findUniqueUuid(reject, resolve) :
                    resolve({ uuid: uuid });
            });
    }));
};

/** { uuid: String } -> Task(Error, { uuid: String }) */
var createNote = function (params) {
    return core.saveObject(Note, params, []).map(function () { return params; });
};

/** Object -> Task(Error, Note) */
module.exports = compose(chain(createNote), chooseUuid);
