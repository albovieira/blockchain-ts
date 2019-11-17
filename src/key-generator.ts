import { ec as ECDSA, ec } from 'elliptic';

//secp256k1 base algorith of bitcoint wallets
const EC = new ECDSA('secp256k1');

export function generateWallet() {
  const key = EC.genKeyPair();
  const publicKey = key.getPublic('hex');
  const privateKey = key.getPrivate('hex');

  return {
    publicKey,
    privateKey
  };
}

export function getPublicKey(publicKey: string) {
  return EC.keyFromPublic(publicKey, 'hex');
}

export function getPrivateKey(privateKey: string) {
  return EC.keyFromPrivate(privateKey, 'hex');
}

export function getPublicKeyFromPrivateKey(privateKey: string) {
  return getPrivateKey(privateKey).getPublic('hex');
}

export function verifySignature(
  publicKey: ECDSA.KeyPair,
  hash: string,
  signature: any
) {
  return publicKey.verify(hash, signature);
}
