# Supabase Setup for Group Orders

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - Project name: `party-on-delivery`
   - Database password: (save this securely)
   - Region: Choose closest to Austin (US East or Central)
6. Click "Create new project" and wait ~2 minutes

### 2. Get Your API Keys
1. Go to Settings → API
2. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon/public key

### 3. Create Database Tables
1. Go to SQL Editor in Supabase dashboard
2. Click "New query"
3. Copy and paste the entire contents of `/src/lib/supabase/schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### 4. Verify Setup
1. Go to Table Editor in Supabase
2. You should see three tables:
   - `group_orders`
   - `group_participants`
   - `group_messages`

### 5. Update Environment Variables
In your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-long-anon-key...
```

### 6. Restart Dev Server
```bash
npm run dev
```

## That's it! 🎉

Your group orders will now persist in the database. The API routes are already configured to use Supabase when the environment variables are set.

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the SQL schema in step 3
- Check that all tables were created in Table Editor

### "Invalid API key" error
- Double-check your `.env.local` values
- Make sure there are no extra spaces or quotes
- Restart the dev server after updating `.env.local`

### Can't see data in Supabase dashboard
- Check Table Editor → group_orders
- Make sure RLS policies are enabled (they are in our schema)
- Try creating a test group order through the app

## Production Considerations

For production, you may want to:
1. Add proper authentication policies
2. Set up database backups
3. Configure connection pooling for high traffic
4. Add monitoring and alerts

Supabase's free tier includes:
- 500MB database
- 2GB bandwidth
- 50MB file storage
- More than enough for testing and small production use