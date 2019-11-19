import { expect } from 'chai';

import { BlockChain } from '../src/blockchain';
import { createWallets } from './mocks/walletMocks';
import { Transaction } from '../src/transaction';

const DIFFICULTY = 2;
const REWARD = 10;

describe('Blockchain', () => {
  let blockchain: BlockChain;

  beforeEach(() => {
    blockchain = new BlockChain(DIFFICULTY, REWARD);
  });

  it('should start wallet with a reward balance', () => {
    const wallets = createWallets() as any;

    const { pk: fromPublickKey } = wallets.from;

    blockchain.addRewardTransaction(fromPublickKey);
    const balance = blockchain.getWalletBalance(fromPublickKey);
    expect(balance).to.be.eq(10);
  });

  it('should create transactions in blockchain', () => {
    const wallets = createWallets() as any;

    const { sk: fromPrivateKey, pk: fromPublickKey } = wallets.from;
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

  it('should throw an exception when insuficient founds', () => {
    const wallets = createWallets() as any;

    const { sk: fromPrivateKey, pk: fromPublickKey } = wallets.from;
    blockchain.addRewardTransaction(fromPublickKey);
    
    const { pk: toPublickKey } = wallets.to;

    const tx1 = new Transaction(fromPublickKey, toPublickKey, 11);
    tx1.signTransaction(fromPrivateKey);
    
    try {
      blockchain.addTransaction(tx1);
    } catch (error) {
      expect(error.message).to.be.eq('Insuficient founds');      
    }
  });

  it('should throw an exception for invalid wallets', () => {
    const wallets = createWallets() as any;

    const { sk: fromPrivateKey, pk: fromPublickKey } = wallets.from;
    blockchain.addRewardTransaction(fromPublickKey);
    
    const tx1 = new Transaction('invalidFrom', 'invalidTo', 5);
    try {
      tx1.signTransaction(fromPrivateKey);
    } catch (error) {
      expect(error.message).to.be.eq('You can not sign transactions for other wallet');      
    }
  });


});
