import { SHA256 } from 'crypto-js';
import { Transaction } from './transaction';

export class Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  hash: string;
  nonce: number;
  previousHash?: string;

  constructor(
    transactions: Transaction[],
    previousHash?: string,
    index: number = 0
  ) {
    this.index = index;
    this.transactions = transactions;
    this.timestamp = Date.now();
    this.previousHash = previousHash || null;
    this.hash = this.generateHash();
    this.nonce = 0; // used to avoid infinite loop on mining method, needed to change the hash
  }

  /**this method is used as a prof of work, according with difficulty
   * it will try to generate a hash that has the amount of 0 specified
   */
  mining(difficulty: number): Block {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.generateHash();
    }
    console.log(`Block mined ${this.hash}`);
    return this;
  }

  hasValidTransactions(): boolean {
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        return false;
      }
    }
    return true;
  }

  generateHash(): string {
    return SHA256(
      `${this.index}${this.previousHash}${this.timestamp}${
        this.nonce
      }${JSON.stringify(this.transactions)}`
    ).toString();
  }
}
