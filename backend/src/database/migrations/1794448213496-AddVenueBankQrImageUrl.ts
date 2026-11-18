import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVenueBankQrImageUrl1794448213496 implements MigrationInterface {
    name = 'AddVenueBankQrImageUrl1794448213496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venues" ADD "bank_qr_image_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venues" DROP COLUMN "bank_qr_image_url"`);
    }
}
