import {
  generateKey,
  getPrivateKey,
  getPublicKeyFromPrivateKey as getPublicKeyFromPrivate
} from './key-generator';

import { BlockChain } from './blockchain';
import { Transaction } from './transaction';

const { privateKey, publicKey } = generateKey();
console.log(`
 PrivateKey: ${privateKey}, \n
 PublicKey: ${publicKey},
`);

const myKey = getPrivateKey(privateKey);
const myWalletAddress = getPublicKeyFromPrivate(privateKey);

function main() {
  console.log('start');
  const blockchain = new BlockChain();

  const tx1 = new Transaction(myWalletAddress, 'other key', 10);
  tx1.signTransaction(myKey);
  blockchain.addTransaction(tx1);

  console.log('Starting miner...');
  blockchain.minePendingTransactions(myWalletAddress);

  console.log('Balance mywallet', blockchain.getWalletBalance(myWalletAddress));

  console.log('is chain valid', blockchain.isValid());
}

main();
