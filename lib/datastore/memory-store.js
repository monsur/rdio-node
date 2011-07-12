exports.MemoryStore = function() {
  this.store_ = {};
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

