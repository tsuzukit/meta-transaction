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

  await web3.eth.sendTransaction({
    to: config.server_account.address,
    from: accounts[1],
    value: web3.utils.toWei('1', "ether"),
    gas: '1000000'
  });
  console.log('0')
  
  // fetch nonce of sender address tracked at TxRelay
  let nonce = await txRelay.methods.nonce(config.client_account.address).call();
  
  let messageBoxAbi = JSON.parse(compiledMessageBox.interface);
  console.log('1')
  let rawTx = await MetaTransactionClient.createTx(messageBoxAbi, 'setMessage', [newMessage], {
    to: messageBox.options.address,
    value: 0,
    nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
    gas: 2000000,
    gasPrice: 2000000,
    gasLimit: 2000000
  });
  console.log('2')
  
  txToServer = await MetaTransactionClient.createRawTxToRelay(
    rawTx,
    config.client_account.address,
    config.client_account.privateKey,
    txRelay.options.address
  );
  console.log(txToServer)
}
run()
