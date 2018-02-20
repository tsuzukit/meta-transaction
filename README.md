# Meta transaction

This repository implements generic version of meta transaction.

Meta transaction is proposed by uPort and detailed description can be found [here](https://medium.com/uport/making-uport-smart-contracts-smarter-part-3-fixing-user-experience-with-meta-transactions-105209ed43e0)

Below describes concept of meta transaction demonstrated in this repository.

![concept](image/readme1.png "concept")

# Prerequisite

Install docker for mac

# Software versions

 name         | version       |
|--------------|---------------|
| solidity     | 0.4.17        |
| solidity-compiler       | v0.4.19+commit.c4cbbb05 |


# How to start server

```
$ sh script/start.sh
```

# Setup account

Create `config.json` at root folder

```
{
  "server_account": {
    "privateKey": <PRIVATE KEY>,
    "address": <ADDRESS>,
  },
  "client_account": {
    "privateKey": <PRIVATE KEY>,
    "address": <ADDRESS>,
  }
}
```

# Compile

```
$ sh script/compile.sh
```

# Test

```
$ sh script/enter.sh
# npm run test
```

# Usage

## Client

```ecmascript 6
let rawTx = await MetaTransactionClient.createTx(targetAbi, targetFunctionName, args, {
  to: targetAddress,
  value: 0,
  nonce: 0, // nonce must match the one at TxRelay contract
  gas: 2000000,
  gasPrice: 2000000,
  gasLimit: 2000000
});

// result txToServer object should be send to app server
txToServer = await MetaTransactionClient.createRawTxToRelay(
  rawTx,
  clientAccountAddress,
  clientAccountPrivateKey,
  txRelayContractAddress
);
```

## Server

```ecmascript 6
// sign tx with account which has some ether.
let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
  JSON.parse(txRelayContractAbi),
  txToServer.sig, // from client
  txToServer.to, // from client
  txToServer.from, // from client
  txToServer.data, // from client
  {
    "gas": 2000000,
    "gasPrice": 2000000,
    "gasLimit": 2000000,
    "value": 0,
    "to": txRelayContractAddress,
    "nonce": 0, // nonce of address which signs tx ad server
    "from": serverAccountAddress
  },
  serverAccountPrivateKey
);

// esnd tx to TxRelay contract
const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
```
