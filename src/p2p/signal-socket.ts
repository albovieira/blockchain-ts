import { Socket } from 'socket.io';
import { Peer } from './peer';
import { BlockChain } from '../lib/blockchain';
import { Block } from '../lib/block';

export class SignalSocket {
  private signalSocket;
  private hostsConnected = [];

  constructor(signalSocket: any) {
    this.signalSocket = signalSocket;
  }

  server(
    serverSignature: string,
    serverHost: string,
    serverPort: number
  ): void {
    this.hostsConnected = [
      {
        signature: serverSignature,
        socketId: 1,
        host: serverHost,
        port: serverPort
      }
    ];

    this.signalSocket.io.on('connection', (socket: Socket) => {
      socket.on('message', data => {
        console.log(`signature from signal socket ${JSON.stringify(data)}`);

        const foundPeer = this.hostsConnected.find(
          h => h.signature === data.signature
        );

        if (!foundPeer) {
          this.hostsConnected.push({
            signature: data.signature,
            host: data.host,
            port: data.port,
            socketId: socket.id
          });
          this.signalSocket.io.sockets.emit(
            'UPDATE_HOSTS',
            this.hostsConnected
          );
          console.log(`Hosts connected ${JSON.stringify(this.hostsConnected)}`);
        }
      });
      socket.on('disconnect', () => {
        const id = socket.client.id;

        const peerDisconnected = this.hostsConnected.find(
          h => h.socketId === id
        );
        if (peerDisconnected) {
          this.hostsConnected = this.hostsConnected.filter(
            h => h.socketId !== id
          );
          this.signalSocket.io.sockets.emit(
            'UPDATE_HOSTS',
            this.hostsConnected
          );
          console.log(`signal socket closed for ${id}`);
        }
        console.log(`peer disconnected`);
      });
    });
  }

  client(signature: string, host: string, port: number, peer: Peer): void {
    this.signalSocket.io.on('connect', () => {
      //client host signature sent to server
      this.signalSocket.io.send({ signature, host, port });

      this.signalSocket.io.on('UPDATE_HOSTS', msg => {
        console.log(`getting broadcast message: ${JSON.stringify(msg)}`);
        this.hostsConnected = msg;
        this.hostsConnected.forEach(machine => {
          peer.connectTo(`${machine.host}:${machine.port}`);
        });
      });
    });
  }
}
