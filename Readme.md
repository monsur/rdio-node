# Rdio-Node

Rdio-Node is an Rdio API client library for Node.js. It is based off of the Rdio API Python client (https://github.com/rdio/rdio-python).

## How to install

    npm install rdio-node

## How to use

```js
// Include the library
var Rdio = require('rdio-node').Rdio;

// Create a new instance
var r = new Rdio({
  consumerKey: '<YOUR RDIO KEY>'
, consumerSecret: '<YOUR RDIO SECRET>'
});

// Make an unauthenticated request
r.makeRequest('search', {query: 'Archers of Loaf', types: 'Artist'}, function() {
  console.log(arguments);
});

// Make an authenticated request (with OAuth flow)
r.beginAuthentication(function(error, loginUrl) {
    if (error) {
      console.log(error);
      return;
    }

    var stdin = process.stdin, stdout = process.stdout;
 
    stdin.resume();
    stdout.write('visit: ' + loginUrl + '\nEnter your pin: ');
 
    stdin.once('data', function(data) {
      data = data.toString().trim();
      r.completeAuthentication(data, function() {

        // Notice how unlike the call to 'search' above,
        // 'getPlaylists' doesn't need any parameters.
        r.makeRequest('getPlaylists', function() {
          console.log(arguments[1]);
          process.exit();
        });
      });
    });
  }
);
```
## Storing OAuth-related information

The library includes a MemoryStore object that stores OAuth request and access tokens in memory.  You can pass in your own datastore object if you wish to store this data elsewhere.  Just follow the same interface as MemoryStore, and pass it to the Rdio constructor as the 'dataStore' parameter.  Note that the datastore currently does not support async operations (i.e. it doesn't take callbacks), so all loading/saving of data should be done outside the Rdio object.

