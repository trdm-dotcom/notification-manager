import 'reflect-metadata';
import { Container } from 'typedi';
import { Logger } from 'common';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { initKafka } from './services/KafkaProducerService';
import { createConnection, useContainer } from 'typeorm';
import Notification from './model/entities/Notification';
import NotificationConfig from './model/entities/NotificationConfig';
import { Container as ContainerTypeOrm } from 'typeorm-typedi-extensions';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

async function run() {
  Logger.info('run service notification manager');
  useContainer(ContainerTypeOrm);
  await createConnection({
    ...{
      type: 'mongodb',
      entities: [Notification, NotificationConfig],
    },
    ...config.mongo,
  });
  initKafka();
  Container.get(RequestHandler).init();
}

run().catch((error) => {
  Logger.error(error);
});
