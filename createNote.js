/**
 * @api {get} /note/new Request a new uuid
 * @apiName createNote
 * @apiGroup Note
 * @apiVersion 0.1.0
 * @apiDescription Test
 *
 * @apiSuccess {string} result The uuid in a JSON format response.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *          "uuid": "8d2640e2-5542-11e5-885d-feff819cdc9f"
 *      }
 *
 * @apiError (5xx) 500 Internal error, something unexpected went wrong with the server
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500
 *     "Server isn't responding for an unknown reason; likely to be aliens taking control."
 */
