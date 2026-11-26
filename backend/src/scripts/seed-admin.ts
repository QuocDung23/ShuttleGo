import { AppDataSource } from '../database/data-source.js';
import { UserRole, UserStatus } from '../common/enums.js';
import { User } from '../modules/users/user.entity.js';
import { phoneString, type CreateUserInput } from '../modules/users/users.schema.js';
import * as usersService from '../modules/users/users.service.js';

async function main() {
  const name = process.env.SEED_ADMIN_NAME?.trim();
  const rawPhone = process.env.SEED_ADMIN_PHONE?.trim();
  const phone = rawPhone?.toLowerCase() === 'admin' ? 'admin' : rawPhone?.replace(/[\s().-]/g, '');
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || name.length > 100) throw new Error('SEED_ADMIN_NAME must be 1–100 characters.');
  if (!phone || (phone !== 'admin' && !phoneString.safeParse(phone).success)) {
    throw new Error('SEED_ADMIN_PHONE must be "admin" or a valid Vietnamese mobile number.');
  }
  if (!password || password.length < 6 || password.length > 72) {
    throw new Error('SEED_ADMIN_PASSWORD must be 6–72 characters.');
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('SEED_ADMIN_PASSWORD must be at most 72 bytes for bcrypt.');
  }

  const input: CreateUserInput = {
    fullName: name,
    phone,
    password,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  try {
    await AppDataSource.initialize();
    const repository = AppDataSource.getRepository(User);
    const existing = await repository.findOneBy({ phone: input.phone });

    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        throw new Error(`Phone ${input.phone} belongs to a non-admin user; no changes made.`);
      }
      if (existing.status !== UserStatus.ACTIVE) {
        throw new Error(`Admin ${input.phone} is not active; no changes made.`);
      }
      console.log(`Active admin already exists: ${existing.fullName} (${input.phone}); no changes made.`);
      return;
    }

    const created = await usersService.create(input);
    console.log(`Created active admin ${created.fullName} (${created.phone}), id ${created.id}.`);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Admin seed failed.');
  process.exitCode = 1;
});
