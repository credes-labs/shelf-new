import * as migration_20261022_134212_initial from './20261022_134212_initial';
import * as migration_20261022_215741_s3_media_storage from './20261022_215741_s3_media_storage';

export const migrations = [
  {
    up: migration_20261022_134212_initial.up,
    down: migration_20261022_134212_initial.down,
    name: '20261022_134212_initial',
  },
  {
    up: migration_20261022_215741_s3_media_storage.up,
    down: migration_20261022_215741_s3_media_storage.down,
    name: '20261022_215741_s3_media_storage'
  },
];
