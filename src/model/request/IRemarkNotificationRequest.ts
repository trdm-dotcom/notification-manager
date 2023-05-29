import { IDataRequest } from 'common/build/src/modules/models';

export default interface IRemarkNotificationRequest extends IDataRequest {
  notificationId?: number[];
}
