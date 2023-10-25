import { Errors, Logger } from 'common';
import { Inject, Service } from 'typedi';
import config from '../Config';
import NotificationService from '../services/NotificationService';
import ManagerService from '../services/ManagerService';
import { Kafka } from 'kafka-common';
import { getInstance } from '../services/KafkaProducerService';

const { UriNotFound } = Errors;

@Service()
export default class RequestHandler {
  @Inject()
  private notificationService: NotificationService;
  @Inject()
  private managerService: ManagerService;

  public init() {
    const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(getInstance());
    new Kafka.KafkaConsumer(config).startConsumer([config.clusterId], (message: Kafka.MessageSetEntry) =>
      handle.handle(message, this.handleRequest)
    );
  }
  private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
    Logger.info(`Endpoint received message: ${JSON.stringify(message)}`);
    if (message == null || message.data == null) {
      return Promise.reject(new Errors.SystemError());
    } else {
      switch (message.uri) {
        case 'pushNotification':
          return await this.notificationService.pushNotification(message.data, message.transactionId);

        case 'get:/api/v1/notification':
          return await this.managerService.queryAll(message.data, message.transactionId);

        case 'get:/api/v1/notification/count':
          return await this.managerService.countUnreadNotifications(message.data);

        case 'put:/api/v1/notification':
          return await this.managerService.remarkNotification(message.data);

        case 'put:/api/v1/notification/receive':
          return await this.managerService.receiveNotification(message.data);

        default:
          throw new UriNotFound();
      }
    }
  };
}
