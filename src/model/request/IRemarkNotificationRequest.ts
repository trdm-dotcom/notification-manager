import { IDataRequest } from 'common/build/src/modules/models';
import { ObjectId } from 'mongodb';

export default interface IRemarkNotificationRequest extends IDataRequest {
  notificationId?: ObjectId[];
}
