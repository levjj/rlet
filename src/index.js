import sweet from 'sweet.js';
import _ from 'lodash';
import {parse} from 'esprima';
import {analyze} from 'escope';
import {generate} from 'escodegen';

// could use webpacke file loader but that does not work for mocha
let macros = `
macro rlet {
  case {
    _ $varname:ident = subscribe($deps:ident (,) ... ) initially ($init:expr) $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $s = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    global.globalVars(localExpand(#{$expr}));
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
    let toUpdate = [...this.subscribers];
    while (toUpdate.length > 0) {
      const [next, ...remaining] = toUpdate;
      toUpdate = [...remaining, ...next.update()];
      // keep only *last* occurance of dependency
      toUpdate = _.chain(toUpdate).reverse().uniq().reverse().value();
    }
  }

  read() {
    return this.last;
  }

  onUpdate(subscriber) {
    this.subscribers.push(subscriber);
  }

  update() {
    this.last = this.expr();
    return this.subscribers;
  }
}

function globalVars(stx) {
  const vars = [];
  const ast = sweet.parse(global.expanded);
  const scopeManager = analyze(ast);
  const globalScope = scopeManager.globalScope;
  for (const {identifier: {name: global}} of globalScope.through) {
    if (global !== 'Math') {
      vars.push(global);
    }
  }
  console.log(vars);
}

export default function run(src) {
  global.globalVars = globalVars;
  const expanded = sweet.compile(macros + src);
  eval(expanded.code);
}
