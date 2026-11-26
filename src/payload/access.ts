import type { Access, FieldAccess } from "payload";

// Two roles:
//   admin: everything (prices, coupons, settings, users)
//   staff: day-to-day work (orders, stock, reviews, leads); cannot change prices, coupons or settings

type WithRole = { role?: "admin" | "staff" | null } | null | undefined;
const roleOf = (user: unknown) => (user as WithRole)?.role;

export const isAdmin: Access = ({ req }) => roleOf(req.user) === "admin";
export const isStaff: Access = ({ req }) => !!req.user; // admin or staff
export const anyone: Access = () => true;
export const nobody: Access = () => false;

export const noField: FieldAccess = () => false;
export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user) === "admin";

export const isAdminOrSelf: Access = ({ req }) => {
  if (roleOf(req.user) === "admin") return true;
  if (req.user) return { id: { equals: req.user.id } };
  return false;
};

export const userRole = (user: unknown) => roleOf(user);
