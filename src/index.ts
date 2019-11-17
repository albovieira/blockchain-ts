import {
  generateWallet,
  getPrivateKey,
  getPublicKeyFromPrivateKey as getPublicKeyFromPrivate
} from './key-generator';

import { BlockChain } from './blockchain';
import { Transaction } from './transaction';

const { privateKey: privateKey1, publicKey: publicKey1 } = generateWallet();
const fromPrivateKey = getPrivateKey(privateKey1);
const from = publicKey1;

const { privateKey: privateKey2, publicKey: publicKey2 } = generateWallet();
const to = publicKey2;

const { privateKey: privateKey3, publicKey: publicKey3 } = generateWallet();
const rewardWallet = publicKey3;

function main() {
  console.log('start');
  const blockchain = new BlockChain(2, 100);

  const tx1 = new Transaction(from, to, 10);
  tx1.signTransaction(fromPrivateKey);
  blockchain.addTransaction(tx1);

  console.log('Starting miner...');
  blockchain.minePendingTransactions(rewardWallet);

  console.log('Balance from', blockchain.getWalletBalance(from));
  console.log('Balance to', blockchain.getWalletBalance(to));
  console.log(
    'Balance reward wallet',
    blockchain.getWalletBalance(rewardWallet)
  );

  console.log('is chain valid', blockchain.isValid());
}

main();
