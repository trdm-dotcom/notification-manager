import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { NotificationType } from '../enum/NotificationType';

@Entity()
export default class Notification {
  @ObjectIdColumn()
  id: ObjectID;
  @Column()
  userId: number;
  @Column()
  authorId: number;
  @Column()
  type: NotificationType;
  @Column()
  sourceId: any;
  @Column()
  isRead: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  isReceive: unknown;
}
