import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn('increment', { type: 'smallint' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;
}
