import * as net from 'net';

export class Peer {
  private server;
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

  onSocketConnected(socket: any) {
    console.log('New connection');
  }
}
