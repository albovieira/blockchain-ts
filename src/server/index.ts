import { config } from 'dotenv';
import { Peer } from './peer';

config();

const port = Number(process.env.PORT) || 3001;

const peers = ['localhost:3002', 'localhost:3003', 'localhost:3004'];
const peer = new Peer(port);

peers.forEach(host => {
  peer.connectTo(host);
});
