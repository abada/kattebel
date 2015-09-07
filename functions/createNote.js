require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var utils = require('cloud/utils/core');

var filterByUuid = curry(2, function (uuid, query) {
    return query.equalTo('uuid', uuid);

});

var chooseUuid = function () {
    return (new Task(function findUniqueUuid(reject, resolve) {
        var uuid = utils.generateUuid();
        utils
            .objectExists(Note, filterByUuid(uuid))
            .fork(reject, function (alreadyTaken) {
                alreadyTaken ?
                    findUniqueUuid(reject, resolve) :
                    resolve({ uuid: uuid });
            });
    }));
};

var createNote = function (params) {
    return utils.saveObject(Note, params, [])
        .map(function () { return params; });
};


/** Object -> Task(Error, Note) */
module.exports = compose(
    chain(createNote),
    chooseUuid);
