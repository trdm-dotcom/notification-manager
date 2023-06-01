import { IDataRequest } from 'common/build/src/modules/models';

export interface IQueryNotificationRequest extends IDataRequest {
  pageNumber?: number;
  pageSize?: number;
}
