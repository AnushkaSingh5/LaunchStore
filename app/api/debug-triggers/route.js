import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET() {
  if (!supabaseClient) {
    return NextResponse.json({ error: 'Supabase client not initialized' });
  }

  try {
    // Call exec_query RPC to query database triggers from information_schema
    const { data: triggers, error: triggersErr } = await supabaseClient
      .rpc('exec_query', {
        p_sql: `
          SELECT 
            event_object_table AS table_name,
            trigger_name,
            action_statement,
            action_timing
          FROM information_schema.triggers
          WHERE event_object_schema = 'public'
        `
      });

    return NextResponse.json({
      triggers,
      triggersErr
    });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
