import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'user_id' })
  userId: number;
  @Column({ name: 'title' })
  title: string;
  @Column({ name: 'content' })
  content: string;
  @Column({ name: 'is_read' })
  isRead: boolean;
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
