import type { RequestHandler } from 'express';
import { UserRole, VenueStatus } from '@/common/enums.js';
import { forbidden, unauthorized } from '@/common/http-error.js';
import { AppDataSource } from '@/database/data-source.js';
import { Venue } from '@/modules/venues/venue.entity.js';

export type OwnerVenueApprovalState = 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';

export function resolveOwnerVenueApprovalState(statuses: VenueStatus[]): OwnerVenueApprovalState {
  if (statuses.length === 0) return 'none';
  if (statuses.includes(VenueStatus.APPROVED)) return 'approved';
  if (statuses.includes(VenueStatus.PENDING)) return 'pending';
  if (statuses.includes(VenueStatus.REJECTED)) return 'rejected';
  if (statuses.includes(VenueStatus.SUSPENDED)) return 'suspended';
  return 'none';
}

export const OWNER_VENUE_APPROVAL_REQUIRED_CODE = 'OWNER_VENUE_APPROVAL_REQUIRED';

/**
 * Owners must have at least one approved venue to access owner dashboard APIs.
 * Players and admins are not affected. Must run after `authenticate`.
 */
export const requireApprovedOwnerVenue: RequestHandler = async (req, _res, next) => {
  if (!req.user) {
    next(unauthorized());
    return;
  }
  if (req.user.role !== UserRole.OWNER) {
    next();
    return;
  }

  try {
    const venues = await AppDataSource.getRepository(Venue).find({
      where: { ownerId: req.user.id },
      select: { status: true },
    });
    const statuses = venues.map((v) => v.status);
    const state = resolveOwnerVenueApprovalState(statuses);
    if (state === 'approved') {
      next();
      return;
    }
    next(
      forbidden(
        'Owner venue is not approved',
        { ownerVenueState: state, venueStatuses: statuses },
        OWNER_VENUE_APPROVAL_REQUIRED_CODE,
      ),
    );
  } catch (err) {
    next(err);
  }
};
