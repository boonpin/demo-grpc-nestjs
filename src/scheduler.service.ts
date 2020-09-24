import { Injectable } from '@nestjs/common';
import { ClientPoolService } from './client-pool.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {

  constructor(private pool: ClientPoolService) {
  }

  @Interval(5000)
  randomGetData() {
    this.pool.connections().forEach(async connection => {
      console.log(`requesting ${connection.user.hostname} SHOW TIME`);
      try {
        const rs = await this.pool.sendCommand(connection.user, {
          action: 'SHOW_TIME',
          data: JSON.stringify({ format: 'YYYY-MM-DD HH:mm:ss' }),
        });
        console.log('response', rs);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
