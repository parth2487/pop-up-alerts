import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWorkspaceLeadModule1765030201082 implements MigrationInterface {
    name = 'UpdateWorkspaceLeadModule1765030201082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workspace_leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d50323e0ab2131d8e6dbecd6f15" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "workspace_leads"`);
    }

}
