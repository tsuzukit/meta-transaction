const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('Web3');


const provider = ganache.provider({
  "debug": true
});
var web3 = new Web3('http://localhost:7545');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const config = require('./config.json');

const MetaTransactionClient = require('./lib/metaTransactionClient');
const MetaTransactionServer = require('./lib/metaTransactionServer');

const compiledTxRelay = require('./build/TxRelay');
const compiledMessageBox = require('./build/MessageBox');

let accounts;
let txRelay;
let messageBox;
let txToServer;
let newMessage = 'Updated message for Message Box!!';


const run = async function (params) {
  accounts = await web3.eth.getAccounts();

  let messageBoxAbi = JSON.parse(compiledMessageBox.interface);
  let rawTx = await MetaTransactionClient.createTx(messageBoxAbi, 'setMessage', [newMessage], {
    to: '0x06259188104d93B7D40F7B3A7622F2BcaD75F908',
    value: 0,
    nonce: 0,
    gas: 2000000,
    gasPrice: 2000000,
    gasLimit: 2000000
  });
  txToServer = await MetaTransactionClient.createRawTxToRelay(
    rawTx,
    '0xFd46Ce8df40B7a1F8877A2A392c6E6bc92D97890',
    '862b08cbbfc6d9fdbdac7f518af7252f1496806dceb076369950f7a5d485d8a2',
    txRelay.options.address
  );
  let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
    JSON.parse(compiledTxRelay.interface),
    txToServer.sig, // from client
    txToServer.to, // from client
    txToServer.from, // from client
    txToServer.data, // from client
    {
      "gas": 2000000,
      "gasPrice": 2000000,
      "gasLimit": 2000000,
      "value": 0,
      "to": txRelay.options.address,
      "nonce": 0, // nonce of address which signs tx ad server
      "from": config.server_account.address
    },
    config.server_account.privateKey
  );
  let result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
  console.log(result);

  assert.equal(config.client_account.address, txToServer.from);
}

run()