/**
 * @api {put} /note/:uuid/update Update a note
 * @apiName updateNote
 * @apiGroup Note
 * @apiVersion 0.1.1
 * @apiDescription Update the note's content in the server-side. The server will respond with the
 * note as it has been saved, but not necessarily the last version of the note (if several updates
 * are made in the same interval of time).
 *
 * @apiParam {string} uuid The given note's uuid
 * @apiParam {string} content The new note's content
 *
 * @apiSuccess {string} result The return the note as it has been saved.
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
 * @apiError (5xx) 553 Invalid note, the content is invalid (too long)
 * @apiError (5xx) 554 Invalid API key, at least one api key is missing or is invalid
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500
 *     "Server isn't responding for an unknown reason; likely to be aliens taking control."
 */
