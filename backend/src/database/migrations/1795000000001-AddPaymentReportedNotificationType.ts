import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentReportedNotificationType1795000000001 implements MigrationInterface {
  name = 'AddPaymentReportedNotificationType1795000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'payment_reported'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "notifications" SET "type" = 'system' WHERE "type" = 'payment_reported'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type" RENAME TO "notification_type_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type" AS ENUM('booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_reminder', 'payment_received', 'venue_approved', 'venue_rejected', 'report_updated', 'system')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notification_type" USING "type"::text::"public"."notification_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_type_old"`);
  }
}
