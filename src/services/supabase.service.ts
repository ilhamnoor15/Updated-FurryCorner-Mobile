import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuukxjnutruurjkyzdaw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-8lnd11Ufx2lrpX5ARh4bA_F59WPGNB';

export const supabase = createClient(
  'https://xuukxjnutruurjkyzdaw.supabase.co',
  'sb_publishable_-8lnd11Ufx2lrpX5ARh4bA_F59WPGNB'
);