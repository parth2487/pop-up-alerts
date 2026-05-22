import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkspaceLeadModule1765029398146 implements MigrationInterface {
    name = 'AddWorkspaceLeadModule1765029398146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workspace-leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e558040549010e9df4f1bcde3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "domain"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "domain" character varying(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "workspace-leads"`);
    }

}
