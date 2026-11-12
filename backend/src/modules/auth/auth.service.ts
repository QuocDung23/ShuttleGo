import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_TTL_SECONDS } from '@/config/auth.js';
import { signAuthToken } from '@/common/jwt.js';
import { UserRole, UserStatus } from '@/common/enums.js';
import { conflict, forbidden, unauthorized } from '@/common/http-error.js';
import { AppDataSource } from '@/database/data-source.js';
import { User } from '@/modules/users/user.entity.js';
import { findOne } from '@/modules/users/users.service.js';
import type { LoginInput, RegisterInput } from '@/modules/auth/auth.schema.js';

const SALT_ROUNDS = 10;
const repo = () => AppDataSource.getRepository(User);

const issue = (user: User) => ({
  token: signAuthToken(user.id, user.role, JWT_SECRET, JWT_TTL_SECONDS),
  user,
});

export async function register(input: RegisterInput) {
  const existing = await repo().findOneBy({ phone: input.phone });
  if (existing) throw conflict('Phone number is already registered');

  const { password, ...rest } = input;
  const saved = await repo().save(
    repo().create({
      ...rest,
      role: input.role ?? UserRole.PLAYER,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    }),
  );
  return issue(await findOne(saved.id));
}

export async function login({ phone, password }: LoginInput) {
  const user = await repo()
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.phone = :phone', { phone })
    .getOne();

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized('Invalid phone or password');
  }
  if (user.status !== UserStatus.ACTIVE) throw forbidden('Account is not active');

  return issue(await findOne(user.id));
}
