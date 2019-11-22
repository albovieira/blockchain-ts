import * as express from 'express';
import * as bodyParser from 'body-parser';

import { config } from 'dotenv';
import { Peer } from '../p2p/peer';
import { createSignature, getSignalSocket } from '../p2p/utils';
import { WalletGenerator } from '../lib/wallet-generator';
import { BlockChain } from '../lib/blockchain';

config();

const port = Number(process.env.PORT) || 3000;
const socketIOPort = Number(process.env.WEB_SOCKET_PORT) || 80;

const signature = createSignature(port);

// the socket will be out of server, all peers will be clients
// just for tests one of the peers will be the socket server
const isCentralNode = true;
const io = getSignalSocket(socketIOPort, isCentralNode);

const blockchain = new BlockChain(true, 2, 10);
const peer = new Peer(blockchain, port, signature, {
  io,
  isCentralNode
});

const server = express();
server.use(bodyParser.json());

server.post('/wallet', (_, res) => {
  const wallet = WalletGenerator.create();
  console.log(`wallet created`);
  res.send(wallet);
});

server.post('/blockchain/start', (req, res) => {
  console.log(`start blockchain`);
  const { wallets } = req.body;
  wallets.forEach(wallet => {
    blockchain.addRewardTransaction(wallet);
  });
  res.send(true);
});

server.listen(8080, () => {
  console.log(`Listenning on port ${8080}`);
});
