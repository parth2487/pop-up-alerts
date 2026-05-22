import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaypalColumns1764200325584 implements MigrationInterface {
    name = 'AddPaypalColumns1764200325584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "paypal_subscription_id" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "paypal_plan_id" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "paypal_payer_email" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "paypal_payer_email"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "paypal_plan_id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "paypal_subscription_id"`);
    }

}
