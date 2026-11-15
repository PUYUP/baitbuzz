import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_raw_posts_platform" AS ENUM('x', 'threads', 'facebook', 'linkedin', 'other');
  ALTER TABLE "raw_posts" RENAME COLUMN "tweet_id" TO "external_id";
  ALTER TABLE "raw_posts" RENAME COLUMN "url" TO "source_url";
  ALTER TABLE "raw_posts" RENAME COLUMN "parent_tweet_id" TO "parent_id";
  DROP INDEX "raw_posts_tweet_id_idx";
  ALTER TABLE "raw_posts" ADD COLUMN "platform" "enum_raw_posts_platform" DEFAULT 'x' NOT NULL;
  CREATE INDEX "raw_posts_platform_idx" ON "raw_posts" USING btree ("platform");
  CREATE UNIQUE INDEX "raw_posts_external_id_idx" ON "raw_posts" USING btree ("external_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "raw_posts" RENAME COLUMN "external_id" TO "tweet_id";
  ALTER TABLE "raw_posts" RENAME COLUMN "source_url" TO "url";
  ALTER TABLE "raw_posts" RENAME COLUMN "parent_id" TO "parent_tweet_id";
  DROP INDEX "raw_posts_platform_idx";
  DROP INDEX "raw_posts_external_id_idx";
  CREATE UNIQUE INDEX "raw_posts_tweet_id_idx" ON "raw_posts" USING btree ("tweet_id");
  ALTER TABLE "raw_posts" DROP COLUMN "platform";
  DROP TYPE "public"."enum_raw_posts_platform";`)
}
