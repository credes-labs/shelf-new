import * as migration_20261022_134212_initial from './20261022_134212_initial';

export const migrations = [
  {
    up: migration_20261022_134212_initial.up,
    down: migration_20261022_134212_initial.down,
    name: '20261022_134212_initial'
  },
];
