import rlet from '../src/index';
import {expect} from 'chai';

describe('rlet', () => {
  it('should not call subscribers without updates', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a;
      subscribe(a, b) { window.f(); }`;
    window.f = () => {
      done("should not be called");
    };
    rlet(src);
    setTimeout(() => done(), 100);
  });

  it('should support imperative updates', (done) => {
    const src = `
      rlet a;
      window.g = function() { a = true };
      subscribe(a) { window.f(a); }`;
    window.f = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    window.g();
  });

  it('should support updates and references', (done) => {
    const src = `
      rlet a;
      window.g = function() { a = a ? false : true };
      subscribe(a) { window.f(a); }`;
    let first = true;
    window.f = (v) => {
      if (first) {
        expect(v).to.be.equal(true);
        first = false;
        window.g();
      } else {
        expect(v).to.be.equal(false);
        done();
      }
    };
    rlet(src);
    window.g();
  });

  it('should support reactive updates', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a + 1;
      window.g = function() { a = 5 };
      subscribe(b) { window.f(b); }`;
    window.f = (v) => {
      expect(v).to.be.equal(6);
      done();
    };
    rlet(src);
    window.g();
  });

  it('should set up dependencies automatically', (done) => {
    const src = `
      rlet a = 3;
      rlet b = a + 1;
      window.g = function() { a = 5 };
      subscribe(b) { window.f(b); }`;
    window.f = (v) => {
      expect(v).to.be.equal(6);
      done();
    };
    rlet(src);
    window.g();
  });

  it('should support subscriptions to other reactive variables', (done) => {
    const src = `
      rlet a = 3;
      rlet b = subscribe(a) true;
      window.g = function() { a = 5 };
      subscribe(b) { window.f(b); }`;
    window.f = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    window.g();
  });

  it('should support subscriptions with callbacks', (done) => {
    const src = `
      window.f = null;
      window.g = function(cb) { window.f = cb; }
      rlet a = subscribe(window.g) true;
      subscribe(a) { window.h(a); }`;
    window.h = (v) => {
      expect(v).to.be.equal(true);
      done();
    };
    rlet(src);
    window.f();
  });

  it('should support folding', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) initially(0) b + 1;
      window.g = function() { a = true; };
      subscribe(b) { window.f(b); }`;
    let first = true;
    window.f = (v) => {
      if (first) {
        expect(v).to.be.equal(1);
        first = false;
        window.g();
      } else {
        expect(v).to.be.equal(2);
        done();
      }
    };
    rlet(src);
    window.g();
  });

  it('prevents glitches', (done) => {
    const src = `
      rlet a;
      rlet b = subscribe(a) a + 1;
      window.g = function() { a = 1; };
      subscribe(a, b) { window.f(a + b); }`;
    let first = true;
    window.f = (v) => {
      expect(v).to.be.equal(3);
      if (first) {
        first = false;
        done();
      } else {
        done(new Error("done called twice"));
      }
    };
    rlet(src);
    window.g();
  });
});
