import sweet from 'sweet.js';

const macros = `
macro rlet {
  case {
    _ $varname:ident = initially ($init:expr) subscribe($deps:ident (,) ... ) = $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $s = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $var = [makeIdent('__' + randLetter + (1 + Date.now() % 10000), #{$varname})];
    letstx $dots = [makePunc('...', #{$varname})];
    return #{
      let $s = new Signal(function() {
        $( $deps read ; ) ... return $expr;
      });
      let $varname = macro {
        rule { = $next:expr } => {
          $s.push($next)
        }
        rule { read ; $rest $dots } => {
          macro $var {
            rule { } => { $s.read() }
          }
          $rest $dots
        }
        rule { subscribe $update:ident ; } => {
          $s.onUpdate($update);
        }
        rule { } => { $var }
      }
      let update = function() { $s.update(); };
      $( $deps subscribe update ; ) ...
    }
  }

  rule {
    $varname:ident = $expr:expr
  } => {
    rlet $varname = initially(null) $expr
  }

  rule {
    $varname:ident = initially($init ...) $expr:expr
  } => {
    rlet $varname = initially($init ...) subscribe() $expr
  }

  rule {
    $varname:ident = subscribe($sub ...) $expr:expr
  } => {
    rlet $varname = initially(null) subscribe($sub ...) $expr
  }
}`;

class Signal {
  constructor(expr) {
    this.subscribers = [];
    this.expr = expr;
    this.last = expr();
  }

  push(val) {
    this.last = val;
    this.subscribers.forEach(s => s());
  }

  read() {
    return this.last;
  }

  onUpdate(subscriber) {
    this.subscribers.push(subscriber);
    subscriber();
  }

  update() {
    this.last = this.expr();
    this.subscribers.forEach(s => s());
  }
}

export default function run(src) {
  const expanded = sweet.compile(macros + src);
  eval(expanded.code);
}
