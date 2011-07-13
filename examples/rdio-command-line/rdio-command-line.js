var RdioClient = require('../../lib/rdio-node').Rdio;
var FileStore = require('../../lib/datastore/insecure-file-store').InsecureFileStore;

// A list of methods that requires authentication.
// This list should be kept in sync with
// http://developer.rdio.com/docs/read/rest/Methods
var AUTH_METHODS = [
  'addToCollection'
, 'addFriend'
, 'addToPlaylist'
, 'createPlaylist'
, 'currentUser'
, 'deletePlaylist'
, 'getObjectFromShortCode'
, 'getObjectFromUrl'
, 'getPlaylists'
, 'removeFriend'
, 'removeFromCollection'
, 'removeFromPlaylist'
, 'setPlaylistCollaborating'
, 'setPlaylistCollaborationMode'
, 'setPlaylistFields'
, 'setPlaylistOrder'
];

function getArgs(argv) {
  var args = {};
  args.params = {};

  for (var i = 0; i < argv.length; i++) {
    if (i < 2) {
      // skip 'node' and program name.
      continue;
    }

    var arg = argv[i];
    if (arg.indexOf('-') === 0) {
      arg = arg.substr(arg.indexOf('--') === 0 ? 2 : 1);
      if (arg == 'help') {
        args['help'] = true;
      } else if (arg == 'reset') {
        args['reset'] = true;
      } else if (arg == 'consumerKey') {
        args['consumerKey'] = argv[++i];
      } else if (arg == 'consumerSecret') {
        args['consumerSecret'] = argv[++i];
      } else {
        args.params[arg] = argv[++i];
      }
    } else if (i == 2) {
      args['method'] = arg;
    }
  }

  return args;
}

function doAuth(args, rdio, dataStore) {
  rdio.beginAuthentication(function(error, loginUrl) {
    if (error) {
      log(error);
      return;
    }

    var stdin = process.stdin, stdout = process.stdout;

    stdin.resume();
    stdout.write('Authorize at ' + loginUrl + '\nThen enter your pin: ');

    stdin.once('data', function(data) {
      data = data.toString().trim();
      rdio.completeAuthentication(data, function(error) {
        if (error) {
          log(error);
          return;
        }
        doRequest(args, rdio, dataStore);
      });
    });
  });
}

function doRequest(args, rdio, dataStore) {
  rdio.makeRequest(args.method, args.params, function(error, data) {
    log(error ? error : JSON.stringify(data));
    dataStore.write(exit);
  });
}

function requiresAuth(method) {
  return AUTH_METHODS.indexOf(method) != -1;
}

function exit() {
  process.exit();
}

function log(msg) {
  console.log(msg);
}

function help() {
  log('Usage: node rdio-command-line.js [arguments]');
  log('       node rdio-command-line.js [method] [arguments]');
  log('');
  log('Options:');
  log('  [method]\t\tThe API method.');
  log('  --help\t\tThis message.');
  log('  --reset\t\tClears all saved auth information.');
  log('  --consumerKey\t\tThe API Consumer key.');
  log('  --consumerSecret\tThe API Consumer secret.');
  log('  --[KEY] [VALUE]\tThe parameter name and value for an API method parameter.');
  log('');
  log('Examples:');
  log('');
  log('  Show help message:');
  log('  node rdio-command-line.js --help');
  log('');
  log('  Run the getPlaylists method:');
  log('  node rdio-command-line.js getPlaylists --consumerKey [KEY] --consumerSecret [SECRET]');
  log('');
  log('  Run the search method (if key/secret have been specified already:');
  log('  node rdio-command-line.js search --query "Archers of Loaf" --types Artist');
  log('');
  log('  Delete any saved auth information from the filesystem:');
  log('  node rdio-command-line.js --reset');
  log('');
}

function run() {
  var args = getArgs(process.argv);

  if (args.help) {
    help();
    return;
  }

  var dataStore = new FileStore();

  if (args.reset) {
    dataStore.removeAll();
    dataStore.write(exit);
    return;
  }

  dataStore.load(function() {
    if (args.consumerKey) {
      dataStore.set('consumerKey', args.consumerKey);
    }
    if (args.consumerSecret) {
      dataStore.set('consumerSecret', args.consumerSecret);
    }

    var rdio = new RdioClient({
        consumerKey: dataStore.get('consumerKey')
      , consumerSecret: dataStore.get('consumerSecret')
      , dataStore: dataStore
    });

    if (!dataStore.get('accessToken') && requiresAuth(args.method)) {
      doAuth(args, rdio, dataStore);
    } else {
      doRequest(args, rdio, dataStore);
    }
  });
}

run();
