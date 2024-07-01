import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

declare module 'next' {
  interface NextApiResponseServerIO extends NextApiResponse {
    socket: {
      server: HttpServer & { io?: SocketIOServer };
    };
  }
}
