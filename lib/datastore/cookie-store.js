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

var MemoryStore = require('./memory-store').MemoryStore;

exports.CookieStore = function(opt_key) {
  this.key_ = opt_key || 'auth';
  this.store_ = new MemoryStore();
};

exports.CookieStore.prototype.get = function(key) {
  return this.store_.get(key);
};

exports.CookieStore.prototype.set = function(key, val) {
  this.store_.set(key, val);
};

exports.CookieStore.prototype.remove = function(key) {
  this.store_.remove(key);
};

exports.CookieStore.prototype.removeAll = function() {
  this.store_.removeAll();
};

exports.CookieStore.prototype.load = function(req, callback) {
  callback = callback || function() {};
  var cookieVal = '{}';
  var cookieStr = req.header('cookie', this.key_ + '=%7B%7D');
  var start = cookieStr.indexOf(this.key_ + '=');
  if (start != -1) {
    start = start + this.key_.length + 1;
    var end = cookieStr.indexOf(';', start);
    if (end == -1) {
      end = cookieStr.length;
    }
    cookieVal = unescape(cookieStr.substring(start, end));
  }
  this.store_ = MemoryStore.parse(cookieVal);
  callback.call({});
};

exports.CookieStore.prototype.write = function(res, callback) {
  callback = callback || function() {};
  res.cookie(this.key_, this.store_.stringify());
  callback.call({});
};

