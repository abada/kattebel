/**
 * @api {get} /note/:uuid/sync Request a new sync session
 * @apiName requestSync
 * @apiGroup Note
 * @apiVersion 0.1.1
 * @apiDescription Use this to create a new synchronisation session. This means that for a short
 * delay, the `syncCode` gave by the server might be used as a direct reference to the note.
 *
 * @apiParam {string} uuid The given note's uuid
 *
 * @apiSuccess {string} result The digit code bound to the note and end date for the session.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "syncCode": "81735",
 *          "expiresAt": "2016-09-14T14:14:14.14Z"
 *      }
 *
 * @apiError (5xx) 500 Internal error, something unexpected went wrong with the server
 * @apiError (5xx) 550 Unknown note, the given note does not exist or the code has expired
 * @apiError (5xx) 554 Invalid API key, at least one api key is missing or is invalid
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500
 *     "Server isn't responding for an unknown reason; likely to be aliens taking control."
 */
