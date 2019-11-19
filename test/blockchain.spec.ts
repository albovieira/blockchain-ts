import { expect } from 'chai';

import { BlockChain } from '../src/blockchain';
import { createWallets } from './mocks/walletMocks';
import { Transaction } from '../src/transaction';

describe('Blockchain', () => {
  let blockchain: BlockChain;

  before(() => {
    blockchain = new BlockChain(2, 10);
  });

  it('should start wallet with a reward balance', () => {
    const wallets = createWallets() as any;

    const { ak: fromPrivateKey, pk: fromPublickKey } = wallets.from;

    blockchain.addRewardTransaction(fromPublickKey);
    const balance = blockchain.getWalletBalance(fromPublickKey);
    expect(balance).to.be.eq(10);
  });

  it('should create transactions in blockchain', () => {
    const wallets = createWallets() as any;

    const { ak: fromPrivateKey, pk: fromPublickKey } = wallets.from;
    blockchain.addRewardTransaction(fromPublickKey);
    
    const { pk: toPublickKey } = wallets.to;
    const { pk: rewardPublickKey } = wallets.reward;

    const tx1 = new Transaction(fromPublickKey, toPublickKey, 5);
    tx1.signTransaction(fromPrivateKey);
    blockchain.addTransaction(tx1);
  
    blockchain.minePendingTransactions(rewardPublickKey);


    expect(blockchain.getWalletBalance(fromPublickKey)).to.be.eq(5);
    expect(blockchain.getWalletBalance(toPublickKey)).to.be.eq(5);
    expect(blockchain.getWalletBalance(rewardPublickKey)).to.be.eq(10);
    expect(blockchain.isValid()).to.be.eq(true);

  });
});
