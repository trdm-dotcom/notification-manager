import 'reflect-metadata';
import { Container } from 'typedi';
import { Logger } from 'common';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import mongoose from 'mongoose';
import { initKafka } from './services/KafkaProducerService';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

async function run() {
  Logger.info('run service notification manager');
  initKafka();
  mongoose.connect(config.mongo.url, config.mongo.options).then(() => Logger.info('connected to mongo!'));
  Container.get(RequestHandler).init();
}

run().catch((error) => {
  Logger.error(error);
});
