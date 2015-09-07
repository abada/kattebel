require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var core = require('cloud/utils/core'),
    utils = require('cloud/utils/kattebel');

var chooseSyncCode = function (note) {
    return (new Task(function findUniqueSyncCode(reject, resolve) {
        var code = Math.floor(Math.random() * 100000);
        core.objectExists(Sync, utils.filterBy('syncCode', code))
            .fork(reject, function (alreadyTaken) {
                alreadyTaken ?
                    findUniqueSyncCode(reject, resolve) :
                    resolve({ syncCode: code, note: note });
            });
    }));
};

var withLeadingZero = function (code) {
    var str = "00000" + code;
    return str.substring(str.length - 5, str.length);
};

var createSync = function (params) {
    params.expiresAt = Date.now() + (CONFIG.SYNC_CODE_DELAY + CONFIG.SYNC_CODE_LIFETIME) * 1000;
    return core.saveObject(Sync, params, []).map(function () { return {
        expiresAt: params.expiresAt,
        syncCode: withLeadingZero(params.syncCode)
    }});
};

/** Object -> Task(Error, Note) */
module.exports = compose(
    chain(createSync),
    chain(chooseSyncCode),
    core.TaskFromEither,
    map(core.getObject(Note)),
    map(utils.filterBy('uuid')),
    core.getProperty('uuid'));

