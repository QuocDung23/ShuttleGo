import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Venue } from '@/modules/venues/venue.entity.js';

@Entity('price_rules')
export class PriceRule {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index()
  @Column({ type: 'bigint' })
  venueId: number;

  @ManyToOne(() => Venue, (v) => v.priceRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue?: Relation<Venue>;

  /** e.g. "Giờ thường", "Giờ vàng" */
  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  /** VND per hour */
  @Column({ type: 'integer' })
  pricePerHour: number;
}
