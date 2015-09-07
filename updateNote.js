/**
 * @api {put} /note/:uuid/update Update a note
 * @apiName updateNote
 * @apiGroup Note
 * @apiVersion 0.1.0
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
 *      }
 *
 * @apiError (5xx) 500 Internal error, something unexpected went wrong with the server
 * @apiError (5xx) 501 Unknown note, the given note does not exist
 * @apiError (5xx) 502 Invalid note, the content is invalid (too long)
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500
 *     "Server isn't responding for an unknown reason; likely to be aliens taking control."
 */
