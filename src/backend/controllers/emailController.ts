
import { emailModel } from '../models/emailModel';
import { CreateEmailInput, EmailAttachment } from '../models/types';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const emailController = {
  async fetchEmailsByCase(caseId: string) {
    return await emailModel.getEmailsByCase(caseId);
  },
  
  async createNewEmail(emailData: CreateEmailInput, files?: File[]) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
    // Create formatted date and time for the email
    const now = new Date();
    const formattedDate = format(now, 'yyyy-MM-dd');
    const formattedTime = format(now, 'HH:mm');
    
    // Upload attachments if any
    const attachments: EmailAttachment[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        const publicUrl = await emailModel.uploadAttachment(file, user.user.id);
        if (publicUrl) {
          attachments.push({
            id: crypto.randomUUID(),
            filename: file.name,
            type: file.type,
            path: `${user.user.id}/${Date.now()}-${file.name}`,
            url: publicUrl,
            size: file.size
          });
        }
      }
    }
    
    // Create email with attachments
    const emailWithAttachments: CreateEmailInput = {
      ...emailData,
      date: formattedDate,
      time: formattedTime,
      attachments: attachments.length > 0 ? attachments : undefined,
      user_id: user.user.id
    };
    
    return await emailModel.createEmail(emailWithAttachments);
  },
  
  async removeEmail(emailId: string) {
    return await emailModel.deleteEmail(emailId);
  }
};
