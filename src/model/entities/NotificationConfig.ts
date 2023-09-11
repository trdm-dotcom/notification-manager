import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class NotificationConfig {
  @ObjectIdColumn()
  userId: number;
  @Column()
  isReceive: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
