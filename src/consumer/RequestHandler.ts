import { Errors, Kafka, Logger } from 'common';
import { Inject, Service } from 'typedi';
import config from '../config';
import NotificationService from '../services/NotificationService';

@Service()
export default class RequestHandler {
  @Inject()
  private notificationService: NotificationService;

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
  
        default:
          return false;
      }
    }
  };
}
