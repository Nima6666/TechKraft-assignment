/** Must match `server/src/features/auth/auth.middleware.ts` (`isAdminRequest`). */
export const ADMIN_REQUEST_HEADER = "x-header-isadmin";

export const ADMIN_REQUEST_HEADER_VALUE = "true";

export function adminRequestHeaders(
  isAdmin: boolean
): Record<string, string> | undefined {
  if (!isAdmin) return undefined;
  return { [ADMIN_REQUEST_HEADER]: ADMIN_REQUEST_HEADER_VALUE };
}
