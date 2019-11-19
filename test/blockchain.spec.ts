import { expect } from 'chai';

import { BlockChain } from '../src/lib/blockchain';
import { Transaction } from '../src/lib/transaction';
import { createWallets } from './mocks/walletMocks';

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
    const balance = blockchain.getAddressBalance(fromPublickKey);
    expect(balance).to.be.eq(10);
  });

  it('should create transactions in blockchain', () => {
    const wallets = createWallets() as any;

    const { sk: fromPrivateKey, pk: fromPublickKey } = wallets.from;
    blockchain.addRewardTransaction(fromPublickKey);

    const { pk: toPublickKey } = wallets.to;
    const { pk: rewardPublickKey } = wallets.reward;

    const tx1 = new Transaction(fromPublickKey, toPublickKey, 5);
    tx1.sign(fromPrivateKey);
    blockchain.addTransaction(tx1);

    const tx2 = new Transaction(fromPublickKey, toPublickKey, 2);
    tx2.sign(fromPrivateKey);
    blockchain.addTransaction(tx2);

    const tx3 = new Transaction(fromPublickKey, toPublickKey, 1);
    tx3.sign(fromPrivateKey);
    blockchain.addTransaction(tx3);

    blockchain.minePendingTransactions(rewardPublickKey);

    expect(blockchain.getAddressBalance(fromPublickKey)).to.be.eq(2);
    expect(blockchain.getAddressBalance(toPublickKey)).to.be.eq(8);
    expect(blockchain.getAddressBalance(rewardPublickKey)).to.be.eq(10);
    expect(blockchain.isValid()).to.be.eq(true);
  });

  it('should throw an exception when insuficient founds', () => {
    const wallets = createWallets() as any;

    const { sk: fromPrivateKey, pk: fromPublickKey } = wallets.from;
    blockchain.addRewardTransaction(fromPublickKey);

    const { pk: toPublickKey } = wallets.to;

    const tx1 = new Transaction(fromPublickKey, toPublickKey, 11);
    tx1.sign(fromPrivateKey);

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
      tx1.sign(fromPrivateKey);
    } catch (error) {
      expect(error.message).to.be.eq(
        'You can not sign transactions for other wallet'
      );
    }
  });
});
