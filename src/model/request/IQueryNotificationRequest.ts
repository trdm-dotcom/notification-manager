import { IDataRequest } from 'common/build/src/modules/models';
import { Period } from '../enum/Period';

export interface IQueryNotificationRequest extends IDataRequest {
  period?: Period;
  pageNumber?: number;
  pageSize?: number;
}
