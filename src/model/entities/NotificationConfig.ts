import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class NotificationConfig {
  @ObjectIdColumn()
  id: ObjectID;
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
