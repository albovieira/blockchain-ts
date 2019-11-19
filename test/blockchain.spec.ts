import { expect } from 'chai';

import { BlockChain } from '../src/blockchain';
import { createWallets } from './mocks/walletMocks';

describe('Blockchain', () => {
  let blockchain: BlockChain;

  before(() => {
    blockchain = new BlockChain(2, 10);
  });

  it.only('should create transactions in blockchain', () => {
    const wallets = createWallets();
    console.log(wallets);
  });
});
