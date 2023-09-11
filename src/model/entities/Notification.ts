import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export default class Notification {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  userId: number;
  @Column()
  title: string;
  @Column()
  content: string;
  @Column()
  isRead: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  isReceive: unknown;
}
