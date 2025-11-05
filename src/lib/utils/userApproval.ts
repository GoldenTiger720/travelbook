import { BackendUser } from '@/services/authService';

/**
 * Check if a user needs administrator approval before accessing the system.
 *
 * A user needs approval if:
 * - They are not a superuser (isSuperuser === false)
 * - AND they don't have a role assigned (role is null, undefined, or empty string)
 *
 * @param user - The user object from authentication
 * @returns true if user needs approval, false if approved
 */
export const isUserPendingApproval = (user: BackendUser | null): boolean => {
  if (!user) {
    return false;
  }

  // Check if user is NOT a superuser AND has no role assigned
  const isNotSuperuser = !user.isSuperuser;
  const hasNoRole = !user.role || user.role.trim() === '';

  return isNotSuperuser && hasNoRole;
};

/**
 * Check if a user is approved and can access the system.
 *
 * A user is approved if:
 * - They are a superuser (isSuperuser === true)
 * - OR they have a role assigned (role is not null/undefined/empty)
 *
 * @param user - The user object from authentication
 * @returns true if user is approved, false if pending approval
 */
export const isUserApproved = (user: BackendUser | null): boolean => {
  return !isUserPendingApproval(user);
};
