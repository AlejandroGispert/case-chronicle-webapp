import { categoryModel } from '../models/categoryModel';
import { CreateCategoryInput, Category } from '../models/types';
import { requireAuth } from '../auth/authorization';
import { getAuthService } from '../services';
import { logSuccess } from '../audit';

export const categoryController = {
  async fetchAllCategories(): Promise<Category[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await categoryModel.getAllCategories();
  },

  async createCategory(input: CreateCategoryInput): Promise<Category | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const result = await categoryModel.createCategory(input);
    if (result) {
      await logSuccess(user.id, "data_create", {
        resource_type: "category",
        resource_id: result.id,
      });
    }
    return result;
  },

  async updateCategory(categoryId: string, updates: Partial<CreateCategoryInput>): Promise<Category | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await categoryModel.updateCategory(categoryId, updates);
  },

  async removeCategory(categoryId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await categoryModel.deleteCategory(categoryId);
  },
};
