import { SHA256 } from 'crypto-js';

import { config } from 'dotenv';
import { Peer } from './peer';

config();

const port = Number(process.env.PORT) || 3000;

const timestamp = Date.now();
const randomIndex = Math.floor(Math.random() * 100000);
const peerSignature = SHA256(`${port}-${timestamp}-${randomIndex}`).toString();

const peer = new Peer(port, peerSignature);

// const peers = ['localhost:3002'];
// peers.forEach(host => {
//   peer.connectTo(host);
// });

/**
 * Subir primeiro um primeiro no;
 * apos subir o primeiro no subir os outros passando o endereco dos outros
 *
 */
