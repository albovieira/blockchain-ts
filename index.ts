import { SHA256 } from 'crypto-js';

class Block {
  index: number;
  timestamp: number;
  data: any;
  hash: string;
  nonce: number;
  previousHash?: string;

  constructor(data: any, previousHash?: string, index: number = 0) {
    this.index = index;
    this.data = data;
    this.timestamp = Date.now();
    this.previousHash = previousHash || null;
    this.hash = this.calculateHash();
    this.nonce = 0; // used to avoid infinite loop on mining method, needed to change the hash
  }

  calculateHash() {
    return SHA256(
      `${this.index}${this.previousHash}${this.timestamp}${
        this.nonce
      }${JSON.stringify(this.data)}`
    ).toString();
  }

  /**this method is used as a prof of work, according with difficulty
   * it will try to generate a hash that has the amount of 0 specified
   */
  mining(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined ${this.hash}`);
    return this;
  }
}

class BlockChain {
  private chain: Block[];
  private difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  private createGenesisBlock() {
    console.log('First block created');
    return new Block({ description: 'Start Block' }, '0', 0);
  }

  private getLastestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  add(block: Block) {
    const lastBlock = this.getLastestBlock();
    block.previousHash = lastBlock.hash;
    block.index = lastBlock.index + 1;

    block.mining(this.difficulty);

    this.chain.push(block);
    console.log(`Block added ${block.hash}`);
  }

  show() {
    return this.chain;
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
      console.error(`Blockchain is invalid`);
    }

    console.log(`Blockchain is valid`);
    return true;
  }
}

function main() {
  console.log('start');
  const blockchain = new BlockChain();

  const block = new Block({ amount: 4 });
  blockchain.add(block);

  const block2 = new Block({ amount: 2 });
  blockchain.add(block2);

  const chain = blockchain.show();
  console.log('chain', chain);
  console.log('done');
}

main();
