/**
 * @api {get} /note/new Request a new uuid
 * @apiName createNote
 * @apiGroup Note
 * @apiVersion 0.1.0
 * @apiDescription Use this endpoint to create a new empty note in the server. As a response, the
 * server will gives you a cooresponding uuid in a serialized JSON response.
 *
 * @apiSuccess {string} result The created note's uuid.
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
