const expect = require('chai').expect;
const splitInArray = require('../index.js').splitInArray;

describe('splitInArray', () => {
  it('Split all characters into separate indexes of a new array.', () => {
    const string = '12345678';
    const expc   = ['1', '2', '3', '4', '5', '6', '7', '8'];

    expect(splitInArray(string)).eql(expc);
  });
});
