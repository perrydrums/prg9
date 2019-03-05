const fetch = require("node-fetch");
const url = "http://programmeren9.cmgt.hr.nl:8000/api/blockchain/next";
const sha256 = require("js-sha256");

const getData = async (url) => {
  try {
    const response = await fetch(url);
    const json = await response.json();
    const blockchain = json.blockchain;
    const string =
      blockchain.hash +
      blockchain.data[0].from +
      blockchain.data[0].to +
      blockchain.data[0].amount +
      blockchain.data[0].timestamp +
      blockchain.timestamp +
      blockchain.nonce;
    const transaction = json.transactions[0];
    const transactionString =
      transaction.from +
      transaction.to +
      transaction.amount +
      transaction.timestamp +
      json.timestamp;

    // let transactionString = 'CMGT Mining CorporationBas BOOTB115487477332611548748101396';
    // string = '000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8CMGT Mining CorporationBob PIKAB11548689513858154874778871610312';

    const hash = hashString(string);
    const newString = hash + transactionString;

    findNonce(newString);
    return true;
  } catch (error) {
    console.log(error);
  }
};

const hashString = (string) => {
  string = string.replace(/\s/g, '');
  const unicode = toUnicode(string);
  const numberArray = splitInArray(unicode);
  const correctedNumbersArray = addNumbers(numberArray);
  const groupedNumbersArray = groupArray(correctedNumbersArray);
  const calculatedArray = addAllArraysTogether(groupedNumbersArray);
  const arrayString = calculatedArray[0].join('');
  return sha256(arrayString);
};

/**
 * Convert string to unicode decimal numbers.
 *
 * @param str
 * @param unicodeStr
 * @param index
 * @returns {*}
 */
const toUnicode = (str, unicodeStr = '', index = 0) => {
  if (isNaN(str[index])) {
    const code = str.charCodeAt(index).toString();
    unicodeStr += code;
  }
  else {
    unicodeStr += str[index];
  }

  if (index >= str.length - 1) {
    return unicodeStr;
  }
  index ++;
  return toUnicode(str, unicodeStr, index);
};

/**
 * Split all characters into an array.
 *
 * @param str
 * @returns {string[]}
 */
const splitInArray = (str) => {
  return str.split('');
};

/**
 * Add extra numbers to the array if the number of entries isn't a multiple of 10.
 */
const addNumbers = (arr, number = 0) => {
  const remainder = arr.length % 10;
  if (remainder === 0) {
    // Multiple of 10, return array.
    return arr;
  }

  arr.push(number.toString());

  number ++;

  return addNumbers(arr, number);
};

/**
 * Return array in groups of 10 characters.
 *
 * @param arr
 * @param result
 * @param index
 */
const groupArray = (arr, result = [], index = 0) => {
  if (index >= arr.length) {
    return result;
  }

  result.push(arr.slice(index, index + 10));

  index += 10;
  return groupArray(arr, result, index);
};

/**
 * Add the values of two arrays together like this:
 * result[index] = arr1[index] + arr2[index]
 *
 * @param arr1
 * @param arr2
 * @param result
 * @param index
 * @returns {*}
 */
const addArraysTogether = (arr1, arr2, result = [], index = 0) => {
  if (index === 10) {
    return result;
  }
  result[index] = (parseInt(arr1[index]) + parseInt(arr2[index])) % 10;
  index ++;
  return addArraysTogether(arr1, arr2, result, index);
};

/**
 * Run addArraysTogether until only one array of 10 numbers remain.
 *
 * @param arr
 * @returns {*}
 */
const addAllArraysTogether = (arr) => {
  if (arr.length === 1) {
    return arr;
  }
  const r = addArraysTogether(arr[0], arr[1]);
  const array = arr.slice(2);
  array.unshift(r);
  return addAllArraysTogether(array);
};

/**
 * Find a hash that matches the pattern.
 * When it's a match, run tryNonce.
 *
 * @param str
 */
const findNonce = (str) => {
  let index = 0;
  while (index < 100000) {
    const hash = hashString(str + index.toString());
    if (hash.substring(0,4) === '0000') {
      const success = tryNonce(index);
      if (success) {
        return success;
      }
    }
    index ++;
  }
};

/**
 * Try the found nonce by making a POST request to the CMGT Coin endpoint.
 *
 * @param nonce
 */
const tryNonce = (nonce) => {
  const body = {
    user: 'Perry Janssen 0924208',
    nonce: nonce,
  };

  fetch('http://programmeren9.cmgt.hr.nl:8000/api/blockchain', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    res.json().then(response => {
      console.log(response);
    })
  })
};

getData(url);
