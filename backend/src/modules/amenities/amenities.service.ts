import { notFound } from '@/common/http-error.js';
import { AppDataSource } from '@/database/data-source.js';
import type { CreateAmenityInput, UpdateAmenityInput } from '@/modules/amenities/amenities.schema.js';
import { Amenity } from '@/modules/amenities/amenity.entity.js';

const repo = () => AppDataSource.getRepository(Amenity);

export const findAll = () => repo().find({ order: { name: 'ASC' } });

export async function findOne(id: number) {
  const amenity = await repo().findOneBy({ id });
  if (!amenity) throw notFound(`Amenity #${id} not found`);
  return amenity;
}

export const create = (input: CreateAmenityInput) => repo().save(repo().create(input));

export async function update(id: number, input: UpdateAmenityInput) {
  return repo().save(repo().merge(await findOne(id), input));
}

export async function remove(id: number) {
  await repo().remove(await findOne(id));
}
