import { Models } from 'common';
import { NotificationType } from '../enum/NotificationType';

export default interface IPushNotificationRequest {
  userId: number;
  content: string;
  template: string;
  type: Models.FirebaseType;
  isSave: boolean;
  title?: string;
  sourceId?: any;
  notificationType?: NotificationType;
  authorId?: number;
  condition?: string;
  token?: string;
}
