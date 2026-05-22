import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaypalColumns1764180260127 implements MigrationInterface {
    name = 'AddPaypalColumns1764180260127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "stripe_customer_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "stripe_customer_id" SET NOT NULL`);
    }

}
