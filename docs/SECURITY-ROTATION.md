# Production Security Incident & Secret Rotation Procedure

> [!WARNING]
> Critical Security Notice: Secrets were previously committed to the public Git repository. 
> All committed secrets must be treated as completely compromised. 
> Follow this manual checklist in sequence immediately on production.

---

## Manual Owner Checklist

### 1. Rotate Database Passwords for Roles Immediately
The passwords for `academic_app` and `academic_grader` were committed in public scripts. Connect to your database as `postgres` (or supabase admin) and rotate credentials immediately:

```sql
-- Generate two distinct, cryptographically secure 64-character passwords:
ALTER ROLE academic_app WITH PASSWORD '<NEW_STRONG_APP_PASSWORD_64_CHARS>';
ALTER ROLE academic_grader WITH PASSWORD '<NEW_STRONG_GRADER_PASSWORD_64_CHARS>';
```

Update your connection strings in the Vercel/Hosting Environment Variables accordingly:
- `DATABASE_URL_APP`
- `DATABASE_URL_GRADER`

---

### 2. Generate a New `CODE_PEPPER` & Regenerate Unredeemed Access Codes
Because `CODE_PEPPER` was exposed in repository commits:
1. Generate a new cryptographically secure 64-character hex string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Set this value as `CODE_PEPPER` in your production environment variables.
3. Because code hashes are one-way HMAC signatures, the plaintext of unredeemed codes cannot be reversed with the new pepper. You must:
   - Export or delete unredeemed rows from `academic_private.redeemable_codes`.
   - Regenerate fresh plaintext access codes for distribution.
   - Run `npx tsx scripts/add-codes.ts seed/private/new-codes.csv` using the new `CODE_PEPPER`.

---

### 3. Disable / Reset the Demo Student Account on Production
The demo student credentials (`20230814` / `Student@2026`) were publicly exposed.
Connect to the database as admin or use the reset script:

```sql
-- Option A: Lock and deactivate the demo account
UPDATE public.academic_accounts 
   SET is_active = false, 
       locked_until = '2099-01-01 00:00:00+00' 
 WHERE national_id = '20230814';

-- Option B: Force an immediate password change with a new random secret:
-- Run: ADMIN_NEW_PASSWORD="<new-random-pass>" npx tsx scripts/admin-reset-password.ts 20230814
```

Revoke any active sessions for the demo account:
```sql
UPDATE public.academic_sessions
   SET revoked_at = now()
 WHERE account_id = (SELECT id FROM public.academic_accounts WHERE national_id = '20230814');
```

---

### 4. Make Repository Private & Purge History
1. In GitHub Repository Settings, change visibility from **Public** to **Private**.
2. Even after making the repository private, purge historical commits containing the leaks using `git-filter-repo` or BFG Repo-Cleaner:
   ```bash
   git filter-repo --replace-text <(echo "f062b6e27ef4e55a2581a4b4e1dd25c90b7064f0d8e765a0==>REDACTED")
   ```
3. **Note:** Treat all leaked credentials as permanently compromised regardless of history purging.

---

### 5. Review Supabase Logs & Audit Trail for Unauthorized Access
1. In Supabase Dashboard -> **Logs** -> **Database / Auth / API**:
   - Filter for incoming connections from unfamiliar client IPs using the compromised roles.
2. Inspect `academic_private.audit_log`:
   ```sql
   SELECT * FROM academic_private.audit_log 
    ORDER BY at DESC 
    LIMIT 200;
   ```
   Check for unexpected `LOGIN_SUCCESS`, `EXAM_SUBMITTED`, or code redemptions.

---

### 6. Turn Off Supabase Data API & Expose No Public Schemas
This application connects directly via PostgreSQL protocol (`postgres.js`). The Supabase PostgREST Data API is not used and should be completely disabled:
1. Navigate to Supabase Dashboard -> **Project Settings** -> **API**.
2. Under **Exposed Schemas**, remove `public` and `academic_private` (leave empty or expose an empty dummy schema).
3. Ensure no Supabase client key (`anon` or `service_role`) is exposed in frontend client bundles.

---

### 7. Enable Automated Database Backups & Point-in-Time Recovery (PITR)
1. Verify automated daily backups are active in Supabase -> **Database** -> **Backups**.
2. If available on your tier, enable Point-in-Time Recovery (PITR).
3. **Critical:** Always securely store a backup of `CODE_PEPPER` alongside database backups, as existing redeemable codes cannot be verified without it.

---

### 8. Set Strict Production Environment Variables on Host (Vercel)
Ensure the following variables are configured in the Vercel Project Settings:
- `DATABASE_URL_APP`: New password with `sslmode=require`
- `DATABASE_URL_GRADER`: New password with `sslmode=require`
- `CODE_PEPPER`: New 64-character hex string
- `APP_SECRET`: Cryptographically random 64-character hex string (for IP/identifier rate limiting HMAC)
- `CRON_SECRET`: Cryptographically random 64-character hex string
- `DB_SSL`: `require`
- `DB_POOL_MAX`: `2` (serverless pooler limit)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`: Valid Cloudflare credentials
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile server secret (optional)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile public key (optional)
- `ALLOWED_ORIGINS`: Your production domain (e.g. `https://your-domain.edu.eg`)
