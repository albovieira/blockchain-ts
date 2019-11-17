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

  addTransaction(transaction: Transaction) {
    if (!transaction.fromAddress || !transaction.toAddress)
      throw new Error('Transactions must include from and to wallets');

    if (!transaction.isValid())
      throw new Error('Transactions must be valid to chain');

    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress: string) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const lastBlock = this.getLastestBlock();
    const block = new Block(this.pendingTransactions, lastBlock.hash);
    block.mining(this.difficulty);
    console.log(`Block succesfuly mined ${block.hash}`);
    this.chain.push(block);

    this.pendingTransactions = [];
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
      const currentBlock = this.chain[index];
      const previousBlock = this.chain[index - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.calculateHash()) {
        return false;
      }
      console.log(`Blockchain is broken`);
    }

    console.log(`Blockchain is valid`);
    return true;
  }

  private createGenesisBlock() {
    const genesisBlock = new Block([{} as Transaction], null, 0);
    genesisBlock.hash = genesisBlock.calculateHash();
    console.log('First block created');
    return genesisBlock;
  }

  private getLastestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}
