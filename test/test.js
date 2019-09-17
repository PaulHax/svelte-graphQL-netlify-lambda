const assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('data', () => {
  before(function() {
    // runs before all tests in this block
  });
  it('should get initial messages', function() {
    assert.ok(msgs.length() >= 1);
  });
})