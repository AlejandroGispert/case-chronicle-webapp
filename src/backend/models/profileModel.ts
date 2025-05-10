
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const profileModel = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },
  
  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
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