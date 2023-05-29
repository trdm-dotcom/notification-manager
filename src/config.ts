import { Utils } from 'common';
import { v4 as uuid } from 'uuid';
const nodeId = uuid();
let config = {
  logger: {
    config: {
      appenders: {
        application: { type: 'console' },
        file: {
          type: 'file',
          filename: './../logs/user/application.log',
          compression: true,
          maxLogSize: 10485760,
          backups: 100,
        },
      },
      categories: {
        default: { appenders: ['application', 'file'], level: 'info' },
      },
    },
  },
  topic: {
    notification: 'notification',
  },
  clusterId: 'notification-manager',
  clientId: `notification-manager-${nodeId}`,
  nodeId: nodeId,
  kafkaUrls: Utils.getEnvArr('ENV_KAFKA_URLS', ['localhost:9092']),
  kafkaCommonOptions: {},
  kafkaConsumerOptions: {},
  kafkaProducerOptions: {},
  kafkaTopicOptions: {},
  requestHandlerTopics: [],
  mongo: {
    url: Utils.getEnvStr('ENV_MONGO_URL', 'mongodb://localhost:27017/notification'),
    host: Utils.getEnvStr('ENV_MONGO_HOSTT', 'localhost'),
    port: Utils.getEnvStr('ENV_MONGO_PORT', '27017'),
    username: Utils.getEnvStr('ENV_MONGO_USERNAME', 'root'),
    password: Utils.getEnvStr('ENV_MONGO_PASSWORD', 'admin'),
  },
};

config.kafkaConsumerOptions = {
  ...(config.kafkaCommonOptions ? config.kafkaCommonOptions : {}),
  ...(config.kafkaConsumerOptions ? config.kafkaConsumerOptions : {}),
};
config.kafkaProducerOptions = {
  ...(config.kafkaCommonOptions ? config.kafkaCommonOptions : {}),
  ...(config.kafkaProducerOptions ? config.kafkaProducerOptions : {}),
};

if (config.requestHandlerTopics.length == 0) {
  config.requestHandlerTopics.push(config.clusterId);
}

export default config;
