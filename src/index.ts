import 'reflect-metadata';
import { Container } from 'typedi';
import { Kafka, Logger } from 'common';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import mongoose from 'mongoose';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

function init() {
  try {
    Logger.info('run service notification manager');
    Kafka.create(
      config,
      true,
      null,
      {
        serviceName: config.clusterId,
        nodeId: config.clientId,
      },
      config.kafkaProducerOptions,
      {},
      config.kafkaConsumerOptions,
      {}
    );
    Promise.all([
      mongoose.connect(config.mongo.url, config.mongo.options).then(() => Logger.info('connected to mongo!')),
      new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
        Container.get(RequestHandler).init();
        resolve(`init container RequestHandler`);
      }),
    ]);
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
}

init();
