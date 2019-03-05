const expect = require('chai').expect;
const toUnicode = require('../index.js').toUnicode;

describe('toUnicode', () => {
  it('toUnicode.', () => {
    // 'text' should be converted to '116101120116' according to the Mod10 algorithm guide.
    // Adding '123' to the string should result in '116101120116123' as numbers shouldn't be converted.
    const string = 'text123';
    const expc   = '116101120116123';

    expect(toUnicode(string)).eql(expc);
  });
});
