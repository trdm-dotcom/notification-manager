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
  clientId: `notification-manager-${Utils.getEnvNum('ENV_NODE_ID')}`,
  nodeId: Utils.getEnvNum('ENV_NODE_ID'),
  kafkaUrls: Utils.getEnvArr('ENV_KAFKA_URLS'),
  kafkaCommonOptions: {},
  kafkaConsumerOptions: {},
  kafkaProducerOptions: {},
  kafkaTopicOptions: {},
  requestHandlerTopics: [],
  mongo: {
    host: Utils.getEnvStr('ENV_MONGO_HOST'),
    port: Utils.getEnvNum('ENV_MONGO_PORT'),
    authSource: 'admin',
    username: Utils.getEnvStr('ENV_MONGO_USER'),
    password: Utils.getEnvStr('ENV_MONGO_PASSWORD'),
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
