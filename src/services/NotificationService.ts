import { Service } from 'typedi';
import IPushNotificationRequest from '../model/request/IPushNotificationRequest';
import { ObjectMapper } from 'jackson-js';
import { Models } from 'common';
import config from '../Config';
import { getInstance } from './KafkaProducerService';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MongoRepository } from 'typeorm';
import Notification from '../model/entities/Notification';

@Service()
export default class NotificationService {
  @InjectRepository(Notification)
  private notificationRepository: MongoRepository<Notification>;

  public async pushNotification(request: IPushNotificationRequest, transactionId: string | number) {
    const objectMapper: ObjectMapper = new ObjectMapper();
    const notificationMessage: Models.NotificationMessage = new Models.NotificationMessage();
    notificationMessage.setMethod(Models.MethodEnum.FIREBASE);
    const firebaseConfiguration: Models.FirebaseConfiguration = new Models.FirebaseConfiguration();
    firebaseConfiguration.setType(request.type);
    firebaseConfiguration.setToken(request.token);
    firebaseConfiguration.setCondition(request.condition);
    firebaseConfiguration.setNotification({
      title: request.title,
    });
    firebaseConfiguration.setData({ click_action: 'FLUTTER_NOTIFICATION_CLICK' });
    const data: string = request.condition;
    const templateMap: Map<string, Object> = new Map<string, Object>([[request.template, data]]);
    notificationMessage.setConfiguration(firebaseConfiguration, objectMapper);
    notificationMessage.setTemplate(templateMap);
    getInstance().sendMessage(transactionId.toString(), config.topic.notification, '', notificationMessage);
    if (request.isSave) {
      const notification: Notification = new Notification();
      notification.userId = request.userId;
      notification.title = request.title;
      notification.content = request.content;
      notification.isRead = false;
      await this.notificationRepository.save(notification);
    }
  }
}
