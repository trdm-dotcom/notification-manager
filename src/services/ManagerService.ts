import { IDataRequest } from 'common/build/src/modules/models';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../Connection';
import Notification from '../model/entities/Nofitication';
import IQueryNotificationResponse from '../model/response/IQueryNotificationResponse';

@Service()
export default class ManagerService {
  private notificationRepository: Repository<Notification> = AppDataSource.getRepository(Notification);

  public async queryAll(request: IDataRequest) {
    return (
      await this.notificationRepository.findBy({ userid: request.headers.token.userData.id, deletedAt: null })
    ).map((value: Notification, index: number) => {
      const item: IQueryNotificationResponse = {};
      return item;
    });
  }
}
