import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingHolds1795000000000 implements MigrationInterface {
  name = 'AddBookingHolds1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "booking_holds" (
      "id" BIGSERIAL NOT NULL,
      "player_id" bigint NOT NULL,
      "court_id" bigint NOT NULL,
      "booking_date" date NOT NULL,
      "start_time" TIME NOT NULL,
      "end_time" TIME NOT NULL,
      "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_booking_holds" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_booking_holds_player" UNIQUE ("player_id"),
      CONSTRAINT "FK_booking_holds_player" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
      CONSTRAINT "FK_booking_holds_court" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_holds_court_date" ON "booking_holds" ("court_id", "booking_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_booking_holds_expires_at" ON "booking_holds" ("expires_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_booking_holds_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_booking_holds_court_date"`);
    await queryRunner.query(`DROP TABLE "booking_holds"`);
  }
}
