const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('Web3');


const provider =Web3.providers.HttpProvider('http://localhost:6545')
var web3 = new Web3('http://localhost:6545');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));
const config = require('../config.json');

const MetaTransactionClient = require('../lib/metaTransactionClient');
const MetaTransactionServer = require('../lib/metaTransactionServer');

const compiledTxRelay = require('../build/TxRelay');
const compiledMessageBox = require('../build/MessageBox');

let accounts;
let txRelay;
let messageBox;
let txToServer;
let newMessage = 'Talha54';


const run = async function () {
  
  messageBox = await new web3.eth.Contract(JSON.parse(compiledMessageBox.interface))
  txRelay = await new web3.eth.Contract(JSON.parse(compiledTxRelay.interface))

  txRelay.options.address = config.TxRelay_address
  messageBox.options.address = config.MessageBox_address

  accounts = await web3.eth.getAccounts();
  // await web3.eth.sendTransaction({
  //   to: config.server_account.address,
  //   from: "0x7869092DA36a934C538898d4a980eCBBF62A0E81",
  //   value: web3.utils.toWei('98', "ether"),
  //   gas: '1000000'
  // });

  // create signed tx from client
  let nonce = await txRelay.methods.nonce(config.client_account.address).call();

  let messageBoxAbi = JSON.parse(compiledMessageBox.interface);
  let rawTx = await MetaTransactionClient.createTx(messageBoxAbi, 'setMessage', [newMessage], {
    to: messageBox.options.address,
    value: 0,
    nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
    gas: 2000000,
    gasPrice: 2000000,
    gasLimit: 2000000
  });
  txToServer = await MetaTransactionClient.createRawTxToRelay(
    rawTx,
    config.client_account.address,
    config.client_account.privateKey,
    txRelay.options.address
  );

  assert.equal(config.client_account.address, txToServer.from);
  // console.log(txToServer)

  //server sign tx
  let ServerNonce = await web3.eth.getTransactionCount(config.server_account.address);

  let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
    JSON.parse(compiledTxRelay.interface),
    txToServer.sig,
    txToServer.to,
    txToServer.from,
    txToServer.data,
    {
      "gas": 2000000,
      "gasPrice": 2000000,
      "gasLimit": 2000000,
      "value": 0,
      "to": txRelay.options.address,
      "nonce": parseInt(ServerNonce), // nonce of address which signs tx ad server
      "from": config.server_account.address
    },
    config.server_account.privateKey
  );

  const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
  
  console.log(result);

  message = await messageBox.methods.message().call();
  assert.equal(newMessage, message);
  console.log(message);

  sender = await messageBox.methods.sender().call();
  assert.equal(txRelay.options.address, sender);
  console.log(txRelay.options.address)
  console.log(sender);
};

run()