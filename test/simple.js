import rlet from '../src/index';
import {expect} from 'chai';

describe('rlet', () => {
  it('should not call subscribers without updates', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a;
      subscribe(a, b) { global.f(); }`;
    global.f = () => {
      done("should not be called");
    };
    rlet(src);
    setTimeout(() => done(), 100);
  });

  it('should support imperative updates', (done) => {
    const src = `
      rlet a;
      global.g = function() { a = true };
      subscribe(a) { global.f(a); }`;
    global.f = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    global.g();
  });

  it('should support updates and references', (done) => {
    const src = `
      rlet a;
      global.g = function() { a = a ? false : true };
      subscribe(a) { global.f(a); }`;
    let first = true;
    global.f = (v) => {
      if (first) {
        expect(v).to.be.equal(true);
        first = false;
        global.g();
      } else {
        expect(v).to.be.equal(false);
        done();
      }
    };
    rlet(src);
    global.g();
  });

  it('should support reactive updates', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a + 1;
      global.g = function() { a = 5 };
      subscribe(b) { global.f(b); }`;
    global.f = (v) => {
      expect(v).to.be.equal(6);
      done();
    };
    rlet(src);
    global.g();
  });

  it('should set up dependencies automatically', (done) => {
    const src = `
      rlet a = 3;
      rlet b = a + 1;
      global.g = function() { a = 5 };
      subscribe(b) { global.f(b); }`;
    global.f = (v) => {
      expect(v).to.be.equal(6);
      done();
    };
    rlet(src);
    global.g();
  });

  it('should support subscriptions to other reactive variables', (done) => {
    const src = `
      rlet a = 3;
      rlet b = subscribe(a) true;
      global.g = function() { a = 5 };
      subscribe(b) { global.f(b); }`;
    global.f = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    global.g();
  });

  it('should support subscriptions with callbacks', (done) => {
    const src = `
      global.f = null;
      global.g = function(cb) { global.f = cb; }
      rlet a = subscribe(global.g) true;
      subscribe(a) { global.h(a); }`;
    global.h = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    global.f();
  });

  it('should support folding', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) initially(0) b + 1;
      global.g = function() { a = true; };
      subscribe(b) { global.f(b); }`;
    let first = true;
    global.f = (v) => {
      if (first) {
        expect(v).to.be.equal(1);
        first = false;
        global.g();
      } else {
        expect(v).to.be.equal(2);
        done();
      }
    };
    rlet(src);
    global.g();
  });

  it('prevents glitches', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a + 1;
      global.g = function() { a = 1; };
      subscribe(a, b) { global.f(a + b); }`;
    let first = true;
    global.f = (v) => {
      expect(v).to.be.equal(3);
      if (first) {
        first = false;
        done();
      } else {
        done(new Error("done called twice"));
      }
    };
    rlet(src);
    global.g();
  });
});
