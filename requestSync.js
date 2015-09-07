/**
 * @api {get} /note/:uuid/sync Request a new sync session
 * @apiName requestSync
 * @apiGroup Note
 * @apiVersion 0.1.0
 *
 * @apiParam {string} uuid The given note's uuid
 *
 * @apiSuccess {string} result The digit code bound to the note and end date for the session in a
 * serialized JSON format.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "syncCode": "81735",
 *          "expiresAt": "2016-09-14T14:14:14.14Z"
 *      }
 *
 * @apiError (5xx) 500 Internal error, something unexpected went wrong with the server
 * @apiError (5xx) 501 Unknown note, the given note does not exist
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500
 *     "Server isn't responding for an unknown reason; likely to be aliens taking control."
 */
