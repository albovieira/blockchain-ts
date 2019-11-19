import { config } from 'dotenv';
import { Peer } from './peer';

config();

const port = Number(process.env.PORT) || 3000;

const peer = new Peer(port);

// const peers = ['localhost:3002'];
// peers.forEach(host => {
//   peer.connectTo(host);
// });

/**
 * Subir primeiro um primeiro no;
 * apos subir o primeiro no subir os outros passando o endereco dos outros
 *
 */
