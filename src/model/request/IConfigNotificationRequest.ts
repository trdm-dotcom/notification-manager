import { IDataRequest } from 'common/build/src/modules/models';

export default interface IConfigNotificationRequest extends IDataRequest {
  isReceive?: boolean;
  registrationToken?: string;
  deviceId?: string;
}
