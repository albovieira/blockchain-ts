import { WalletGenerator } from '../../src/wallet-generator';

export function createWallets() {
  const wallets = {};
  ['from', 'to', 'reward'].forEach(type => {
    const { privateKey, publicKey } = WalletGenerator.create();

    const sk = WalletGenerator.getPrivateKey(privateKey);
    const pk = publicKey;

    wallets[type] = {
      sk: sk,
      pk
    };
  });

  return wallets;
}
