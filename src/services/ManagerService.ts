import { Service } from 'typedi';
import IQueryNotificationResponse from '../model/response/IQueryNotificationResponse';
import { IQueryNotificationRequest } from '../model/request/IQueryNotificationRequest';
import { IDataRequest } from 'common/build/src/modules/models';
import IRemarkNotificationRequest from '../model/request/IRemarkNotificationRequest';
import { Errors, Utils } from 'common';
import * as moment from 'moment';
import NotificationConfig from '../model/entities/NotificationConfig';
import Notification from '../model/entities/Notification';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MongoRepository, ObjectID, UpdateWriteOpResult } from 'typeorm';
import IConfigNotificationRequest from '../model/request/IConfigNotificationRequest';

@Service()
export default class ManagerService {
  @InjectRepository(NotificationConfig)
  private notificationConfigRepository: MongoRepository<NotificationConfig>;

  @InjectRepository(Notification)
  private notificationRepository: MongoRepository<Notification>;

  public async queryAll(request: IQueryNotificationRequest) {
    const limit = request.pageSize == null ? 20 : Math.min(request.pageSize, 100);
    const offset = request.pageNumber == null ? 0 : Math.max(request.pageNumber - 1, 0) * limit;
    const now: Date = moment().toDate();
    const start: Date = Utils.subtractTime(now, 3, 'month');
    const list: Notification[] = await this.notificationRepository.find({
      where: {
        userId: request.headers.token.userData.id,
        createdAt: {
          $gte: start,
          $lte: now,
        },
      },
      take: limit,
      skip: offset,
      order: { createdAt: -1 },
    });

    return list.map((value: Notification, index: number) => {
      const item: IQueryNotificationResponse = {
        id: value.id.toHexString(),
        title: value.title,
        content: value.content,
        date: value.createdAt,
        isRead: value.isRead,
      };
      return item;
    });
  }

  public async countUnreadNotifications(request: IDataRequest) {
    const result: number = await this.notificationRepository.count({
      userId: request.headers.token.userData.id,
      isRead: false,
    });
    return { result: result };
  }

  public async remarkNotification(request: IRemarkNotificationRequest) {
    const userId = request.headers.token.userData.id;
    var condition = { userId: userId, isRead: false };
    if (request.notificationId != null) {
      const objectIds: ObjectID[] = request.notificationId.map((id) => ObjectID.createFromHexString(id));
      condition = {
        ...{ _id: { $in: objectIds } },
        ...condition,
      };
    }
    const result: UpdateWriteOpResult = await this.notificationRepository.updateMany(condition, {
      $set: { isRead: true },
    });
    if (result.modifiedCount < 1) {
      throw new Errors.GeneralError('UPDATE_NOTIFICATION_FAIL');
    }
    return {};
  }

  public async receiveNotification(request: IConfigNotificationRequest) {
    const invalidParams = new Errors.InvalidParameterError();
    Utils.validate(request.isReceive, 'isReceive').setRequire().throwValid(invalidParams);
    Utils.validate(request.deviceId, 'deviceId').setRequire().throwValid(invalidParams);
    if (request.isReceive) {
      Utils.validate(request.registrationToken, 'registrationToken').setRequire().throwValid(invalidParams);
    }
    invalidParams.throwErr();
    const userId = request.headers.token.userData.id;
    await this.notificationConfigRepository.updateOne(
      {
        userId: userId,
        deviceId: request.deviceId,
      },
      {
        $set: {
          isReceive: request.isReceive,
          registrationToken: request.registrationToken,
          deviceId: request.deviceId,
        },
      },
      {
        upsert: true,
      }
    );
    return {};
  }
}
