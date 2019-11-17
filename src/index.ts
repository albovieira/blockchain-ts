import { BlockChain } from './blockchain';
import { Transaction } from './transaction';

function main() {
  console.log('start');
  const blockchain = new BlockChain();

  blockchain.createTransactions(new Transaction('address1', 'address2', 100));
  blockchain.createTransactions(new Transaction('address2', 'address1', 50));

  blockchain.minePendingTransactions('albo');

  console.log(`albo balance here will be 0 because reward is a pendng transcation
  : ${blockchain.getWalletBalance('albo')}`);

  blockchain.minePendingTransactions('albo');
  console.log(`albo balance is: ${blockchain.getWalletBalance('albo')}`);

  console.log('done');
}

main();
