// Copyright (c) 2011 Monsur Hossain <http://monsur.hossa.in>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var fs = require('fs')
  , MemoryStore = require('./memory-store').MemoryStore;

exports.InsecureFileStore = function(opt_filename) {
  this.filename_ = opt_filename || 'filestore.txt';
  this.store_ = new MemoryStore();
};

exports.InsecureFileStore.prototype.get = function(key) {
  return this.store_.get(key);
};

exports.InsecureFileStore.prototype.set = function(key, val) {
  this.store_.set(key, val);
};

exports.InsecureFileStore.prototype.remove = function(key) {
  this.store_.remove(key);
};

exports.InsecureFileStore.prototype.removeAll = function() {
  this.store_.removeAll();
};

exports.InsecureFileStore.prototype.load = function(callback) {
  callback = callback || function() {};
  var that = this;
  fs.readFile(this.filename_, 'utf8', function(error, data) {
    if (error) {
      if (error.errno != 2 || error.code != 'ENOENT') {
        // Ignore file not found errors.
        callback.call({}, error);
      }
    }

    that.store_ = MemoryStore.parse(data);
    callback.call({});
  });
};

exports.InsecureFileStore.prototype.write = function(callback) {
  callback = callback || function() {};
  fs.writeFile(this.filename_, this.store_.stringify(), 'utf8', callback);
};

