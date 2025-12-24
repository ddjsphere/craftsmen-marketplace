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
  
