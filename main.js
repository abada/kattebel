/* --------- INITIALISATION -------- */
const CONFIG = require('cloud/config');

var express = require('express'),
    middleware = require('cloud/utils/core').toMiddleware,
    app = express();

/* --------- CONVENIENCY && SECURITY --------- */
app.use(express.bodyParser());
app.use(require('cloud/functions/ensureAPIKeys'));

/* --------- API ---------- */
app.get('/note/new', middleware(require('cloud/functions/createNote')));
app.get('/note/:identifier', middleware(require('cloud/functions/getNote')));
app.get('/note/:uuid/sync', middleware(require('cloud/functions/requestSync')));
app.put('/note/:uuid/update', middleware(require('cloud/functions/updateNote')));
app.post('/note/:uuid/update', middleware(require('cloud/functions/updateNote')));

/* --------- HANDLE ERRORS -------- */
app.use(function(res, res, next) {
    next({
        code: CONFIG.CODES.INVALID_REQUEST,
        message: CONFIG.ERRORS.INVALID_REQUEST
    });
});

app.use(function (error, req, res, next) { res.status(+error.code).send(error.message); });

/* ---------- HOOKS --------- */
require('cloud/hooks/Note');

/* ---------- JOBS --------- */
require('cloud/jobs/flushSync');

/* ------- YOLO ------- */
app.listen();
