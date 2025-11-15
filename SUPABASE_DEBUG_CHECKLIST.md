# Supabase Auth Signup Error — Diagnostic Checklist

Error: `Database error saving new user` (HTTP 500)

## Steps to find and fix the issue

### Step 1: Find trigger functions that reference `profiles`
1. Go to **Supabase Dashboard** → **Database** → **SQL Editor**
2. Create a **new query** and paste this:

```sql
SELECT n.nspname AS schema,
       p.proname AS function_name,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%profiles%'
ORDER BY schema, function_name;
```

3. Click **Run** and examine the results.
   - Look for any function that does `INSERT INTO public.profiles` or `UPDATE profiles`.
   - These are likely attached to `auth.users` `AFTER INSERT` triggers.
   - **Copy the full function definition** and save it.

### Step 2: Check triggers attached to `auth.users`
1. In the same **SQL Editor**, run:

```sql
SELECT trigger_name, event_object_schema, event_object_table, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' OR action_statement ILIKE '%profiles%'
ORDER BY trigger_name;
```

2. Look for any trigger named like `on_auth_user_created` or similar.
   - Note the **trigger name** and which **function** it calls.

### Step 3: Check the `profiles` table structure
1. Run:

```sql
SELECT column_name, is_nullable, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

2. **Note any columns** that have:
   - `is_nullable = NO` (NOT NULL)
   - AND `column_default = NULL` (no default value)
   - These MUST be provided by the trigger or the INSERT will fail.

### Step 4: Check for unique constraints
1. Run:

```sql
SELECT
  i.relname as index_name,
  a.attname as column_name,
  ix.indisunique as is_unique,
  ix.indisprimary as is_primary
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r' AND t.relname = 'profiles'
ORDER BY i.relname;
```

2. Check if there are any UNIQUE constraints that might fail (e.g., duplicate email).

### Step 5: Check Supabase Logs for detailed error
1. Go to **Supabase Dashboard** → **Logs** (side menu, usually under "Monitoring")
2. Filter by:
   - **Source**: `function_edge` or `postgres` or `api`
   - **Search**: `error` or `profiles` or `signup`
3. Look for the most recent error log from when you ran the signup test.
4. **Read the full stack trace** — it will show which SQL line failed and why.

---

## Common Fixes

### If the trigger function references a missing or renamed column
**Symptom**: Log shows `column "xyz" does not exist`

**Fix**: Update the function to only insert columns that exist in the current `profiles` table.

Example (if function has old column `storage_limit` but table no longer has it):
```sql
-- Wrong (old):
INSERT INTO profiles (id, email, full_name, storage_limit) 
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 100);

-- Right (new):
INSERT INTO profiles (id, email, full_name) 
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
```

### If a NOT NULL column has no value from auth.users
**Symptom**: Log shows `null value in column "xyz" violates not-null constraint`

**Fix**: Either make the column NULLABLE, or provide a default value in the trigger:

```sql
-- Option A: Make the column nullable
ALTER TABLE profiles ALTER COLUMN some_column DROP NOT NULL;

-- Option B: Provide a default in the trigger function
INSERT INTO profiles (id, email, full_name, some_column) 
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', '');
```

### If RLS policy blocks the insert
**Symptom**: Log shows `new row violates row-level security policy`

**Fix**: The trigger function must have `SECURITY DEFINER` so it runs as the owner (not the user):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

## After Finding the Issue

1. **Copy the full trigger function definition** from Step 1 or Step 2.
2. **Paste it in a new message** so I can analyze it and provide the exact SQL fix.
3. Alternatively, if you see the error in the Logs (Step 5), **copy the stack trace** and paste it here.

---

## Quick Test After Fix
Once you've fixed the function, test the signup again:

```bash
node scripts/test-signup.js newtest@example.com 'TestPassword123!'
```

If it works, you'll see `data: { user: {...}, session: {...} }` instead of an error.
