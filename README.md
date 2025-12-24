## Backend (Supabase functions) — local run
3. Make the run script executable and start the server:
The function server reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment.
Dev mode (no Supabase keys)
---------------------------------
If you don't want to provide Supabase keys for local development, the server now supports a dev-mode fallback. When `SUPABASE_SERVICE_ROLE_KEY` is not present in the environment, the server will:

- Use an in-memory key/value store instead of the database (data is ephemeral and lost on restart).
- Treat requests that include any `Authorization` header as authenticated and return a fake dev user (id: `dev-user`).

This makes it easy to run end-to-end locally without exposing or configuring real Supabase credentials.
# Craftsmen Marketplace (Copy)

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## OAuth Sign-In (Google & Facebook)

To enable social sign-in in this app using Supabase:

- In your Supabase project console go to **Authentication → Providers**.
- Enable **Google** and/or **Facebook**, and provide the required client ID / secret for each provider.
- Add your application's origin to the list of **Redirect URLs**. For local development use:

```text
http://localhost:5173/
```

Replace the origin above with your production URL when deploying (e.g. `https://yourdomain.com/`).

- The frontend uses the Supabase client in [src/utils/api.ts](src/utils/api.ts) and keys in [src/utils/supabase/info.tsx](src/utils/supabase/info.tsx).
- After enabling providers and setting redirect URLs, users can sign in or sign up using the "Continue with Google" or "Continue with Facebook" buttons in the auth modals.

If you need help generating provider credentials, consult the Supabase docs: https://supabase.com/docs/guides/auth

  # Craftsmen Marketplace (Copy)



  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
