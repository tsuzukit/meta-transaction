// const ganache = require('ganache-cli');
const Web3 = require('Web3');
const provider =Web3.providers.HttpProvider('http://192.168.1.41:18333/')
// const web3 = new Web3(provider);
var web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.1.41:18333/'));

const compiledTxRelay = require('../build/TxRelay');
const compiledMessageBox = require('../build/MessageBox');

web3.eth.personal.newAccount('99Salman99')
.then(console.log);