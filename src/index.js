import {read, parse, Token} from 'sweet.js/lib/parser';
import {expand, expandModule} from 'sweet.js/lib/expander';
import {analyze} from 'escope';
import {replace} from 'estraverse';
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

function immVar(identifier) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'IMM'
    },
    arguments: [identifier]
  };
}

function rewrite(ast) {
  const scopeManager = analyze(ast);
  const globalScope = scopeManager.globalScope;
  let scope = globalScope;
  return replace(ast, {
    enter: function enter(node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        const prevImmutable = scope.isImmutable;
        scope = scopeManager.acquire(node);
        scope.isImmutable = prevImmutable;
      }
      if (node.type === 'ExpressionStatement' &&
          node.expression.type === "Literal" &&
          (/^use imm!?$/).test(node.expression.value)) {
        scope.isImmutable = node.expression.value === 'use imm';
        this.remove();
      }
      if (node.type === "Literal" &&
          parent.type === 'ExpressionStatement' &&
          (/^use imm!?$/).test(node.value)) {
        scope.isImmutable = node.value === 'use imm';
        this.remove();
      }
      return node;
    },
    leave: function leave(node, parent) {
      // Replace variables (ignore identifiers used as property names)
      if (node.type === 'Identifier' &&
          (parent.type !== 'MemberExpression' ||
           parent.computed || parent.property !== node)) {
        const ref = scope.resolve(node);
        const isGlobal = !ref || !ref.resolved || ref.resolved.scope === globalScope;
        if (scope.isImmutable && (isGlobal || !ref.resolved.scope.isImmutable)) {
          // A reference to a global (or surrounding, mutable) var, gets wrapped
          return immVar(node);
        }
      }
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        scope = scope.upper;
      }
      return node;
    }
  });
}

export function genR(src) {
  window.globalVars = globalVars;
  const stxcaseCtx = expandModule(read(stxcaseModule));
  const expanded = expand(read(macros + src), [stxcaseCtx]);
  const rewritten = rewrite(parse(expanded));
  return `(function() {
    ${signal}
    ${generate(rewritten)}
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
