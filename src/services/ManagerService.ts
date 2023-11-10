import { Service } from 'typedi';
import { IQueryNotificationRequest } from '../model/request/IQueryNotificationRequest';
import { IDataRequest } from 'common/build/src/modules/models';
import IRemarkNotificationRequest from '../model/request/IRemarkNotificationRequest';
import { Errors, Logger, Utils } from 'common';
import * as moment from 'moment';
import NotificationConfig from '../model/entities/NotificationConfig';
import Notification from '../model/entities/Notification';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MongoRepository } from 'typeorm';
import IConfigNotificationRequest from '../model/request/IConfigNotificationRequest';
import { ObjectID } from 'mongodb';
import { getInstance } from './KafkaProducerService';
import { IMessage } from 'kafka-common/build/src/modules/kafka';
import { Kafka } from 'kafka-common';

@Service()
export default class ManagerService {
  @InjectRepository(NotificationConfig)
  private notificationConfigRepository: MongoRepository<NotificationConfig>;

  @InjectRepository(Notification)
  private notificationRepository: MongoRepository<Notification>;

  public async queryAll(request: IQueryNotificationRequest, msgId: string | number) {
    const limit = request.pageSize == null ? 20 : Math.min(request.pageSize, 100);
    const offset = request.pageNumber == null ? 0 : Math.max(request.pageNumber, 0) * limit;
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
    const count: number = await this.notificationRepository.count({
      userId: request.headers.token.userData.id,
      createdAt: {
        $gte: start,
        $lte: now,
      },
    });
    const users: Set<number> = new Set<number>();
    list.forEach((item: Notification) => {
      users.add(item.authorId);
    });
    const userInfosRequest = {
      userIds: Array.from(users),
      headers: request.headers,
    };
    try {
      const userInfosResponse: IMessage = await getInstance().sendRequestAsync(
        `${msgId}`,
        'user',
        'internal:/api/v1/userInfos',
        userInfosRequest
      );
      const userInfosData = Kafka.getResponse<any[]>(userInfosResponse);
      const mapUserInfos: Map<number, any> = new Map();
      userInfosData.forEach((info: any) => {
        mapUserInfos.set(info.id, info);
      });
      const datas: any[] = [];
      list.forEach((value: Notification, index: number) => {
        const authorInfo = mapUserInfos.get(value.authorId);
        if (authorInfo && authorInfo.status === 'ACTIVE') {
          datas.push({
            id: value.id.toHexString(),
            author: authorInfo,
            sourceId: value.sourceId,
            type: value.type,
            date: value.createdAt,
            isRead: value.isRead,
          });
        }
      });
      return {
        total: count,
        datas: datas,
        page: request.pageNumber,
        totalPages: Math.ceil(count / limit),
      };
    } catch (err) {
      Logger.error(`${msgId} fail to send message`, err);
      return {
        total: 0,
        datas: [],
        page: 0,
        totalPages: 0,
      };
    }
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
      const objectIds: ObjectID[] = request.notificationId.map((id) => new ObjectID(id));
      condition = {
        ...{ _id: { $in: objectIds } },
        ...condition,
      };
    }
    try {
      await this.notificationRepository.updateMany(condition, {
        $set: { isRead: true },
      });
    } catch (err) {
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

  public async getNotificationSetting(request: IConfigNotificationRequest) {
    const userId = request.headers.token.userData.id;
    const invalidParams = new Errors.InvalidParameterError();
    Utils.validate(request.deviceId, 'deviceId').setRequire().throwValid(invalidParams);
    const config: NotificationConfig = await this.notificationConfigRepository.findOne({
      userId: userId,
      deviceId: request.deviceId,
    });
    if (config == null) {
      return { receive: false };
    }
    return { receive: config.isReceive };
  }
}
