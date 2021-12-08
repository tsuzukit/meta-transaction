// const ganache = require('ganache-cli');
const Web3 = require('Web3');
const provider =Web3.providers.HttpProvider('http://localhost:6545')
// const web3 = new Web3(provider);
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:6545'));

const compiledTxRelay = require('../build/TxRelay');
const compiledMessageBox = require('../build/MessageBox');

let accounts;
let txRelay;
let messageBox;

// const run = async function(params) {
//   const chainId = await web3.eth.getChainId();
  
//   console.log(chainId);}

// run();
const before = async function() {
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

  console.log("TxRelay address is " + txRelay.options.address);
  console.log("MessageBox address is " + messageBox.options.address);
};

before()