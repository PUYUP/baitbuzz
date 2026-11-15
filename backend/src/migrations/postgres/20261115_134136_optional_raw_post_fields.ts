import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "raw_posts" ALTER COLUMN "external_id" DROP NOT NULL;
  ALTER TABLE "raw_posts" ALTER COLUMN "author_handle" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "raw_posts" ALTER COLUMN "external_id" SET NOT NULL;
  ALTER TABLE "raw_posts" ALTER COLUMN "author_handle" SET NOT NULL;`)
}
