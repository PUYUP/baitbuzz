import * as migration_20261115_130210_init from './20261115_130210_init';
import * as migration_20261115_131938_multi_source_platforms from './20261115_131938_multi_source_platforms';
import * as migration_20261115_134136_optional_raw_post_fields from './20261115_134136_optional_raw_post_fields';

export const migrations = [
  {
    up: migration_20261115_130210_init.up,
    down: migration_20261115_130210_init.down,
    name: '20261115_130210_init',
  },
  {
    up: migration_20261115_131938_multi_source_platforms.up,
    down: migration_20261115_131938_multi_source_platforms.down,
    name: '20261115_131938_multi_source_platforms',
  },
  {
    up: migration_20261115_134136_optional_raw_post_fields.up,
    down: migration_20261115_134136_optional_raw_post_fields.down,
    name: '20261115_134136_optional_raw_post_fields'
  },
];
