require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var core = require('cloud/utils/core');

var filterByExpired = function (query) { return query.lessThan('expiresAt', Date.now()); };

Parse.Cloud.job("flushSync", function (req, status) {
    core.getObjects(Sync, filterByExpired)
        .chain(function (expiredSyncs) {
            return (new Task(function (reject, resolve) {
                Parse.Object.destroyAll(expiredSyncs).then(resolve.bind(null, CONFIG.JOBS.SUCCESS), reject);
            })).rejectedMap(function () { return CONFIG.JOBS.ERROR; });
        })
        .fork(status.error.bind(status), status.success.bind(status));
});
