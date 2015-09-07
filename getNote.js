/**
 * @api {get} /note/:identifier Retrieve a note
 * @apiName getNote
 * @apiGroup Note
 * @apiVersion 0.2.0
 * @apiDescription Retrieve a note from the backend. To do such a thing, you can supply either a
 * valid `uuid` or a `5-digit code`. The server will answer with the given note if found, in a nice
 * serialized JSON format.
 *
 * @apiParam {string} identifier The given note's uuid or corresponding digit code
 *
 * @apiSuccess {string} result The return The requested note.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "uuid": "8d2640e2-5542-11e5-885d-feff819cdc9f",
 *          "content": "Patate"
 *          "className": "Note",
 *          "createdAt": "2015-09-07T15:57:58.262Z",
 *          "objectId": "dBQoiGWB4s",
 *          "updatedAt": "2015-09-07T15:57:58.262Z"
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
