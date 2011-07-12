var http = require('http')
  , OAuth = require('oauth').OAuth
  , querystring = require('querystring')
  , url = require('url');

// TODO: Create a datastore interface.
// TODO: Debug why HMAC-SHA1 doesn't work.

exports.Rdio = function(options) {
  options = options || {};

  this.endpoint_ = options.endpoint || 'http://api.rdio.com/1/';
  this.dataStore_ = options.dataStore || {};

  var consumerKey = options.consumerKey;
  var consumerSecret = options.consumerSecret;
  var requestToken = options.requestToken || 'http://api.rdio.com/oauth/request_token';
  var accessToken = options.accessToken || 'http://api.rdio.com/oauth/access_token';
  var oauthVersion = options.oauthVersion || '1.0';
  var authorizeCallback = options.authorizeCallback || 'oob';
  var signatureMethod = options.signatureMethod || 'HMAC-SHA1';
  this.oa_ = new OAuth(requestToken, accessToken, consumerKey, consumerSecret, oauthVersion,
      authorizeCallback, signatureMethod);
};

exports.Rdio.prototype.authenticating = function() {
  return !!this.dataStore_['requestToken'];
};

exports.Rdio.prototype.authenticated = function() {
  return !!this.dataStore_['accessToken'];
};

exports.Rdio.prototype.beginAuthentication = function(extraParams, callback) {

  var getArgs = function(argc) {
    var args = {
      extraParams: null
    , callback: null
    };

    if (argc.length == 1) {
      var paramType = typeof(argc[0]);
      if (paramType == 'function') {
        args.callback = argc[0];
      } else {
        args.extraParams = argc[0];
      }
    } else if (argc.length >= 2) {
      args.extraParams = argc[0];
      args.callback = argc[1];
    }

    return args;
  };

  var args = getArgs(arguments);
  extraParams = args.extraParams || {};
  callback = args.callback || function() {};

  if (this.authenticating() || this.authenticated()) {
    this.logout();
  }

  var that = this;
  var callbackWrapper = function(error, oauthToken, oauthTokenSecret, results) {
    if (error) {
      callback.call({}, error);
      return;
    }

    var requestToken = {
      oauthToken: oauthToken
    , oauthTokenSecret: oauthTokenSecret
    };
    that.dataStore_['requestToken'] = requestToken;

    var authorizeUrl = results.login_url + '?oauth_token=' + oauthToken;
    callback.call({}, null, authorizeUrl);
  };

  this.oa_.getOAuthRequestToken(extraParams, callbackWrapper);
};

exports.Rdio.prototype.completeAuthentication = function(oauthVerifier, callback) {
  if (!this.authenticating()) {
    throw new Error('Not authenticating');
  }

  callback = callback || function() {};

  var that = this;
  var callbackWrapper = function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      callback.call({}, error);
      return;
    }

    var accessToken = {
      oauthAccessToken: oauthAccessToken
    , oauthAccessTokenSecret: oauthAccessTokenSecret
    };
    that.dataStore_['accessToken'] = accessToken;

    callback.call({}, null, accessToken);
  };

  var requestToken = this.dataStore_['requestToken'];
  this.oa_.getOAuthAccessToken(requestToken.oauthToken, requestToken.oauthTokenSecret,
      oauthVerifier, callbackWrapper);
};

exports.Rdio.prototype.logout = function() {
  delete this.dataStore_['requestToken'];
  delete this.dataStore_['accessToken'];
};

exports.Rdio.prototype.callMethod = function(method, params, callback) {

  var getArgs = function(argc) {
    var args = {
      method: null
    , params: null
    , callback: null
    };

    if (argc.length >= 1) {
      args['method'] = argc[0];
    }
    if (argc.length == 2) {
      var paramType = typeof(argc[1]);
      if (paramType === 'function') {
        args['callback'] = argc[1];
      } else {
        args['params'] = argc[1];
      }
    } else if (argc.length >= 3) {
      args['params'] = argc[1];
      args['callback'] = argc[2];
    }

    return args;
  };

  var args = getArgs(arguments);
  params = args.params || {};
  params['method'] = args.method; 
  callback = args.callback || function() {};

  var callbackWrapper = function(error, results) {
    callback.call({}, error, results ? JSON.parse(results) : results);
  };

  var accessToken = this.dataStore_['accessToken'] || {};
  var oauthToken = accessToken.oauthAccessToken || '';
  var oauthTokenSecret = accessToken.oauthAccessTokenSecret || '';

  this.oa_.post(this.endpoint_, oauthToken, oauthTokenSecret, querystring.stringify(params),
      'application/x-www-form-urlencoded', callbackWrapper);
};

