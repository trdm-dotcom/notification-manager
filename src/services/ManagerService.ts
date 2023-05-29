import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../Connection';
import Notification from '../model/entities/Nofitication';
import IQueryNotificationResponse from '../model/response/IQueryNotificationResponse';
import { IQueryNotificationRequest } from '../model/request/IQueryNotificationRequest';
import { IDataRequest } from 'common/build/src/modules/models';
import IRemarkNotificationRequest from '../model/request/IRemarkNotificationRequest';
import { Errors } from 'common';

@Service()
export default class ManagerService {
  private notificationRepository: Repository<Notification> = AppDataSource.getRepository(Notification);

  public async queryAll(request: IQueryNotificationRequest) {
    const limit = request.pageSize == null ? 20 : Math.min(request.pageSize, 100);
    const offset = request.pageNumber == null ? 0 : Math.max(request.pageNumber - 1, 0) * limit;

    const list: Notification[] = await this.notificationRepository
      .createQueryBuilder('notification')
      .where(
        'notification.userId = :userId and notification.createdAt BETWEEN DATE_SUB(CURDATE(), interval 6 month) AND NOW()',
        {
          userId: request.headers.token.userData.id,
        }
      )
      .orderBy('notification.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    return list.map((value: Notification, index: number) => {
      const item: IQueryNotificationResponse = {
        id: value.id,
        title: value.title,
        content: value.content,
        date: value.createdAt,
        isRead: value.isRead,
      };
      return item;
    });
  }

  public async countUnreadNotifications(request: IDataRequest) {
    return this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId AND notification.isRead IS FALSE', {
        userId: request.headers.token.userData.id,
      })
      .getCount();
  }

  public async remarkNotification(request: IRemarkNotificationRequest) {
    try {
      if (request != null) {
        await this.notificationRepository
          .createQueryBuilder('notification')
          .update(Notification)
          .set({ isRead: true })
          .where(
            'notification.userId = :userId AND notification.id IN (:notification) AND notification.isRead IS FALSE',
            {
              userId: request.headers.token.userData.id,
              notification: request.notificationId,
            }
          )
          .execute();
      } else {
        await this.notificationRepository
          .createQueryBuilder('notification')
          .update(Notification)
          .set({ isRead: true })
          .where('notification.userId = :userId AND notification.isRead IS FALSE', {
            userId: request.headers.token.userData.id,
            notification: request.notificationId,
          })
          .execute();
      }
    } catch (error) {
      throw new Errors.GeneralError('UPDATE_NOTIFICATION_FAIL');
    }
    return {};
  }
}
