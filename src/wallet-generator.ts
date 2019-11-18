import { ec as ECDSA } from 'elliptic';

//secp256k1 base algorith of bitcoint wallets
const EC = new ECDSA('secp256k1');
//secp256k1 base algorith of bitcoint wallets
export class WalletGenerator {
  static create() {
    const key = EC.genKeyPair();
    const publicKey = key.getPublic('hex');
    const privateKey = key.getPrivate('hex');

    return {
      publicKey,
      privateKey
    };
  }

  static getPublicKey(publicKey: string) {
    return EC.keyFromPublic(publicKey, 'hex');
  }

  static getPrivateKey(privateKey: string) {
    return EC.keyFromPrivate(privateKey, 'hex');
  }

  static verifySignature(
    publicKey: ECDSA.KeyPair,
    hash: string,
    signature: any
  ) {
    return publicKey.verify(hash, signature);
  }
}
