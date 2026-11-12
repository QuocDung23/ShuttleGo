import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
  type ValueTransformer,
} from 'typeorm';
import { VenueStatus } from '../../common/enums.js';
import { Amenity } from '../amenities/amenity.entity.js';
import { Court } from '../courts/court.entity.js';
import { OperatingHour } from '../operating-hours/operating-hour.entity.js';
import { PriceRule } from '../price-rules/price-rule.entity.js';
import { User } from '../users/user.entity.js';

/** pg returns NUMERIC as string; expose it as a JS number. */
const numericTransformer: ValueTransformer = {
  to: (v: number | null | undefined) => v,
  from: (v: string | null) => (v === null ? null : Number(v)),
};

@Entity('venues')
@Index(['city', 'district'])
export class Venue {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index()
  @Column({ type: 'bigint' })
  ownerId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner?: Relation<User>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  latitude: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  longitude: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  coverImageUrl: string | null;

  /** Extra amount (VND) added on weekends. */
  @Column({ type: 'integer', default: 0 })
  weekendSurcharge: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountNo: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankAccountHolder: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: VenueStatus,
    enumName: 'venue_status',
    default: VenueStatus.PENDING,
  })
  status: VenueStatus;

  @Column({ type: 'bigint', nullable: true })
  reviewedBy: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: Relation<User> | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => Amenity)
  @JoinTable({
    name: 'venue_amenities',
    joinColumn: { name: 'venue_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'id' },
  })
  amenities?: Relation<Amenity[]>;

  @OneToMany(() => Court, (court) => court.venue)
  courts?: Relation<Court[]>;

  @OneToMany(() => OperatingHour, (h) => h.venue)
  operatingHours?: Relation<OperatingHour[]>;

  @OneToMany(() => PriceRule, (r) => r.venue)
  priceRules?: Relation<PriceRule[]>;
}
