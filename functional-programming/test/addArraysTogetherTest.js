const expect = require('chai').expect;
const addArraysTogether = require('../index.js').addArraysTogether;

describe('addArraysTogether', () => {
  it('Function addArraysTogether should return an array of the sum of the values of both arrays.', () => {
    const arr1 = [2, 5, 8];
    const arr2 = [3, 5, 4];
    const expc = [5, 0, 2];

    expect(addArraysTogether(arr1, arr2)).eql(expc);
  });
});
