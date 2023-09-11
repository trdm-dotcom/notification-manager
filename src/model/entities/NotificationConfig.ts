import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export default class NotificationConfig {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  userId: number;
  @Column()
  isReceive: boolean;
  @Column()
  deviceId: string;
  @Column()
  registrationToken: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
