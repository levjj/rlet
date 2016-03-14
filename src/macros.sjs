macro rlet {
  case {
    _ $varname:ident = subscribe($deps:ident (,) ... ) initially ($init:expr) $expr:expr
  } => {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    var self = '__S' + randLetter + Date.now() % 10000;
    letstx $s = [makeIdent(self, #{$varname})];
    letstx $depv... = window.globalVars(self, localExpand(#{$expr}))
      .map(function(idep) { return makeIdent(idep, #{$varname}); });
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
      var $s = new Signal(function() { "use imm"; return $expr; }, $init);
      $( $deps subscribe $s ; ) ...
      $( $depv.onUpdate($s) ; ) ...
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
    $varname:ident = initially($init ...) subscribe($sub ... ) $expr:expr
  } => {
    rlet $varname = subscribe($sub ... ) initially($init ...) $expr
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
    rlet x = subscribe ( $deps ... ) (function() { "use imm!"; $stmt ... })()
  }
}
