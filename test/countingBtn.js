import rlet from '../index';
import {expect} from 'chai';

describe('counting button', () => {
  it('should count clicks', (done) => {
    const src = `
      rlet btnClicks(null);
      global.g = function() { btnClicks = null });
      rlet count(0) = btnClicks, count + 1;
      rlet label = "Count: " + count;
      subscribe(label) { global.f(label); }`;
    let first = true;
    global.f = (v) => {
      if (first) {
        expect(v).to.be.equal("Count: 0");
        global.g();
      } else {
        expect(v).to.be.equal("Count: 1");
        done();
      }
    };
    rlet(src);
  });
});
