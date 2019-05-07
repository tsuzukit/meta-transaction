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

const Transaction = require('./transaction');

class MetaTransactionServer  {

  /**
   * Create encoded method call and sign transaction
   * @param abi
   * @param sig
   * @param to
   * @param from
   * @param data
   * @param wrapperTx
   * @param privateKey
   * @returns {Promise<*>}
   */
  static async createRawTxToRelay(abi, sig, to, from, data, wrapperTx, privateKey) {

    return Transaction.createTx(abi, "relayMetaTx",
      [ sig.v,
        Transaction.add0x(sig.r.toString('hex')),
        Transaction.add0x(sig.s.toString('hex')),
        Transaction.add0x(to),
        Transaction.add0x(data),
        Transaction.add0x(from)
      ], wrapperTx, privateKey);
  };

}

module.exports = MetaTransactionServer;

