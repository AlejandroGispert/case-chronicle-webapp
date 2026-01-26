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

export interface QueryBuilder<T = any> {
  select(columns?: string): QueryBuilder<T>;
  insert(data: any): QueryBuilder<T>;
  update(data: Partial<T>): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
  eq(column: string, value: any): QueryBuilder<T>;
  neq(column: string, value: any): QueryBuilder<T>;
  gt(column: string, value: any): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  lte(column: string, value: any): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  ilike(column: string, pattern: string): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  is(column: string, value: any): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  range(from: number, to: number): QueryBuilder<T>;
  single(): Promise<{ data: T | null; error: Error | null }>;
  maybeSingle(): Promise<{ data: T | null; error: Error | null }>;
  execute(): Promise<{ data: T[] | null; error: Error | null }>;
}

export interface IDatabaseService {
  /**
   * Get a query builder for a table
   */
  from<T = any>(table: string): QueryBuilder<T>;

  /**
   * Execute a raw SQL query (if supported)
   */
  rpc(functionName: string, params?: Record<string, any>): Promise<{ data: any; error: Error | null }>;
}
