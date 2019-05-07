/*
The MIT License (MIT)
Copyright (c) 2019 tsuzukit.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const config = require('../config');
const Web3 = require('web3');
const util = require("ethereumjs-util");
const CryptoJS = require("crypto-js");
const leftPad = require('left-pad');
const EthereumjsTx = require('ethereumjs-tx');

const provider = new Web3.providers.HttpProvider(config.endpoint);
const web3 = new Web3(provider);

class Transaction {

  static createTx(abi, functionName, args, wrapperTx, privateKey=null) {
    let types = Transaction.getTypesFromAbi(abi, functionName);
    let txData = Transaction.encodeFunctionTxData(functionName, types, args);

    let txObject = {};
    txObject.to = Transaction.add0x(wrapperTx.to);
    txObject.gasPrice = Transaction.add0x(wrapperTx.gasPrice);
    txObject.gasLimit = Transaction.add0x(wrapperTx.gasLimit);
    txObject.nonce = Transaction.add0x(wrapperTx.nonce);
    txObject.data = Transaction.add0x(txData);
    txObject.value = Transaction.add0x(wrapperTx.value);

    let tx = new EthereumjsTx(txObject);
    if (privateKey != null) {
      tx.sign(Buffer.from(util.stripHexPrefix(privateKey), 'hex'));
    }
    return tx.serialize().toString('hex');
  };

  /**
   * @param abi
   * @param functionName
   * @private
   */
  static getTypesFromAbi(abi, functionName) {

    function matchesFunctionName(json) {
      return (json.name === functionName && json.type === 'function');
    }

    function getTypes(json) {
      return json.type;
    }

    let funcJson = abi.filter(matchesFunctionName)[0];

    return (funcJson.inputs).map(getTypes);
  };

  /**
   * @param functionName
   * @param types
   * @param args
   * @returns {*}
   * @private
   */
  static encodeFunctionTxData(functionName, types, args) {
    let fullName = functionName + '(' + types.join() + ')';
    let signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
    return signature + util.stripHexPrefix(web3.eth.abi.encodeParameters(types, args));
  };

  /**
   * Add "0x" at top of input
   * @param input
   * @returns {*}
   * @private
   */
  static add0x(input) {
    if (typeof(input) !== 'string') {
      return input;
    }
    else if (input.length < 2 || input.slice(0,2) !== '0x') {
      return '0x' + input;
    }
    else {
      return input;
    }
  }

  /**
   * @param n
   * @returns {string}
   * @private
   */
  static pad(n) {
    if (n.startsWith('0x')) {
      n = util.stripHexPrefix(n);
    }
    return leftPad(n, '64', '0');
  };

}

module.exports = Transaction;

