import { getDatabaseService, getAuthService } from '../services';
import { Category, CreateCategoryInput } from './types';

export const categoryModel = {
  async getAllCategories(): Promise<Category[]> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error('[CategoryModel] No authenticated user found');
        return [];
      }

      console.log('[CategoryModel] Fetching categories for user:', user.id);
      const db = getDatabaseService();
      const result = await db
        .from<Category>('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })
        .execute();

      const { data, error } = result;

      if (error) {
        console.error('[CategoryModel] Error fetching categories:', error);
        console.error('[CategoryModel] Error type:', typeof error);
        console.error('[CategoryModel] Error message:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error) {
          console.error('[CategoryModel] Error stack:', error.stack);
        }
        return [];
      }

      console.log('[CategoryModel] Successfully fetched categories:', data);
      console.log('[CategoryModel] Number of categories:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('[CategoryModel] Category names:', data.map(c => c.name));
      }
      return data || [];
    } catch (error) {
      console.error('[CategoryModel] Exception in getAllCategories:', error);
      if (error instanceof Error) {
        console.error('[CategoryModel] Exception message:', error.message);
        console.error('[CategoryModel] Exception stack:', error.stack);
      }
      return [];
    }
  },

  async createCategory(input: CreateCategoryInput): Promise<Category | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;

    const withUser = {
      ...input,
      user_id: user.id,
    };

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Category>('categories')
      .insert(withUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return data;
  },

  async updateCategory(categoryId: string, updates: Partial<CreateCategoryInput>): Promise<Category | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Category>('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return null;
    }

    return data;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;

    const db = getDatabaseService();
    const { error } = await db
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .execute();

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  },
};
