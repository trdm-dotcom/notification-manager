import { Models } from 'common';

export default interface IPushNotificationRequest {
  userId?: number;
  title?: string;
  content?: string;
  template?: string;
  isSave?: boolean;
  type?: Models.FirebaseType;
  condition?: string;
  token?: string;
}
