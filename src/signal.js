function Signal(expr, initial) {
  this.subscribers = [];
  this.expr = expr;
  this.last = initial;
}

Signal.prototype.push = function push(val) {
  this.last = val;
  let toUpdate = [].concat(this.subscribers);
  while (toUpdate.length > 0) {
    var next = toUpdate.shift();
    toUpdate = toUpdate.concat(next.update());
    // keep only *last* occurance of dependency
    toUpdate = toUpdate.filter(function(sig, idx) {
      return idx === toUpdate.lastIndexOf(sig);
    });
  }
}

Signal.prototype.read = function read() {
  return this.last;
}

Signal.prototype.onUpdate = function onUpdate(subscriber) {
  this.subscribers.push(subscriber);
}

Signal.prototype.update = function update() {
  this.last = this.expr();
  return this.subscribers;
}

function interval(n) {
  return function(cb) {
    setInterval(cb, n);
  };
}
