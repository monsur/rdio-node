// Example that shows how to use rdio-node with Express (http://expressjs.com/).
//
// Usage: node rdio-express --consumerKey <KEY> --consumerSecret <SECRET> --port <PORT>

var express = require('express')
  , RdioLib = require('../../lib/rdio-node').Rdio
  , CookieStore = require('../../lib/datastore/cookie-store.js').CookieStore;

var app, store, rdio;

var endpoints = {
  main: 'example'
, loginBegin: 'loginBegin'
, loginEnd: 'loginEnd'
};

/** Handler for the main page that either shows data or asks the user to log in. */
function handleMain(req, res) {
  res.contentType('text/html');

  // Load the auth information from the cookie.
  store.load(req, function() {

    // Make a request to the currentUser method.
    rdio.makeRequest('currentUser', function(error, results) {
      if (error) {
        // If there was an error, ask the user to log in.
        console.log('Received error: ' + JSON.stringify(error));
        res.write('<a href="' + endpoints.loginBegin + '">Click here to log in</a>');
        res.end();
        return;
      }

      // Otherwise, show the data.
      console.log(results);
      res.send('The logged in user\'s name is ' + results.result.firstName);
    });
  });
}

/** Handler to begin the login process. */
function handleLoginBegin(req, res) {
  rdio.beginAuthentication(function(error, loginUrl) {
    if (error) {
      res.send('Error beginning request: ' + JSON.stringify(error));
      return;
    }
    res.redirect(loginUrl);
  });
}

/** Handler to end the login process. */
function handleLoginEnd(req, res) {
  rdio.completeAuthentication(req.param('oauth_verifier'), function() {
    store.write(res, function() {
      // Save the auth token to the cookie and then redirect to the main page.
      res.redirect('/' + endpoints.main);
    });
  });
}

function createServer(args) {
  app = express.createServer();

  app.get('/' + endpoints.main, handleMain);
  app.get('/' + endpoints.loginBegin, handleLoginBegin);
  app.get('/' + endpoints.loginEnd, handleLoginEnd);
 
  app.listen(args['port']);
  console.log('navigate to ' + getUrl(args['port'], endpoints.main) +
      ' to view the example.');
}

function getRdioClient(args) {
  return new RdioLib({
      consumerKey: args['consumerKey']
    , consumerSecret: args['consumerSecret']
    , authorizeCallback: getUrl(args['port'], endpoints.loginEnd)
    , dataStore: store
  });
}

function getUrl(port, path) {
  return 'http://localhost:' + port + '/' + path;
}

function getArgs(argv) {
  var returnArgs = {};
  for (var i = 0; i < argv.length; i++) {
    var key = argv[i];
    key = key.substring(2);
    var val = argv[++i];
    returnArgs[key] = val;
  }
  returnArgs['port'] = returnArgs['port'] || 3000;
  return returnArgs;
}

function setUp() {
  var args = getArgs(process.argv);
  store = new CookieStore();
  rdio = getRdioClient(args);
  createServer(args);
}

setUp();

