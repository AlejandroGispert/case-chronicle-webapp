
import { supabase } from '@/integrations/supabase/client';
import { Email, CreateEmailInput } from './types';

export const emailModel = {
  async getEmailsByCase(caseId: string): Promise<Email[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
    
    return data || [];
  },
  
  async createEmail(emailData: CreateEmailInput): Promise<Email | null> {
    console.log('Creating email with data:', emailData);
    const { data, error } = await supabase
      .from('emails')
      .insert(emailData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating email:', error);
      return null;
    }
    
    console.log('Email created:', data);
    return data;
  },
  
  async uploadAttachment(file: File, userId: string): Promise<string | null> {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('email_attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('email_attachments')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },
  
  async deleteEmail(emailId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    
    // Delete associated attachments from storage before deleting email
    const { data: email } = await supabase
      .from('emails')
      .select('attachments')
      .eq('id', emailId)
      .eq('user_id', user.user.id)
      .single();
    
    if (email && email.attachments) {
      const attachments = Array.isArray(email.attachments) ? email.attachments : [];
      
      for (const attachment of attachments) {
        if (attachment.path) {
          await supabase.storage
            .from('email_attachments')
            .remove([attachment.path]);
        }
      }
    }
    
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId)
      .eq('user_id', user.user.id);
      
    if (error) {
      console.error('Error deleting email:', error);
      return false;
    }
    
    return true;
  }
};
