import * as net from 'net';

export class Peer {
  private connections: net.Socket[];

  constructor(port: number) {
    const server = net
      .createServer(socket => {
        this.onSocketConnected(socket);
      })
      .listen(port, () => {
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

    this.onConnection(socket);
  }

  onData(socket: net.Socket, data: any) {
    console.log(`Data received: ${data.toString}`);
  }

  onConnection(socket: net.Socket) {
    socket.write('opa ne q deu');
  }
}
