macro rlet {
  case {
    _ $varname:ident;
  } => {
    letstx $dots = [makePunc('...', null)];
    return #{
      macro $varname {
        rule { = $e $dots ; } => { {
          macro $varname { rule {} => { 2 } }
          $e $dots
        } }
        rule {} => { 1 }
      }
    }
  }
}

rlet a;
alert(a);
a = 1 + alert(a) + 1;
alert(a);
