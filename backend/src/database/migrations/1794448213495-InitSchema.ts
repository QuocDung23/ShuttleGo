import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1794448213495 implements MigrationInterface {
    name = 'InitSchema1794448213495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "amenities" ("id" SMALLSERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_8c5f9c7ff7e2174b53d4be10247" UNIQUE ("name"), CONSTRAINT "PK_c0777308847b3556086f2fb233e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operating_hours" ("venue_id" bigint NOT NULL, "day_of_week" smallint NOT NULL, "is_open" boolean NOT NULL DEFAULT true, "open_time" TIME, "close_time" TIME, CONSTRAINT "CHK_46921fd3016d70b610d0966596" CHECK ("day_of_week" BETWEEN 0 AND 6), CONSTRAINT "PK_aacac34b70d3f5a711bb44b652d" PRIMARY KEY ("venue_id", "day_of_week"))`);
        await queryRunner.query(`CREATE TABLE "price_rules" ("id" BIGSERIAL NOT NULL, "venue_id" bigint NOT NULL, "label" character varying(100) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "price_per_hour" integer NOT NULL, CONSTRAINT "PK_332f84d0bdaa08303a9292653f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3be472f136383cb26412df5aea" ON "price_rules"  ("venue_id") `);
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('player', 'owner', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "full_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."user_role" NOT NULL DEFAULT 'player', "status" "public"."user_status" NOT NULL DEFAULT 'active', "avatar_url" text, "fcm_token" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."venue_status" AS ENUM('pending', 'approved', 'rejected', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "venues" ("id" BIGSERIAL NOT NULL, "owner_id" bigint NOT NULL, "name" character varying(150) NOT NULL, "address" character varying(255) NOT NULL, "district" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "latitude" numeric(10,7), "longitude" numeric(10,7), "phone" character varying(20), "description" text, "cover_image_url" text, "weekend_surcharge" integer NOT NULL DEFAULT '0', "bank_name" character varying(100), "bank_account_no" character varying(50), "bank_account_holder" character varying(100), "status" "public"."venue_status" NOT NULL DEFAULT 'pending', "reviewed_by" bigint, "reviewed_at" TIMESTAMP WITH TIME ZONE, "review_note" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cb0f885278d12384eb7a81818be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8cb5cf3df16fc75663f85b5b35" ON "venues"  ("owner_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_305893adfc2e10604afde59eed" ON "venues"  ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e396ffeb2080dafcf8c904422b" ON "venues"  ("city", "district") `);
        await queryRunner.query(`CREATE TABLE "courts" ("id" BIGSERIAL NOT NULL, "venue_id" bigint NOT NULL, "name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_948a5d356c3083f3237ecbf9897" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8a398b2ca8f529d31d637a5f2f" ON "courts"  ("venue_id", "name") `);
        await queryRunner.query(`CREATE TYPE "public"."booking_source" AS ENUM('app', 'owner')`);
        await queryRunner.query(`CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank_transfer')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'pending_verification', 'paid', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" BIGSERIAL NOT NULL, "code" character varying(20) NOT NULL, "court_id" bigint NOT NULL, "player_id" bigint, "created_by" bigint NOT NULL, "source" "public"."booking_source" NOT NULL DEFAULT 'app', "contact_name" character varying(100) NOT NULL, "contact_phone" character varying(20) NOT NULL, "booking_date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "total_amount" integer NOT NULL, "status" "public"."booking_status" NOT NULL DEFAULT 'pending', "payment_method" "public"."payment_method" NOT NULL DEFAULT 'cash', "payment_status" "public"."payment_status" NOT NULL DEFAULT 'unpaid', "proof_image_url" text, "paid_at" TIMESTAMP WITH TIME ZONE, "hold_expires_at" TIMESTAMP WITH TIME ZONE, "cancel_reason" character varying(255), "cancelled_by" bigint, "confirmed_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9add00bfd42ae2bbe830bab9aa2" UNIQUE ("code"), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_129e7fe11e40d931c7bfdcf7e0" ON "bookings"  ("player_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_48b267d894e32a25ebde4b207a" ON "bookings"  ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_a37a876a31b5a6e807b41b4803" ON "bookings"  ("court_id", "booking_date") `);
        await queryRunner.query(`CREATE TABLE "favorites" ("user_id" bigint NOT NULL, "venue_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f908f56271f0c42c7597afecce7" PRIMARY KEY ("user_id", "venue_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type" AS ENUM('booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_reminder', 'payment_received', 'venue_approved', 'venue_rejected', 'report_updated', 'system')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "type" "public"."notification_type" NOT NULL, "title" character varying(200) NOT NULL, "body" text NOT NULL, "booking_id" bigint, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_af08fad7c04bb85403970afdc1" ON "notifications"  ("user_id", "is_read") `);
        await queryRunner.query(`CREATE TYPE "public"."report_status" AS ENUM('pending', 'in_progress', 'resolved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" BIGSERIAL NOT NULL, "reporter_id" bigint NOT NULL, "booking_id" bigint, "venue_id" bigint, "content" text NOT NULL, "status" "public"."report_status" NOT NULL DEFAULT 'pending', "handled_by" bigint, "admin_note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dab4d78b3be05c1ca4a626f57f" ON "reports"  ("status") `);
        await queryRunner.query(`CREATE TABLE "venue_amenities" ("venue_id" bigint NOT NULL, "amenity_id" smallint NOT NULL, CONSTRAINT "PK_0bce6c38a68d1b1c4062f4f1863" PRIMARY KEY ("venue_id", "amenity_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_52aa3f633512f7a025e288ba8e" ON "venue_amenities"  ("venue_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_12725c60b6e328ce52061f958c" ON "venue_amenities"  ("amenity_id") `);
        await queryRunner.query(`ALTER TABLE "operating_hours" ADD CONSTRAINT "FK_4cc853b17ec8182934d1fcb48af" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_rules" ADD CONSTRAINT "FK_3be472f136383cb26412df5aea3" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "venues" ADD CONSTRAINT "FK_8cb5cf3df16fc75663f85b5b35c" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "venues" ADD CONSTRAINT "FK_200a530d0272dd35f9553e8ff11" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courts" ADD CONSTRAINT "FK_9da2e37c269dfe8cbbfd8d87583" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_2bd7e9c03db9f51a4765974abb8" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_129e7fe11e40d931c7bfdcf7e04" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_44342bfa812465df91df3d9a152" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_7bc8366af1bd0c09850cef683bd" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_b7f2d9d96c8700eb31ab3c69635" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_3f5c2196c2b2af99a4697e51741" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_9459b9bf907a3807ef7143d2ead" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_25f4dde2f56ab000aa8db7b2495" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_2bb97e3229b98099a57302a193f" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_924ded326149274a4e085e9ee1a" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "venue_amenities" ADD CONSTRAINT "FK_52aa3f633512f7a025e288ba8eb" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "venue_amenities" ADD CONSTRAINT "FK_12725c60b6e328ce52061f958c1" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venue_amenities" DROP CONSTRAINT "FK_12725c60b6e328ce52061f958c1"`);
        await queryRunner.query(`ALTER TABLE "venue_amenities" DROP CONSTRAINT "FK_52aa3f633512f7a025e288ba8eb"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_924ded326149274a4e085e9ee1a"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_2bb97e3229b98099a57302a193f"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_25f4dde2f56ab000aa8db7b2495"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_9459b9bf907a3807ef7143d2ead"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_3f5c2196c2b2af99a4697e51741"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_b7f2d9d96c8700eb31ab3c69635"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_7bc8366af1bd0c09850cef683bd"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_44342bfa812465df91df3d9a152"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_129e7fe11e40d931c7bfdcf7e04"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_2bd7e9c03db9f51a4765974abb8"`);
        await queryRunner.query(`ALTER TABLE "courts" DROP CONSTRAINT "FK_9da2e37c269dfe8cbbfd8d87583"`);
        await queryRunner.query(`ALTER TABLE "venues" DROP CONSTRAINT "FK_200a530d0272dd35f9553e8ff11"`);
        await queryRunner.query(`ALTER TABLE "venues" DROP CONSTRAINT "FK_8cb5cf3df16fc75663f85b5b35c"`);
        await queryRunner.query(`ALTER TABLE "price_rules" DROP CONSTRAINT "FK_3be472f136383cb26412df5aea3"`);
        await queryRunner.query(`ALTER TABLE "operating_hours" DROP CONSTRAINT "FK_4cc853b17ec8182934d1fcb48af"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12725c60b6e328ce52061f958c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52aa3f633512f7a025e288ba8e"`);
        await queryRunner.query(`DROP TABLE "venue_amenities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dab4d78b3be05c1ca4a626f57f"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."report_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af08fad7c04bb85403970afdc1"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a37a876a31b5a6e807b41b4803"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48b267d894e32a25ebde4b207a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_129e7fe11e40d931c7bfdcf7e0"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status"`);
        await queryRunner.query(`DROP TYPE "public"."booking_source"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a398b2ca8f529d31d637a5f2f"`);
        await queryRunner.query(`DROP TABLE "courts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e396ffeb2080dafcf8c904422b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_305893adfc2e10604afde59eed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cb5cf3df16fc75663f85b5b35"`);
        await queryRunner.query(`DROP TABLE "venues"`);
        await queryRunner.query(`DROP TYPE "public"."venue_status"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_status"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3be472f136383cb26412df5aea"`);
        await queryRunner.query(`DROP TABLE "price_rules"`);
        await queryRunner.query(`DROP TABLE "operating_hours"`);
        await queryRunner.query(`DROP TABLE "amenities"`);
    }

}
