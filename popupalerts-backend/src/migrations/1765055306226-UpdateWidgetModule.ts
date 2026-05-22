import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWidgetModule1765055306226 implements MigrationInterface {
    name = 'UpdateWidgetModule1765055306226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widgets" ADD "device_key" character varying`);
        await queryRunner.query(`ALTER TABLE "widgets" ADD "open_count" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widgets" DROP COLUMN "open_count"`);
        await queryRunner.query(`ALTER TABLE "widgets" DROP COLUMN "device_key"`);
    }

}
