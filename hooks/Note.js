require('cloud/utils/configure')(this);
const CONFIG = require('cloud/config');
var validate = require('cloud/utils/validations');

Parse.Cloud.beforeSave(Note, function (req, res) {
    var note = req.object;
    note.set('content', note.get('content') || "");
    validate.all([
        { type: 'string', field: 'content', max: 5000, error: CONFIG.ERRORS.INVALID_CONTENT }
    ], note).fork(function (e) {
        res.error({ entity: Note.entityName, code: e.code, message: e.error });
    },res.success);
});
