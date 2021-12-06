const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('Web3');


const provider = ganache.provider({
  "debug": true
});
const web3 = new Web3(provider);
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

  txRelay = await new web3.eth.Contract(JSON.parse(compiledTxRelay.interface))
    .deploy({
      data: compiledTxRelay.bytecode,
      arguments: []
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  txRelay.setProvider(provider);

  messageBox = await new web3.eth.Contract(JSON.parse(compiledMessageBox.interface))
    .deploy({
      data: compiledMessageBox.bytecode,
      arguments: ["Hello from message box"]
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  messageBox.setProvider(provider);

  assert.ok(txRelay.options.address);
  assert.ok(messageBox.options.address);

  console.log("TxRelay address is " + txRelay.options.address);
  console.log("MessageBox address is " + messageBox.options.address);

  await web3.eth.sendTransaction({
    to: config.server_account.address,
    from: accounts[1],
    value: web3.utils.toWei('1', "ether"),
    gas: '1000000'
  });

  // fetch nonce of sender address tracked at TxRelay
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
}

run()