/**
 * Supabase implementation of IDatabaseService
 * 
 * This adapter wraps Supabase's query builder to match our abstraction interface.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IDatabaseService, QueryBuilder } from './database.types';

export class SupabaseQueryBuilder<T = any> implements QueryBuilder<T> {
  private query: any;

  constructor(query: any) {
    this.query = query;
  }

  select(columns: string = '*'): QueryBuilder<T> {
    this.query = this.query.select(columns);
    return this;
  }

  insert(data: any): QueryBuilder<T> {
    this.query = this.query.insert(data);
    return this;
  }

  update(data: Partial<T>): QueryBuilder<T> {
    this.query = this.query.update(data);
    return this;
  }

  delete(): QueryBuilder<T> {
    this.query = this.query.delete();
    return this;
  }

  eq(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.eq(column, value);
    return this;
  }

  neq(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.neq(column, value);
    return this;
  }

  gt(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.gt(column, value);
    return this;
  }

  gte(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.gte(column, value);
    return this;
  }

  lt(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.lt(column, value);
    return this;
  }

  lte(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.lte(column, value);
    return this;
  }

  like(column: string, pattern: string): QueryBuilder<T> {
    this.query = this.query.like(column, pattern);
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder<T> {
    this.query = this.query.ilike(column, pattern);
    return this;
  }

  in(column: string, values: any[]): QueryBuilder<T> {
    this.query = this.query.in(column, values);
    return this;
  }

  is(column: string, value: any): QueryBuilder<T> {
    this.query = this.query.is(column, value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    this.query = this.query.order(column, { ascending: options?.ascending ?? true });
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.query = this.query.limit(count);
    return this;
  }

  range(from: number, to: number): QueryBuilder<T> {
    this.query = this.query.range(from, to);
    return this;
  }

  async single(): Promise<{ data: T | null; error: Error | null }> {
    const result = await this.query.single();
    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
    };
  }

  async maybeSingle(): Promise<{ data: T | null; error: Error | null }> {
    const result = await this.query.maybeSingle();
    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
    };
  }

  async execute(): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      const result = await this.query;
      return {
        data: result.data || null,
        error: result.error ? new Error(result.error.message) : null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown query error'),
      };
    }
  }
}

export class SupabaseDatabaseService implements IDatabaseService {
  constructor(private client: SupabaseClient) {}

  from<T = any>(table: string): QueryBuilder<T> {
    const query = this.client.from(table);
    return new SupabaseQueryBuilder<T>(query);
  }

  async rpc(functionName: string, params?: Record<string, any>): Promise<{ data: any; error: Error | null }> {
    const result = await this.client.rpc(functionName, params);
    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
    };
  }
}
