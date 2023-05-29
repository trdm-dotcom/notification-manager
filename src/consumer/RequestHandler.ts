import { Errors, Kafka, Logger } from 'common';
import { Inject, Service } from 'typedi';
import config from '../config';
import NotificationService from '../services/NotificationService';
import ManagerService from '../services/ManagerService';

@Service()
export default class RequestHandler {
  @Inject()
  private notificationService: NotificationService;
  @Inject()
  private managerService: ManagerService;

  public init() {
    const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(Kafka.getInstance());
    Kafka.createConsumer(
      config,
      config.kafkaConsumerOptions,
      config.requestHandlerTopics,
      (message: Kafka.IKafkaMessage) => handle.handle(message, this.handleRequest),
      config.kafkaTopicOptions
    );
  }
  private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
    Logger.info(`Endpoint received message: ${message}`);
    if (message == null || message.data == null) {
      return Promise.reject(new Errors.SystemError());
    } else {
      switch (message.uri) {
        case 'pushNotification':
          return await this.notificationService.pushNotification(message.data, message.transactionId);

        case 'get:/api/v1/notification':
          return await this.managerService.queryAll(message.data);

        case 'get:/api/v1/notification/count':
          return await this.managerService.countUnreadNotifications(message.data);

        case 'put:/api/v1/notification/':
          return await this.managerService.remarkNotification(message.data);

        default:
          return false;
      }
    }
  };
}
