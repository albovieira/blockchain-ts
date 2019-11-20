import { Socket } from 'socket.io';

export class SignalSocket {
  private signalSocket;
  private hostsConnected = [];

  constructor(signalSocket: any) {
    this.signalSocket = signalSocket;
  }

  server(serverSignature: string): void {
    this.hostsConnected = [{ signature: serverSignature, socketId: 1 }];

    this.signalSocket.io.on('connection', (socket: Socket) => {
      socket.on('message', signature => {
        console.log(`signature from signal socket ${signature}`);

        const foundPeer = this.hostsConnected.find(
          h => h.signature === signature
        );

        if (!foundPeer) {
          this.hostsConnected.push({ signature, socketId: socket.id });
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

  client(signature: string): void {
    this.signalSocket.io.on('connect', () => {
      //client host signature sent to server
      this.signalSocket.io.send(signature);

      this.signalSocket.io.on('UPDATE_HOSTS', msg => {
        console.log(`getting broadcast message: ${JSON.stringify(msg)}`);
        this.hostsConnected = msg;
      });
    });
  }
}
