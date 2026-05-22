import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLeadModule1765028314843 implements MigrationInterface {
    name = 'UpdateLeadModule1765028314843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "domain"`);
        await queryRunner.query(`ALTER TABLE "leads" ADD "data" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "leads" ADD "widgetId" uuid`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_ba468397c021e2f3b4e5709bf18" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_ba468397c021e2f3b4e5709bf18"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "widgetId"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "data"`);
        await queryRunner.query(`ALTER TABLE "leads" ADD "domain" character varying(255) NOT NULL`);
    }

}
