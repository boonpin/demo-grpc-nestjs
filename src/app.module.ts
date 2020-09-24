import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcGuard } from './grpc.guard';
import { ClientPoolService } from './client-pool.service';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, ClientPoolService, SchedulerService, GrpcGuard],
})
export class AppModule {
}
