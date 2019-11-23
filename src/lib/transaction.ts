import { ec } from 'elliptic';
import { SHA256 } from 'crypto-js';

import { WalletGenerator } from './wallet-generator';

export class Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  signature: string;

  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  rebuild(signature: string) {
    this.signature = signature;
  }

  sign(signKey: ec.KeyPair): void {
    //check if public key is correct
    if (signKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You can not sign transactions for other wallet');
    }

    // it signs the transaction with the private key
    const hashTx = this.generateHash();
    const sig = signKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex').toString();
  }

  isValid(): boolean {
    // from should be null if the transaction is a reward
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publickey = WalletGenerator.getPublicKey(this.fromAddress);
    const verified = WalletGenerator.verifySignature(
      publickey,
      this.generateHash(),
      this.signature
    );
    return verified;
  }

  private generateHash(): string {
    return SHA256(
      `${this.fromAddress}${this.toAddress}${this.amount}`
    ).toString();
  }
}
