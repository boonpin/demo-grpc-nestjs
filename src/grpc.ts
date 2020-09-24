import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const GrpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: '0.0.0.0:50051',
    package: ['heartbeat', 'command'],
    protoPath: [
      join(__dirname, 'proto/heartbeat.proto'),
      join(__dirname, 'proto/command.proto'),
    ],
  },
};
