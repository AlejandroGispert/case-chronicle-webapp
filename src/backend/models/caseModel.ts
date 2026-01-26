import { getDatabaseService, getAuthService } from '../services';
import { Case, CaseWithRelations, CreateCaseInput } from './types';

export const caseModel = {
  async getCases(): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('date_created', { ascending: false })
      .execute();
      
    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getCasesByStatus(status: string): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>('cases')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('date_created', { ascending: false })
      .execute();
      
    if (error) {
      console.error(`Error fetching ${status} cases:`, error);
      return [];
    }
    
    return data || [];
  },
  
  async getCaseWithRelations(caseId: string): Promise<CaseWithRelations | null> {
    console.log("Fetching case with ID:", caseId);
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    const db = getDatabaseService();
    
    // Get the case
    const { data: caseData, error: caseError } = await db
      .from<Case>('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.id)
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
    const { data: emails, error: emailsError } = await db
      .from('emails')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .execute();
      
    if (emailsError) {
      console.error('Error fetching case emails:', emailsError);
      return null;
    }
    
    console.log("Found emails:", emails);
    
    // Get events for this case
    const { data: events, error: eventsError } = await db
      .from('events')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .execute();
      
    if (eventsError) {
      console.error('Error fetching case events:', eventsError);
      return null;
    }
    
    console.log("Found events:", events);
    
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
  
      const db = getDatabaseService();
      const { data, error } = await db
        .from<Case>('cases')
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
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Case>('cases')
      .update(updates)
      .eq('id', caseId)
      .eq('user_id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating case:', error);
      return null;
    }
    
    return data;
  },
  
  async deleteCase(caseId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;
    
    const db = getDatabaseService();
    const { error } = await db
      .from('cases')
      .delete()
      .eq('id', caseId)
      .eq('user_id', user.id)
      .execute();
      
    if (error) {
      console.error('Error deleting case:', error);
      return false;
    }
    
    return true;
  }
};
