import rlet from '../src/index';
import {expect} from 'chai';

describe('functional rlet evaluation', () => {
  it('should suppress global variable assignments', () => {
    const src = `
      var a;
      rlet b;
      rlet c = subscribe(b) (a = true);
      global.g = function() { b = true };
      subscribe(a) { global.f(a); }`;
    rlet(src);
    expect(() => global.g())
      .to.throw(new Error('State updates in reactive variables not allowed'));
  });

  it('should suppress field updates', () => {
    const src = `
      var a = {};
      rlet b;
      rlet c = subscribe(b) (a.prop = true);
      global.g = function() { b = true };
      subscribe(a) { global.f(a); }`;
    rlet(src);
    expect(() => global.g())
      .to.throw(new Error('State updates in reactive variables not allowed'));
  });
});
