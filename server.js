/*
const http = require('http');

// Create an instance of the http server to handle HTTP requests
let app = http.createServer((req, res) => {
    // Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // Send back a response and end the connection
    res.end('Hello World!\n');
});

// Start the server on port 3000
app.listen(3000, '127.0.0.1');
console.log('Node server running on port 3000');
*/

var fs = require('fs');
var http = require('http');

const PORT = 8080;

http.createServer(function (req, res) {
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(PORT);

// Reference: https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/

// Run with `node server.js`.
console.log(`Server started on port ${PORT}.`);
