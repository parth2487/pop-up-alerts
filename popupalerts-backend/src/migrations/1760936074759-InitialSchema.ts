import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760936074759 implements MigrationInterface {
    name = 'InitialSchema1760936074759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'canceled', 'past_due', 'incomplete')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_customer_id" character varying NOT NULL, "stripe_subscription_id" character varying, "status" "public"."subscriptions_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_fbdba4e2ac694cf8c9cecf4dc8" UNIQUE ("userId"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255), "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "email_verified_at" TIMESTAMP, "email_verification_token" character varying, "password_reset_token" character varying, "password_reset_expires" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "widgetId" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "text" text NOT NULL, "author" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "widgetId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "response" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "widgetId" uuid, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."widgets_type_enum" AS ENUM('informational', 'coupon', 'live_counter', 'email_collector', 'recent_conversions', 'conversion_counter', 'countdown_timer', 'reviews', 'social_share', 'feedback', 'video', 'cookie_notification')`);
        await queryRunner.query(`CREATE TABLE "widgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."widgets_type_enum" NOT NULL DEFAULT 'informational', "settings" jsonb NOT NULL DEFAULT '{}', "view_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_da23136dbcfc91424451e24b725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "domain" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_ba468397c021e2f3b4e5709bf18" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_4d721bc296a30efd9d1f4d31053" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_53cdd5c41dd317e54c9dfca5204" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "widgets" ADD CONSTRAINT "FK_8e8c6b1ccbd6f61143a72a26a00" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspaces" ADD CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403"`);
        await queryRunner.query(`ALTER TABLE "widgets" DROP CONSTRAINT "FK_8e8c6b1ccbd6f61143a72a26a00"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_53cdd5c41dd317e54c9dfca5204"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_4d721bc296a30efd9d1f4d31053"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_ba468397c021e2f3b4e5709bf18"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TABLE "widgets"`);
        await queryRunner.query(`DROP TYPE "public"."widgets_type_enum"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    }

}
