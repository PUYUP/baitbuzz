import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "article_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"article_id" integer NOT NULL,
  	"viewed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "article_views_id" integer;
  ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "article_views_article_idx" ON "article_views" USING btree ("article_id");
  CREATE INDEX "article_views_viewed_at_idx" ON "article_views" USING btree ("viewed_at");
  CREATE INDEX "article_views_updated_at_idx" ON "article_views" USING btree ("updated_at");
  CREATE INDEX "article_views_created_at_idx" ON "article_views" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_views_fk" FOREIGN KEY ("article_views_id") REFERENCES "public"."article_views"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_article_views_id_idx" ON "payload_locked_documents_rels" USING btree ("article_views_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "article_views" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "article_views" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_article_views_fk";
  
  DROP INDEX "payload_locked_documents_rels_article_views_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "article_views_id";`)
}
