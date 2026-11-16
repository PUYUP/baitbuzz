import * as migration_20261115_130210_init from './20261115_130210_init';
import * as migration_20261115_131938_multi_source_platforms from './20261115_131938_multi_source_platforms';
import * as migration_20261115_134136_optional_raw_post_fields from './20261115_134136_optional_raw_post_fields';
import * as migration_20261115_235600_article_views from './20261115_235600_article_views';
import * as migration_20261116_003201_article_headline_flag from './20261116_003201_article_headline_flag';

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
    name: '20261115_134136_optional_raw_post_fields',
  },
  {
    up: migration_20261115_235600_article_views.up,
    down: migration_20261115_235600_article_views.down,
    name: '20261115_235600_article_views',
  },
  {
    up: migration_20261116_003201_article_headline_flag.up,
    down: migration_20261116_003201_article_headline_flag.down,
    name: '20261116_003201_article_headline_flag'
  },
];
