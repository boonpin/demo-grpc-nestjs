import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GrpcGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const metadata = context.getArgByIndex(1);
    try {
      const token = metadata.get('authorization')[0];
      jwt.verify(token, `my-secret-1234`);
    } catch (e) {
      throw new RpcException(e);
    }

    return true;
  }
}
