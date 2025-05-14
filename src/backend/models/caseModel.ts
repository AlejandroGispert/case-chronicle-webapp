import { supabase } from '@/integrations/supabase/client';
import { Case, CaseWithRelations, CreateCaseInput } from './types';

export const caseModel = {
  async getCases(): Promise<Case[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date_created', { ascending: false });
      
    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getCasesByStatus(status: string): Promise<Case[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('status', status)
      .order('date_created', { ascending: false });
      
    if (error) {
      console.error(`Error fetching ${status} cases:`, error);
      return [];
    }
    
    return data || [];
  },
  
  async getCaseWithRelations(caseId: string): Promise<CaseWithRelations | null> {
    console.log("Fetching case with ID:", caseId);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Get the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.user.id)
      .maybeSingle();
      
    if (caseError) {
      console.error('Error fetching case:', caseError);
      return null;
    }
    
    if (!caseData) {
      console.error('No case data found for ID:', caseId);
      return null;
    }
    
    console.log("Found case data:", caseData);
    
    // Get emails for this case
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
      
    if (emailsError) {
      console.error('Error fetching case emails:', emailsError);
      return null;
    }
    
    console.log("Found emails:", emails);
    
    // Get events for this case
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
      
    if (eventsError) {
      console.error('Error fetching case events:', eventsError);
      return null;
    }
    
    console.log("Found events:", events);
    
    const result = {
      ...caseData,
      emails: emails || [],
      events: events || []
    };
    
    // Parse attachments from JSON to EmailAttachment[]
    const processedEmails = (emails || []).map(email => ({
      ...email,
      attachments: email.attachments ? JSON.parse(email.attachments as string) : []
    }));

    const processedResult = {
      ...caseData,
      emails: processedEmails,
      events: events || []
    };

    console.log("Returning case with relations:", processedResult); 
    return processedResult;
  },
  
  async createCase(caseData: CreateCaseInput): Promise<Case | null> {
    try {
      console.log("Attempting to create a case with data:", caseData);
  
      const { data, error } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating case:", error);
        return null;
      }
      
      console.log("Case created successfully:", data);
      return data;
    } catch (err) {
      console.error("Unexpected error creating case:", err);
      return null;
    }
  },
  
  async updateCase(caseId: string, updates: Partial<Case>): Promise<Case | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;
    
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating case:', error);
      return null;
    }
    
    return data;
  },
  
  async deleteCase(caseId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId)
      .eq('user_id', user.user.id);
      
    if (error) {
      console.error('Error deleting case:', error);
      return false;
    }
    
    return true;
  }
};
