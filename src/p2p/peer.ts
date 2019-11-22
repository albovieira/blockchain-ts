import * as net from 'net';
import { SignalSocket } from './signal-socket';
import { BlockChain } from '../lib/blockchain';
import { Block } from '../lib/block';

export class Peer {
  private blockchain: BlockChain;
  private signature: string;
  private connections: net.Socket[] = [];
  private receivedMessages: any[] = [];
  private signalSocket: SignalSocket;

  constructor(
    blockchain: BlockChain,
    port: number,
    signature: string,
    signalSocket: any
  ) {
    this.signature = signature;
    this.signalSocket = new SignalSocket(signalSocket);
    this.blockchain = blockchain;

    net
      .createServer(socket => {
        this.onSocketConnected(socket);
      })
      .listen(port, () => {
        if (signalSocket.isCentralNode) {
          this.signalSocket.server(this.signature, 'localhost', port);
        } else {
          this.signalSocket.client(this.signature, 'localhost', port, this);
        }
        console.log(`Listening on port ${port}`);
      });
  }

  connectTo(address: string) {
    const addressParts = address.split(':');
    if (addressParts.length !== 2) {
      throw new Error('Invalid host');
    }
    const [host, port] = addressParts;
    const socket = net.createConnection({ host, port } as any, () => {
      this.onSocketConnected(socket);
    });
  }

  onSocketConnected(socket: net.Socket) {
    this.connections.push(socket);
    socket.on('data', data => this.onData(socket, data));
    socket.on('close', () => {
      this.connections = this.connections.filter(conn => conn !== socket);
    });
    this.onConnection(socket);
  }

  onData(socket: net.Socket, data: any) {
    const json = data.toString();
    const payload = JSON.parse(json);

    // if the message is from this node or already received ignore
    if (
      this.signature === payload.signature ||
      this.receivedMessages.includes(payload.signature)
    )
      return;

    // change it to a map to keep the content with the hash
    this.receivedMessages.push(payload.signature);
    console.log(`Data received: ${JSON.stringify(payload)}`);
  }

  onConnection(socket: net.Socket) {
    socket.write(
      JSON.stringify({
        signature: this.signature,
        payload: this.blockchain.show(),
        config: this.blockchain.getConfig()
      })
    );
  }

  broadcast(data: any) {
    console.log(this.connections);
    this.connections.forEach(con => con.write(data));
    console.log(`Data broadcasted, ${JSON.stringify(data)}`);
  }
}
