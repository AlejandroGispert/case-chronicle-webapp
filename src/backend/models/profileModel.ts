import { getDatabaseService, getAuthService } from '../services';
import { Profile } from './types';

export const profileModel = {
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const authService = getAuthService();
      const { user, error: userError } = await authService.getUser();
      
      if (userError || !user) {
        console.warn('No authenticated user for profile fetch:', userError);
        return null;
      }
      
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Profile>('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error in getCurrentProfile:', error);
      return null;
    }
  },
  
  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    
    if (!user) return null;
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Profile>('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  }
};