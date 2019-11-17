export class Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}
