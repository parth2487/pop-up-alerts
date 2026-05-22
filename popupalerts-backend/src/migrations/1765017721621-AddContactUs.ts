import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactUs1765017721621 implements MigrationInterface {
    name = 'AddContactUs1765017721621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_status_period"`);
        await queryRunner.query(`CREATE TABLE "contact_us" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "contactNumber" character varying(50) NOT NULL, "requirementType" character varying NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b61766a4d93470109266b976cfe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "contact_us"`);
        await queryRunner.query(`CREATE INDEX "idx_status_period" ON "subscriptions" ("current_period_end", "status") `);
    }

}
