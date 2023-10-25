import { Service } from 'typedi';
import IPushNotificationRequest from '../model/request/IPushNotificationRequest';
import { ObjectMapper } from 'jackson-js';
import { Models } from 'common';
import config from '../Config';
import { getInstance } from './KafkaProducerService';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MongoRepository } from 'typeorm';
import Notification from '../model/entities/Notification';
import NotificationConfig from '../model/entities/NotificationConfig';

@Service()
export default class NotificationService {
  @InjectRepository(Notification)
  private notificationRepository: MongoRepository<Notification>;
  @InjectRepository(NotificationConfig)
  private notificationConfigRepository: MongoRepository<NotificationConfig>;

  public async pushNotification(request: IPushNotificationRequest, transactionId: string | number) {
    const notificationConfigs: NotificationConfig[] = await this.notificationConfigRepository.find({
      where: {
        userId: request.userId,
      },
    });
    if (
      (notificationConfigs != null && notificationConfigs.some((value: NotificationConfig) => value.isReceive)) ||
      request.token
    ) {
      const objectMapper: ObjectMapper = new ObjectMapper();
      const notificationMessage: Models.NotificationMessage = new Models.NotificationMessage();
      notificationMessage.setMethod(Models.MethodEnum.FIREBASE);
      const firebaseConfiguration: Models.FirebaseConfiguration = new Models.FirebaseConfiguration();
      firebaseConfiguration.setType(request.type);
      firebaseConfiguration.setTokens(
        request.token
          ? [request.token]
          : notificationConfigs
              .filter((value: NotificationConfig) => value.isReceive)
              .map((value: NotificationConfig) => value.registrationToken)
      );
      firebaseConfiguration.setCondition(request.condition);
      firebaseConfiguration.setNotification({
        title: request.title != null ? request.title : 'Fotei',
      });
      const templateMap: Map<string, Object> = new Map<string, Object>([[request.template, request.content]]);
      notificationMessage.setConfiguration(firebaseConfiguration, objectMapper);
      notificationMessage.setTemplate(templateMap);
      getInstance().sendMessage(transactionId.toString(), config.topic.notification, '', notificationMessage);
      if (request.isSave) {
        const notification: Notification = new Notification();
        notification.userId = request.userId;
        notification.isRead = false;
        notification.sourceId = request.sourceId;
        notification.type = request.notificationType;
        await this.notificationRepository.save(notification);
      }
    }
  }
}
