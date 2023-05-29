import { Service } from 'typedi';
import IPushNotificationRequest from '../model/request/IPushNotificationRequest';
import { ObjectMapper } from 'jackson-js';
import { FirebaseConfiguration, Kafka, MethodEnum, NotificationMessage } from 'common';
import config from '../config';
import { Repository } from 'typeorm';
import Notification from '../model/entities/Nofitication';
import { AppDataSource } from '../Connection';

@Service()
export default class NotificationService {
  private notificationRepository: Repository<Notification> = AppDataSource.getRepository(Notification);

  public async pushNotification(request: IPushNotificationRequest, transactionId: string | number) {
    const objectMapper: ObjectMapper = new ObjectMapper();
    let notificationMessage: NotificationMessage = new NotificationMessage();
    notificationMessage.setMethod(MethodEnum.FIREBASE);
    let firebaseConfiguration: FirebaseConfiguration = new FirebaseConfiguration();
    firebaseConfiguration.setType(request.type);
    firebaseConfiguration.setToken(request.token);
    firebaseConfiguration.setCondition(request.condition);
    firebaseConfiguration.setNotification({
      title: request.title,
    });
    firebaseConfiguration.setData({ click_action: 'FLUTTER_NOTIFICATION_CLICK' });
    let data: string = request.condition;
    let templateMap: Map<string, Object> = new Map<string, Object>([[request.template, data]]);
    notificationMessage.setConfiguration(firebaseConfiguration, objectMapper);
    notificationMessage.setTemplate(templateMap);
    Kafka.getInstance().sendMessage(transactionId.toString(), config.topic.notification, '', notificationMessage);
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
