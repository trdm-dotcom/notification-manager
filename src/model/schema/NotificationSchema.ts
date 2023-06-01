import { model, Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: Number,
    title: String,
    content: String,
    isRead: Boolean,
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

export const NotificationModel = model<INotification>('c_notification', NotificationSchema);
