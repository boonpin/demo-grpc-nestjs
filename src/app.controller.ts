import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { GrpcGuard } from './grpc.guard';
import { ClientPoolService } from './client-pool.service';
import * as jwt from 'jsonwebtoken';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private pool: ClientPoolService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @GrpcStreamMethod('HeartbeatService', 'Establish')
  @UseGuards(GrpcGuard)
  heartbeat(message: Observable<any>, metadata: any): Observable<any> {
    const user = jwt.decode(metadata.get('authorization')[0]);
    const subject = new Subject();
    message.subscribe((data) => {
      console.log('Heartbeat', data);
    }, err => {
      console.error(err);
    }, () => {
      console.log(`client ${user.hostname} heartbeat disconnected`);
      subject.complete();
    });
    return subject.asObservable();
  }

  @GrpcStreamMethod('CommandService', 'Establish')
  @UseGuards(GrpcGuard)
  command(message: Observable<any>, metadata: any): Observable<any> {
    const user = jwt.decode(metadata.get('authorization')[0]);
    user._session_id = `${(new Date()).getTime()}-${Math.random().toString(36).substr(2)}`;
    const subject = new Subject();
    message.subscribe((data) => {
      this.pool.commandResponse(data);
    }, err => {
      console.error(err);
    }, () => {
      this.pool.disconnect(user);
    });
    this.pool.add({ user, subject });
    return subject.asObservable();
  }
}
