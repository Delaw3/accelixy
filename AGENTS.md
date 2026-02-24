# Project conventions (Next.js + Mongo)

- Next.js App Router, TypeScript, Tailwind.
- Keep pages in: src/app/(public), (auth), (dashboard).
- Shared code goes in src/lib. DB goes in src/lib/db/mongoose.ts
- Validation: zod.
- Forms: react-hook-form + zod resolver.
- Prefer server actions or route handlers in src/app/api when needed.
- Always run: npm run lint and npm run dev (or tests if present).
- Keep code clean: small components, descriptive names, no unused imports.
- Make sure to style any email html template with the logo respecting the themes 
- Style email templates using site's style
