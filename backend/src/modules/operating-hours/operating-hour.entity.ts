import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Venue } from '@/modules/venues/venue.entity.js';

@Entity('operating_hours')
@Check('"day_of_week" BETWEEN 0 AND 6')
export class OperatingHour {
  @PrimaryColumn({ type: 'bigint' })
  venueId: number;

  /** 0 = Sunday, 1 = Monday, ... 6 = Saturday */
  @PrimaryColumn({ type: 'smallint' })
  dayOfWeek: number;

  @ManyToOne(() => Venue, (v) => v.operatingHours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue?: Relation<Venue>;

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  /** "HH:mm:ss" */
  @Column({ type: 'time', nullable: true })
  openTime: string | null;

  /** "HH:mm:ss" */
  @Column({ type: 'time', nullable: true })
  closeTime: string | null;
}
