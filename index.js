import sweet from 'sweet.js';

const macros = `
macro rlet {
  rule {
    $varname:ident = $expr:expr
  } => {
    rlet $varname ( ) = $expr
  }

  case {
    _ $varname:ident ( $deps:ident (,) ... ) = $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $s = [makeIdent('__' + randLetter + Date.now() % 10000, #{$varname})];
    randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    letstx $var = [makeIdent('__' + randLetter + (1 + Date.now() % 10000), #{$varname})];
    letstx $dots = [makePunc('...', #{$varname})];
    return #{
      let $s = new Signal(function() {
        $( $deps read ; ) ... { return $expr; }
      });
      let $varname = macro {
        case { _ = $next:expr } => {
          return #{ $s.push($next) };
        }
        case { $v read ; $rest $dots } => {
          letstx $it = [makeIdent(unwrapSyntax(#{$var}), null)];
          return #{
            (function ($it) {
              $rest $dots
            })($s.read());
          };
        }
        rule { subscribe $update:ident ; } => {
          $s.onUpdate($update);
        }
        case { _ } => {
          letstx $it = [makeIdent(unwrapSyntax(#{$var}), null)];
          return #{$it};
        }
      }
      let update = function() { $s.update(); };
      $( $deps subscribe update ; ) ...
    }
  }
}

macro subscribe {
  rule { ( $deps (,) ... ) { $block ... } } => {
    let update = function() {
      $( $deps read ; ) ...
      $block ...
    };
    $( $deps subscribe update ; )  ...
  }
}`;

function Signal(expr) {
  this.subscribers = [];
  this.expr = expr;
  this.last = expr();
}

Signal.prototype.push = val => {
  this.last = val;
  this.subscribers.forEach(s => s());
};

Signal.prototype.read = cb => {
  return cb(this.last);
};

Signal.prototype.onUpdate = subscriber => {
  this.subscribers.push(subscriber);
};

Signal.prototype.update = () => {
  this.last = this.expr();
  this.subscribers.forEach(s => s());
};

export default function run(src) {
  const expanded = sweet.compile(macros + src);
  console.log(expanded.code);
  eval(expanded.code);
}
