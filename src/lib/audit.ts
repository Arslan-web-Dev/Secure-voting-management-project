import { supabase } from './supabaseClient';
import type { JsonObject } from '../types/models';

interface LogPayload {
  action: string;
  userId?: string;
  metadata?: JsonObject;
}

export const logActivity = async ({ action, userId, metadata }: LogPayload) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action,
        user_id: userId || null,
        metadata: metadata || {},
        ip_address: '127.0.0.1' // Simulated IP address
      });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
