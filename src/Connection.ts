import { DataSource } from 'typeorm';
import config from './config';
import Notification from './model/entities/Nofitication';

export const AppDataSource = new DataSource({
  ...{
    type: 'mongodb',
    entities: [Notification],
  },
  ...config.mongo,
});
