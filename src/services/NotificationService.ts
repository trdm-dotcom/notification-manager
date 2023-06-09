import { Service } from 'typedi';
import IPushNotificationRequest from '../model/request/IPushNotificationRequest';
import { ObjectMapper } from 'jackson-js';
import { Models } from 'common';
import config from '../Config';
import { INotification, NotificationModel } from '../model/schema/NotificationSchema';
import { getInstance } from './KafkaProducerService';

@Service()
export default class NotificationService {
  public async pushNotification(request: IPushNotificationRequest, transactionId: string | number) {
    const objectMapper: ObjectMapper = new ObjectMapper();
    let notificationMessage: Models.NotificationMessage = new Models.NotificationMessage();
    notificationMessage.setMethod(Models.MethodEnum.FIREBASE);
    let firebaseConfiguration: Models.FirebaseConfiguration = new Models.FirebaseConfiguration();
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
    getInstance().sendMessage(transactionId.toString(), config.topic.notification, '', notificationMessage);
    if (request.isSave) {
      const notification: INotification = new NotificationModel({
        userId: request.userId,
        title: request.title,
        content: request.content,
        isRead: false,
      });
      await notification.save();
    }
  }
}
