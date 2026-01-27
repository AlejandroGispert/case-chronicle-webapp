import { categoryModel } from '../models/categoryModel';
import { CreateCategoryInput, Category } from '../models/types';

export const categoryController = {
  async fetchAllCategories(): Promise<Category[]> {
    return await categoryModel.getAllCategories();
  },

  async createCategory(input: CreateCategoryInput): Promise<Category | null> {
    return await categoryModel.createCategory(input);
  },

  async updateCategory(categoryId: string, updates: Partial<CreateCategoryInput>): Promise<Category | null> {
    return await categoryModel.updateCategory(categoryId, updates);
  },

  async removeCategory(categoryId: string): Promise<boolean> {
    return await categoryModel.deleteCategory(categoryId);
  },
};
