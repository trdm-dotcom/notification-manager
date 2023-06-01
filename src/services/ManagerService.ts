import { Service } from 'typedi';
import IQueryNotificationResponse from '../model/response/IQueryNotificationResponse';
import { IQueryNotificationRequest } from '../model/request/IQueryNotificationRequest';
import { IDataRequest } from 'common/build/src/modules/models';
import IRemarkNotificationRequest from '../model/request/IRemarkNotificationRequest';
import { Errors, Utils } from 'common';
import * as moment from 'moment';
import { INotification, NotificationModel } from '../model/schema/NotificationSchema';
import mongoose from 'mongoose';

@Service()
export default class ManagerService {
  public async queryAll(request: IQueryNotificationRequest) {
    const limit = request.pageSize == null ? 20 : Math.min(request.pageSize, 100);
    const offset = request.pageNumber == null ? 0 : Math.max(request.pageNumber - 1, 0) * limit;
    const now: Date = moment().toDate();
    const start: Date = Utils.subtractTime(now, 3, 'month');
    const list: INotification[] = await NotificationModel.find(
      {
        userId: request.headers.token.userData.id,
        createdAt: {
          $gte: start,
          $lte: now,
        },
      },
      null,
      {
        limit: limit,
        skip: offset,
        sort: { createdAt: -1 },
      }
    );

    return list.map((value: INotification, index: number) => {
      const item: IQueryNotificationResponse = {
        id: value._id.toString(),
        title: value.title,
        content: value.content,
        date: value.createdAt,
        isRead: value.isRead,
      };
      return item;
    });
  }

  public async countUnreadNotifications(request: IDataRequest) {
    const result = await NotificationModel.countDocuments({
      userId: request.headers.token.userData.id,
      isRead: false,
    });
    return { result: result };
  }

  public async remarkNotification(request: IRemarkNotificationRequest) {
    var condition = { userId: request.headers.token.userData.id, isRead: false };
    if (request.notificationId != null) {
      const objectIds: mongoose.Types.ObjectId[] = request.notificationId.map((id) => new mongoose.Types.ObjectId(id));
      console.log(objectIds);
      condition = {
        ...{ _id: { $in: objectIds } },
        ...condition,
      };
    }
    const result = await NotificationModel.updateMany(condition, {
      $set: { isRead: true },
    });
    if (result.modifiedCount < 1) {
      throw new Errors.GeneralError('UPDATE_NOTIFICATION_FAIL');
    }
    return {};
  }
}
