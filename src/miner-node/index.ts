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
const io = getSignalSocket(socketIOPort, false);

const blockchain = new BlockChain(false, 2, 10);
const peer = new Peer(blockchain, port, signature, {
  io,
  isCentralNode: false
});
