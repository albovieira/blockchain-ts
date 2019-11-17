import { cloneDeep } from 'lodash';
import { Block } from './block';
import { Transaction } from './transaction';

export class BlockChain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[] = [];
  private miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // it must be changed to set automactically when many people are tring to generate a new block
    this.miningReward = 100; // same as above
  }

  createTransactions(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress: string) {
    const block = new Block(this.pendingTransactions);
    block.mining(this.difficulty);
    console.log(`Block succesfuly mined ${block.hash}`);
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  getWalletBalance(address: string) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        } else if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  show() {
    return cloneDeep(this.chain);
  }

  isValid() {
    for (let index = 1; index < this.chain.length; index++) {
      const block = this.chain[index];
      const previousBlock = this.chain[index - 1];
      if (block.hash !== block.calculateHash()) {
        return false;
      }
      if (block.previousHash !== previousBlock.hash) {
        return false;
      }
      console.error(`Blockchain is broken`);
    }

    console.log(`Blockchain is valid`);
    return true;
  }

  private createGenesisBlock() {
    const genesisBlock = new Block([{} as Transaction], '0', 0);
    console.log('First block created');
    return genesisBlock;
  }

  private getLastestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}
