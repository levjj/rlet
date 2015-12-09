import rlet from '../index';
import {expect} from 'chai';

describe('rlet', () => {
  it('should support simple values', (done) => {
    const src = `rlet a = 3; subscribe(a) { global.f(a); }`;
    global.f = (v) => {
      expect(v).to.be.equal(3);
      done();
    };
    rlet(src);
  });

  it('should support imperative updates', (done) => {
    const src = `
      rlet a = 3;
      subscribe(a) { global.f(a); }
      global.g = function() { a = 5 };`;
    let first = true;
    global.f = (v) => {
      if (first) {
        expect(v).to.be.equal(3);
        global.g();
      } else {
        expect(v).to.be.equal(5);
        done();
      }
    };
    rlet(src);
  });

  it('should support reactive updates', (done) => {
    const src = `
      rlet a = 3;
      rlet b = a + 1;
      subscribe(b) { global.f(b); }`;
    global.f = (v) => {
      expect(v).to.be.equal(4);
      done();
    };
    rlet(src);
  });
});
