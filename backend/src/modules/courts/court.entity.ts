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

@Entity('courts')
@Index(['venueId', 'name'], { unique: true })
export class Court {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  venueId: number;

  @ManyToOne(() => Venue, (v) => v.courts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue?: Relation<Venue>;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
