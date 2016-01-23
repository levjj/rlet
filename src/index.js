import {read, parse, Token} from 'sweet.js/lib/parser';
import {expand, expandModule} from 'sweet.js/lib/expander';
import {analyze} from 'escope';
import {generate} from 'escodegen';

import stxcaseModule from 'raw!sweet.js/macros/stxcase.js';
import macros from 'raw!./macros.sjs';
import signal from 'raw!./signal.js';

function globalVars(self, stx) {
  const estx = [...expand(stx), {token: {
    type: Token.EOF,
    range: [0,0]
  }}];
  const ast = parse(estx);
  const globalScope = analyze(ast).globalScope;
  return globalScope.through
    .map(({identifier: {name: vname}}) => vname)
    .filter(vname => vname.indexOf("__S") === 0 && vname != self);
}

export function genR(src) {
  window.globalVars = globalVars;
  const stxcaseCtx = expandModule(read(stxcaseModule));
  const expanded = expand(read(macros + src), [stxcaseCtx]);
  return `(function() {
    ${signal}
    ${generate(parse(expanded))}
  })()`;
}

export function genHtml(html, src) {
  const code = genR(src);
  return `<html>
<head>
  <title>rlet: Live Page</title>
</head>
<body>
${html}
<script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
<script>
$(function() {
${code}
});
</script>
</html>`;
}

export function evalR(src) {
  eval(genR(src));
}
