import * as net from 'net';
import { SignalSocket } from './signal-socket';
import { BlockChain } from '../lib/blockchain';

enum Events {
  START_BLOCKCHAIN = 'START_BLOCKCHAIN'
}

export class Peer {
  private blockchain: BlockChain;
  private signature: string;
  private connections: net.Socket[] = [];
  private signalSocket: SignalSocket;
  private isCentralNode: boolean;
  private events = [];

  constructor(
    blockchain: BlockChain,
    port: number,
    signature: string,
    signalSocket: any
  ) {
    this.signature = signature;
    this.signalSocket = new SignalSocket(signalSocket);
    this.blockchain = blockchain;
    this.isCentralNode = signalSocket.isCentralNode;

    net
      .createServer(socket => {
        this.onSocketConnected(socket);
      })
      .listen(port, () => {
        if (this.isCentralNode) {
          this.signalSocket.server(this.signature, 'localhost', port);
          this.events = [Events.START_BLOCKCHAIN];
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
    const json = JSON.parse(data.toString());

    // if the message is from this node or already received ignore
    if (this.signature === json.signature) return;

    const event = this.events.find(n => n === json.event);
    if (!event) {
      if (json.event === Events.START_BLOCKCHAIN) {
        this.blockchain.rebuild(json.payload, json.config);
        this.events.push(Events.START_BLOCKCHAIN);
      }
    }

    // change it to a map to keep the content with the hash
    // this.receivedMessages.push(json.signature);
    console.log(`Data received: ${JSON.stringify(json)}`);
  }

  onConnection(socket: net.Socket) {
    socket.write(
      JSON.stringify({
        signature: this.signature,
        event: Events.START_BLOCKCHAIN,
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
