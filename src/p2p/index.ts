import { SHA256 } from 'crypto-js';

import { config } from 'dotenv';
import { Peer } from './peer';

config();

const port = Number(process.env.PORT) || 3000;

function createSignature() {
  const timestamp = Date.now();
  const randomIndex = Math.floor(Math.random() * 100000);
  const signature = SHA256(`${port}-${timestamp}-${randomIndex}`).toString();
  return signature;
}

// Ill implement a socket that will send a signal when a new machine was started and wanna to
// enter in the peer network
/** After up one peer, all others peers that will be connected must be in this array */
const peer = new Peer(port, createSignature());

/** After up one peer, all others peers that will be connected must be in this array */
// const peers = ['localhost:3000'];
// peers.forEach(host => {
//   peer.connectTo(host);
// });

export default peer;
