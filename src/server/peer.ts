import * as net from 'net';

export class Peer {
  private server;
  constructor(port: number) {
    if (!this.server) {
      this.server = net
        .createServer(() => {
          console.log('new connection');
        })
        .listen(port, () => {
          console.log(`Listening on port ${port}`);
        });
    }
  }

  connectTo(address: string) {
    const addressParts = address.split(':');
    if (addressParts.length !== 2) {
      throw new Error('Invalid host');
    }
    const [host, port] = addressParts;
    net.createConnection({ host, port } as any, () => {
      console.log('Connection created successfully');
    });
  }
}
