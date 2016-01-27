import {evalR} from '../src/index';
import {expect} from 'chai';

describe('functional rlet evaluation', () => {
  it('should suppress global variable assignments', () => {
    const src = `
      rlet b;
      rlet c = subscribe(b) (a = true);`;
    expect(() => evalR(src)).to.throw(ReferenceError);
  });

  it('should suppress surrounding variable assignments', () => {
    const src = `
      var a;
      rlet b;
      rlet c = subscribe(b) (a = true);`;
    expect(() => evalR(src)).to.throw(ReferenceError);
  });

  it('should suppress field updates', () => {
    const src = `
      var a = {};
      rlet b;
      rlet c = subscribe(b) (a.prop = true);
      window.g = function() { b = true };`;
    evalR(src);
    expect(() => window.g()).to.throw(TypeError);
  });
});
