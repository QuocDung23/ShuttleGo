import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { User } from '@/modules/users/user.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';

@Entity('favorites')
export class Favorite {
  @PrimaryColumn({ type: 'bigint' })
  userId: number;

  @PrimaryColumn({ type: 'bigint' })
  venueId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<User>;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue?: Relation<Venue>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
