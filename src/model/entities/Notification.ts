import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class Notification {
  @ObjectIdColumn()
  id: ObjectID;
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
