import sweet from 'sweet.js';

// could use webpacke file loader but that does not work for mocha
let macros = `
macro rlet {
  case {
    _ $varname:ident = subscribe($deps:ident (,) ... ) initially ($init:expr) $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $s = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    return #{
      let $varname = macro {
        rule { = $next:expr } => {
          $s.push($next)
        }
        rule { subscribe $update:ident ; } => {
          $s.onUpdate($update);
        }
        rule { } => { $s.read() }
      }
      let $s = new Signal(function() { return $expr; }, $init);
      $( $deps subscribe $s ; ) ...
    }
  }

  case {
    _ $varname:ident = subscribe($sub:ident (,) ... , $sube:expr $rest ... ) initially($init:expr) $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $tmp = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    return #{
      rlet $tmp;
      ($sube)(function(w) { $tmp = w; })
      rlet $varname = subscribe($sub (,) ... , $tmp $rest ...) initially($init) $expr
    };
  }

  case {
    _ $varname:ident = subscribe($sube:expr $rest ... ) initially($init:expr) $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $tmp = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    return #{
      rlet $tmp;
      ($sube)(function(w) { $tmp = w; })
      rlet $varname = subscribe($tmp $rest ...) initially($init) $expr
    };
  }

  rule {
    $varname:ident = initially($init ...) $expr:expr
  } => {
    rlet $varname = subscribe() initially($init ...) $expr
  }

  rule {
    $varname:ident = subscribe($sub ...) $expr:expr
  } => {
    rlet $varname = subscribe($sub ...) initially(null) $expr
  }

  rule {
    $varname:ident = $expr:expr
  } => {
    rlet $varname = initially(null) $expr
  }

  rule {
    $varname:ident
  } => {
    rlet $varname = null
  }
}

macro subscribe {
  rule {
    ( $deps ... ) { $stmt ... }
  } => {
    rlet x = subscribe ( $deps ... ) (function() { $stmt ... })()
  }
}
`;

class Signal {
  constructor(expr, initial) {
    this.subscribers = [];
    this.expr = expr;
    this.last = initial;
  }

  push(val) {
    this.last = val;
    this.subscribers.forEach(s => s.update());
  }

  read() {
    return this.last;
  }

  onUpdate(subscriber) {
    this.subscribers.push(subscriber);
  }

  update() {
    this.last = this.expr();
    this.subscribers.forEach(s => s.update());
  }
}

export default function run(src) {
  const expanded = sweet.compile(macros + src);
  eval(expanded.code);
}
