Kattebel API
=================

The following documentation gives a complete overview of the backend API. Each url routes are given
relatively to the main domain url `http://kattebel.parseapp.com/`. Also, the backend will deny
all requests that do not provide a valid application id and JavaScript key in its HTTP headers. A
correct request would rather include both `x-parse-application-id` and `x-parse-javascript-key`
headers with the given application keys as values. 
