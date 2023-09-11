import { Utils } from 'common';

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
  clientId: `notification-manager-${Utils.getEnvNum('ENV_NODE_ID', 0)}`,
  nodeId: Utils.getEnvNum('ENV_NODE_ID', 0),
  kafkaUrls: Utils.getEnvArr('ENV_KAFKA_URLS', ['localhost:9092']),
  kafkaCommonOptions: {},
  kafkaConsumerOptions: {},
  kafkaProducerOptions: {},
  kafkaTopicOptions: {},
  requestHandlerTopics: [],
  mongo: {
    host: Utils.getEnvStr('ENV_MONGO_HOST', 'localhost'),
    port: Utils.getEnvNum('ENV_MONGO_PORT', 27017),
    username: Utils.getEnvStr('ENV_MONGO_USER', null),
    password: Utils.getEnvStr('ENV_MONGO_PASSWORD', null),
    useNewUrlParser: true,
    synchronize: false,
    database: 'notification',
    poolSize: 100,
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
