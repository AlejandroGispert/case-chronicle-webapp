import type { Json } from "@/integrations/supabase/types";

/**
 * Database Abstraction Layer
 *
 * This interface allows swapping database implementations without changing business logic.
 * Currently implemented for Supabase, but can be extended to support:
 * - Direct PostgreSQL (pg)
 * - Prisma
 * - Drizzle ORM
 * - REST APIs
 * - GraphQL
 */

/** Primitive values for filter operations */
export type FilterValue = string | number | boolean | null;

export interface QueryBuilder<T> {
  select(columns?: string): QueryBuilder<T>;
  insert(data: Partial<T> | Partial<T>[]): QueryBuilder<T>;
  update(data: Partial<T>): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
  eq(column: string, value: FilterValue): QueryBuilder<T>;
  neq(column: string, value: FilterValue): QueryBuilder<T>;
  gt(column: string, value: FilterValue): QueryBuilder<T>;
  gte(column: string, value: FilterValue): QueryBuilder<T>;
  lt(column: string, value: FilterValue): QueryBuilder<T>;
  lte(column: string, value: FilterValue): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  ilike(column: string, pattern: string): QueryBuilder<T>;
  in(column: string, values: FilterValue[]): QueryBuilder<T>;
  is(column: string, value: FilterValue): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  range(from: number, to: number): QueryBuilder<T>;
  single(): Promise<{ data: T | null; error: Error | null }>;
  maybeSingle(): Promise<{ data: T | null; error: Error | null }>;
  execute(): Promise<{ data: T[] | null; error: Error | null }>;
}

export interface RpcParams {
  [key: string]: string | number | boolean | null | string[] | number[];
}

export interface IDatabaseService {
  /**
   * Get a query builder for a table
   */
  from<T>(table: string): QueryBuilder<T>;

  /**
   * Execute a raw SQL query (if supported)
   */
  rpc<T = Json>(functionName: string, params?: RpcParams): Promise<{ data: T | null; error: Error | null }>;
}
