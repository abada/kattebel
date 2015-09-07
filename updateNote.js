/**
 * @api {put} /note/:uuid/update Update a note
 * @apiName updateNote
 * @apiGroup Note
 * @apiVersion 0.1.0
 *
 * @apiParam {string} uuid The given note's uuid
 * @apiParam {string} content The new note's content
 *
 * @apiSuccess {string} result The return the note as it has been saved as a serialized JSON format.
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
