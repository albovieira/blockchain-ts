import { SHA256 } from 'crypto-js';

import { config } from 'dotenv';
import { Peer } from './peer';

config();

const port = Number(process.env.PORT) || 3000;
const socketIOPort = Number(process.env.WEB_SOCKET_PORT) || 80;

function createSignature() {
  const timestamp = Date.now();
  const randomIndex = Math.floor(Math.random() * 100000);
  const signature = SHA256(`${port}-${timestamp}-${randomIndex}`).toString();
  return signature;
}

const signature = createSignature();

// the socket will be out of server, all peers will be clients
// just for tests one of the peers will be the socket server
const isCentralNode = process.env.CENTRAL_NODE === 'true';
let io;
if (isCentralNode) {
  io = require('socket.io')(socketIOPort);
} else {
  io = require('socket.io-client')(`http://localhost:${socketIOPort}`);
}

const peer = new Peer(port, signature, { io, isCentralNode });

export default peer;
