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

