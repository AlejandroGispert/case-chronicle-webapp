
import { supabase } from '@/integrations/supabase/client';
import { profileModel } from '../models/profileModel';

export const authController = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session };
    } catch (error) {
      
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async signup(email: string, password: string, firstName: string, lastName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        }
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },
  
  async getCurrentProfile() {
    return await profileModel.getCurrentProfile();
  },
  
  async updateProfile(updates: any) {
    return await profileModel.updateProfile(updates);
  }
};
