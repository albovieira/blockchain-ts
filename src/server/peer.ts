import * as net from 'net';

export class Peer {
  private signature: string;
  private connections: net.Socket[] = [];
  private receivedMessages: any[] = [];

  constructor(port: number, signature: string) {
    this.signature = signature;
    net
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
