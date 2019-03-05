// Modules.
const fetch = require("node-fetch");
const sha256 = require("js-sha256");

const url = "http://programmeren9.cmgt.hr.nl:8000/api/blockchain/next";

const mine = async (url) => {
  try {
    // Get the most recent block data.
    const response = await fetch(url);
    const json = await response.json();

    if (!json.open) {
      throw new Error('Blockchain closed at the moment, try again in ' + json.countdown + ' ms.');
    }

    // Compose the blockchain string as defined by the Mod10 algorithm guide.
    let blockchainString = json.blockchain.hash;
    for (let i = 0; i < json.blockchain.data.length; i ++) {
      blockchainString +=
        json.blockchain.data[i].from +
        json.blockchain.data[i].to +
        json.blockchain.data[i].amount +
        json.blockchain.data[i].timestamp;
    }

    blockchainString +=
      json.blockchain.timestamp +
      json.blockchain.nonce;

    // Compose the transaction string as defined by the Mod10 algorithm guide.
    let transactionString = '';
    for (let i = 0; i < json.transactions.length; i ++) {
      transactionString +=
        json.transactions[i].from +
        json.transactions[i].to +
        json.transactions[i].amount +
        json.transactions[i].timestamp;
    }
    transactionString += json.timestamp;

    // let transactionString = 'CMGT Mining CorporationBas BOOTB115487477332611548748101396';
    // string = '000078454c038871fa4d67b0022a30baaf25eaa231f8991b108e2624f052f3f8CMGT Mining CorporationBob PIKAB11548689513858154874778871610312';

    // Hash the composed string.
    const hash = hashString(blockchainString);

    // Prepare new string to hash as defined by the Mod10 algorithm guide.
    const newString = hash + transactionString;

    // Try to find the nonce. When found, the function outputs SUCCESSFUL.
    if (await findNonce(newString)) {
      console.log('SUCCESSFUL!');
    }
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
 *
 * @param arr
 * @param number
 * @returns array
 */
const addNumbers = (arr, number = 0) => {
  if (arr.length % 10 === 0) {
    return arr;
  }

  return addNumbers(arr.concat(number.toString()), number + 1);
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

  return groupArray(arr, result, index + 10);
};

/**
 * Add the values of two arrays together like this:
 * result[index] = arr1[index] + arr2[index]
 *
 * #assignment: step 4 of Mod10.
 *
 * @param arr1
 * @param arr2
 * @param result
 * @param index
 * @returns array
 */
const addArraysTogether = (arr1, arr2, result = [], index = 0) => {
  if (index === 10) {
    return result;
  }
  // Add the two numbers together.
  const sum = (parseInt(arr1[index]) + parseInt(arr2[index])) % 10;
  return addArraysTogether(arr1, arr2, result.concat(sum), index + 1);
};

/**
 * Run addArraysTogether until only one array of 10 numbers remain.
 *
 * @param arr
 * @returns {*}
 */
const addAllArraysTogether = arr => {
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
const findNonce = async str => {
  let index = 0;
  while (index < 100000) {
    const hash = hashString(str + index.toString());
    if (hash.substring(0,4) === '0000') {
      return await tryNonce(index);
    }
    index ++;
  }
};

/**
 * Check if the POST request was accepted by the blockchain.
 *
 * @param res
 * @returns boolean
 */
const isSuccessful = res => {
  res.json().then(response => {
    console.log('Response', response.message);
    return response.message !== 'nonce not correct';
  })
};

/**
 * Try the found nonce by making a POST request to the CMGT Coin endpoint.
 *
 * @param nonce
 */
const tryNonce = async nonce => {
  // Set request body.
  const body = {
    user: 'Perry Janssen 0924208',
    nonce: nonce,
  };

  // Set request parameters.
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };

  // Submit to the blockchain.
  fetch('http://programmeren9.cmgt.hr.nl:8000/api/blockchain', params)
    .then(isSuccessful);
};

// Mine a CMGT Coin.
mine(url);
