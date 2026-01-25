
import { supabase } from '@/integrations/supabase/client';
import { Event, CreateEventInput } from './types';

export const eventModel = {
  async getEventsByCase(caseId: string): Promise<Event[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    console.log('Events fetched from Supabase for case', caseId, ':', data);
    return data || [];
  },

  async getAllEvents(): Promise<Event[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
    
    return data || [];
  },
  
  async createEvent(eventData: CreateEventInput): Promise<Event | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  // Validate UUID format (optional but helpful)
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!isValidUUID.test(eventData.case_id)) {
  console.error("Invalid case_id UUID:", eventData.case_id);
  return null;
}
  const eventWithUser = {
    ...eventData,
    user_id: user.user.id
  };

  const { data, error } = await supabase
    .from('events')
    .insert(eventWithUser)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error.message, error.details);
    return null;
  }

  return data;
}
,

  async deleteEvent(eventId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.user.id);
      
    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }
    
    return true;
  }
};