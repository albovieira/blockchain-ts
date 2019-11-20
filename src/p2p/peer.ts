import * as net from 'net';
import { Socket } from 'socket.io';

export class Peer {
  private signature: string;
  private connections: net.Socket[] = [];
  private receivedMessages: any[] = [];
  private hostsConnected = [];

  constructor(port: number, signature: string, signalSocket: any) {
    this.signature = signature;
    this.hostsConnected = [{ signature, socketId: 1 }];
    net
      .createServer(socket => {
        this.onSocketConnected(socket);
      })
      .listen(port, () => {
        if (signalSocket.isCentralNode) {
          //it should be refactored to use separate signnal socket of server socket
          signalSocket.io.on('connection', (socket: Socket) => {
            socket.on('message', signature => {
              console.log(`signature from signal socket ${signature}`);

              const foundPeer = this.hostsConnected.find(
                h => h.signature === signature
              );

              if (!foundPeer) {
                this.hostsConnected.push({ signature, socketId: socket.id });
                signalSocket.io.sockets.emit(
                  'UPDATE_HOSTS',
                  this.hostsConnected
                );
                console.log(
                  `Hosts connected ${JSON.stringify(this.hostsConnected)}`
                );
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
                signalSocket.io.sockets.emit(
                  'UPDATE_HOSTS',
                  this.hostsConnected
                );
                console.log(`signal socket closed for ${id}`);
              }
              console.log(`peer disconnected`);
            });
          });
        } else {
          signalSocket.io.on('connect', () => {
            //client host signature sent to server
            signalSocket.io.send(this.signature);

            signalSocket.io.on('UPDATE_HOSTS', msg => {
              console.log(`getting broadcast message: ${JSON.stringify(msg)}`);
              this.hostsConnected = msg;
            });
          });
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
        payload: { message: 'All peers hearing' }
      })
    );
  }

  broadcast(data: any) {
    console.log(this.connections);
    this.connections.forEach(con => con.write(data));
    console.log(`Data broadcasted, ${JSON.stringify(data)}`);
  }
}
