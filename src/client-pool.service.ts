import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ClientPoolService {

  pool: {
    user: any,
    subject: Subject<any>
  }[] = [];

  response = new Subject<any>();

  connections() {
    return this.pool;
  }

  add(connection) {
    const existing = this.pool.find(p => p.user._session_id === connection.user._session_id);
    if (!existing) {
      this.pool.push(connection);
      console.log(`new client ${connection.user.hostname}`);
    }
  }

  disconnect(user) {
    const connection = this.pool.find(p => p.user._session_id === user._session_id);
    if (connection) {
      connection.subject.complete();
      console.log(`disconnected ${user.hostname}`);
    }
  }

  commandResponse(response) {
    this.response.next(response);
  };

  sendCommand(user, { action, data }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const connection = this.pool.find(p => p.user._session_id === user._session_id);
      if (connection) {
        const uid = `${(new Date()).getTime()}-${Math.random().toString(36).substr(2)}`;
        connection.subject.next({ uid, action, data: JSON.stringify(data) });

        const subscription = this.response.subscribe(rs => {
          if (rs.uid === uid) {
            resolve(rs);
            subscription.unsubscribe();
          }
        });

        setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error('request timeout'));
        }, 30000); // can change the timeout to aspect the data return
      } else {
        reject(new Error(`user connection not found.`));
      }
    });
  }
}
