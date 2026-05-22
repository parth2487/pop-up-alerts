import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingPeriodToSubscription1764418779104 implements MigrationInterface {
    name = 'AddBillingPeriodToSubscription1764418779104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_plan_type_enum" AS ENUM('monthly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "plan_type" "public"."subscriptions_plan_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "amount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "currency" character varying(3) NOT NULL DEFAULT 'USD'`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "plan_features" jsonb`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "included_features" text array`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "current_period_start" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "current_period_end" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "current_period_end"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "current_period_start"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "included_features"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "plan_features"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "plan_type"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_plan_type_enum"`);
    }

}
