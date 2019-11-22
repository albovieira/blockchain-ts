import { SHA256 } from 'crypto-js';

export function getSignalSocket(
  socketIOPort: number,
  isCentralNode: boolean = false
) {
  let io;
  if (isCentralNode) {
    io = require('socket.io')(socketIOPort);
  } else {
    io = require('socket.io-client')(`http://localhost:${socketIOPort}`);
  }
  return io;
}

export function createSignature(port: number) {
  const timestamp = Date.now();
  const randomIndex = Math.floor(Math.random() * 100000);
  const signature = SHA256(`${port}-${timestamp}-${randomIndex}`).toString();
  return signature;
}
