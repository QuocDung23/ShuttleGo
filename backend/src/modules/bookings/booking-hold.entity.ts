import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Court } from '@/modules/courts/court.entity.js';
import { User } from '@/modules/users/user.entity.js';

/** A temporary player selection; it is separate from a real booking. */
@Entity('booking_holds')
@Index(['courtId', 'bookingDate'])
@Index(['expiresAt'])
export class BookingHold {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  /** One active selection per player. An expired row is reused on next select. */
  @Column({ type: 'bigint', unique: true })
  playerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player?: Relation<User>;

  @Column({ type: 'bigint' })
  courtId: number;

  @ManyToOne(() => Court, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court?: Relation<Court>;

  /** YYYY-MM-DD */
  @Column({ type: 'date' })
  bookingDate: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
