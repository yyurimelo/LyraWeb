import type { PaginationFilterModel } from "../pagination";

export type NotificationFilter = PaginationFilterModel & {
  status?: boolean;
  type?: string;
}