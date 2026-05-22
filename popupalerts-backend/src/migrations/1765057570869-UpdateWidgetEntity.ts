import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWidgetEntity1765057570869 implements MigrationInterface {
    name = 'UpdateWidgetEntity1765057570869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widgets" RENAME COLUMN "device_key" TO "opened_devices"`);
        await queryRunner.query(`ALTER TABLE "widgets" DROP COLUMN "opened_devices"`);
        await queryRunner.query(`ALTER TABLE "widgets" ADD "opened_devices" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widgets" DROP COLUMN "opened_devices"`);
        await queryRunner.query(`ALTER TABLE "widgets" ADD "opened_devices" character varying`);
        await queryRunner.query(`ALTER TABLE "widgets" RENAME COLUMN "opened_devices" TO "device_key"`);
    }

}
