import bcrypt from 'bcryptjs';
import { ILike, type FindOptionsWhere } from 'typeorm';
import { notFound } from '@/common/http-error.js';
import { definedOnly, escapeLike, paginate, skipTake } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { User } from '@/modules/users/user.entity.js';
import type { CreateUserInput, QueryUsersInput, UpdateUserInput } from '@/modules/users/users.schema.js';

const SALT_ROUNDS = 10;
const repo = () => AppDataSource.getRepository(User);

export async function findAll(query: QueryUsersInput) {
  const base: FindOptionsWhere<User> = definedOnly({ role: query.role, status: query.status });
  const term = query.search && `%${escapeLike(query.search)}%`;
  const where = term
    ? [
        { ...base, fullName: ILike(term) },
        { ...base, phone: ILike(term) },
      ]
    : base;

  const result = await repo().findAndCount({ where, order: { id: 'DESC' }, ...skipTake(query) });
  return paginate(result, query);
}

/** password_hash and fcm_token are never selected. */
export async function findOne(id: number) {
  const user = await repo().findOneBy({ id });
  if (!user) throw notFound(`User #${id} not found`);
  return user;
}

export async function create({ password, ...input }: CreateUserInput) {
  const saved = await repo().save(
    repo().create({ ...input, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) }),
  );
  return findOne(saved.id);
}

export async function update(id: number, { password, ...input }: UpdateUserInput) {
  const user = await findOne(id);
  repo().merge(user, input);
  if (password) user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await repo().save(user);
  return findOne(id);
}

export async function remove(id: number) {
  await repo().remove(await findOne(id));
}
