import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../constants';
import { PaginatedResult, PaginationParams } from '../types/pagination.types';

export function parsePagination(query: {
  offset?: string | number;
  limit?: string | number;
}): PaginationParams {
  const rawOffset = Number(query.offset ?? 0);
  const rawLimit = Number(query.limit ?? DEFAULT_PAGE_LIMIT);

  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(Math.floor(rawLimit), MAX_PAGE_LIMIT)
      : DEFAULT_PAGE_LIMIT;

  return { offset, limit };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  { offset, limit }: PaginationParams,
): PaginatedResult<T> {
  return {
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
  };
}
