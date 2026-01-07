import type { PaginationFilterModel } from "../pagination";

export type FriendRequestFilter = PaginationFilterModel & {
  name: string;
};
