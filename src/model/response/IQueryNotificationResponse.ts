import { NotificationType } from '../enum/NotificationType';

export default interface IQueryNotificationResponse {
  id: string;
  type: NotificationType;
  author: any;
  sourceId: any;
  date: Date;
  isRead: boolean;
}
