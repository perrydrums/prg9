const expect = require('chai').expect;
const hashString = require('../index.js').hashString;

describe('hashString', () => {
  it('Hash a string using the Mod10 algorithm.', () => {
    // This string should be converted to the expected hash as stated by the CMGT Coin documentation.
    const string = '000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8CMGT Mining CorporationBob PIKAB11548689513858154874778871610312';
    const expc   = '00005d430ce77ad654b5309a770350bfb4cf49171c682330a2eccc98fd8853cf';

    expect(hashString(string)).eql(expc);
  });
});
