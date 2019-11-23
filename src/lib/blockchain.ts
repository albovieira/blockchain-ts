import { cloneDeep } from 'lodash';
import { Block } from './block';
import { Transaction } from './transaction';

export class BlockChain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[] = [];
  private miningReward: number;

  constructor(
    isGenesis: boolean = false,
    difficulty: number,
    miningReward: number
  ) {
    if (isGenesis) {
      this.chain = [this.createGenesisBlock()];
      this.difficulty = difficulty; // it must be changed to set automactically when many people are tring to generate a new block
      this.miningReward = miningReward; // same as above
    }
  }

  rebuild(blocks: Block[], config: any) {
    // need to create some validations here
    console.log('rebuilding');
    this.difficulty = config.difficulty;
    this.miningReward = config.miningReward;
    this.chain = blocks.map(bk => {
      bk.transactions = bk.transactions.map(transaction => {
        const tx = new Transaction(
          transaction.fromAddress,
          transaction.toAddress,
          transaction.amount
        );
        tx.signature = transaction.signature;
        return tx;
      });

      const block = new Block(bk.transactions);
      block.hash = bk.hash;
      block.timestamp = bk.timestamp;
      block.nonce = bk.nonce;
      block.previousHash = bk.previousHash;
      return block;
    });

    if (!this.isValid()) {
      throw new Error('Invalid chain');
    }
    console.log('blockchain rebuild');
  }

  addTransaction(transaction: Transaction): BlockChain {
    if (this.getAddressBalance(transaction.fromAddress) < transaction.amount)
      throw new Error('Insuficient founds');

    if (!transaction.fromAddress || !transaction.toAddress)
      throw new Error('Transactions must include from and to wallets');

    if (!transaction.isValid())
      throw new Error('Transactions must be valid to chain');

    this.pendingTransactions.push(transaction);

    return this;
  }

  /** it adds reward for firsts wallets */
  addRewardTransaction(address: string): BlockChain {
    this.minePendingTransactions(address);
    return this;
  }

  minePendingTransactions(miningRewardAddress: string): BlockChain {
    const reward = this.createReward(miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(reward);

    const lastBlock = this.getLastestBlock();
    const block = new Block(this.pendingTransactions, lastBlock.hash);
    block.mining(this.difficulty);
    this.chain.push(block);

    console.log('Transactions done');
    this.pendingTransactions = [];

    return this;
  }

  getAddressBalance(address: string): number {
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

  isValid(): boolean {
    for (let index = 1; index < this.chain.length; index++) {
      const currentBlock = this.chain[index];
      const previousBlock = this.chain[index - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
      if (currentBlock.hash !== currentBlock.generateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.generateHash()) {
        return false;
      }
    }

    console.log(`Blockchain is valid`);
    return true;
  }

  show(): Block[] {
    return cloneDeep(this.chain);
  }

  getConfig() {
    return {
      difficulty: this.difficulty,
      miningReward: this.miningReward
    };
  }

  private createReward(address: string, rewardValue: number): Transaction {
    return new Transaction(null, address, rewardValue);
  }

  private createGenesisBlock(): Block {
    const genesisBlock = new Block([{} as Transaction], null, 0);
    genesisBlock.hash = genesisBlock.generateHash();
    console.log('First block created');
    return genesisBlock;
  }

  private getLastestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}
