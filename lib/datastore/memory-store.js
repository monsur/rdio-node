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

exports.MemoryStore = function(opt_store) {
  this.store_ = opt_store || {};
};

exports.MemoryStore.parse = function(strInput) {
  var data = strInput ? JSON.parse(strInput) : null;
  return new exports.MemoryStore(data);
};

exports.MemoryStore.prototype.get = function(key) {
  return this.store_[key];
};

exports.MemoryStore.prototype.set = function(key, val) {
  this.store_[key] = val;
};

exports.MemoryStore.prototype.remove = function(key) {
  delete this.store_[key];
};

exports.MemoryStore.prototype.removeAll = function() {
  this.store_ = {};
}

exports.MemoryStore.prototype.stringify = function() {
  return JSON.stringify(this.store_);
};

