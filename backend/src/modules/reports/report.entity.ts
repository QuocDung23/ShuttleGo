import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { ReportStatus } from '../../common/enums.js';
import { Booking } from '../bookings/booking.entity.js';
import { User } from '../users/user.entity.js';
import { Venue } from '../venues/venue.entity.js';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  reporterId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter?: Relation<User>;

  @Column({ type: 'bigint', nullable: true })
  bookingId: number | null;

  @ManyToOne(() => Booking, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Relation<Booking> | null;

  @Column({ type: 'bigint', nullable: true })
  venueId: number | null;

  @ManyToOne(() => Venue, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'venue_id' })
  venue?: Relation<Venue> | null;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status',
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'bigint', nullable: true })
  handledBy: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'handled_by' })
  handler?: Relation<User> | null;

  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;
}
