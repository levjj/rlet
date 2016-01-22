import {read, parse, Token} from 'sweet.js/lib/parser';
import {expand, expandModule} from 'sweet.js/lib/expander';
import _ from 'lodash';
import {analyze} from 'escope';
import {generate} from 'escodegen';
import macros from 'raw!./macros.sjs';
import stxcaseModule from 'raw!sweet.js/macros/stxcase.js';

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

function globalVars(self, stx) {
  const estx = [...expand(stx), {token: {
    type: Token.EOF,
    range: [0,0]
  }}];
  const ast = parse(estx);
  const globalScope = analyze(ast).globalScope;
  return globalScope.through
    .map(({identifier: {name: vname}}) => vname)
    .filter(vname => _.startsWith(vname, "__S") && vname != self);
}

export default function run(src) {
  window.globalVars = globalVars;
  const stxcaseCtx = expandModule(read(stxcaseModule));
  const expanded = expand(read(macros + src), [stxcaseCtx]);
  const code = generate(parse(expanded));
  console.log(code)
  eval(code);
}
