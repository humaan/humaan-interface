# Humaan Interface

A Next.js face builder for creating a custom Humaan and generating a reusable email signature.

## Local development

This project uses Node 24 and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.local.example` to `.env.local` and configure MongoDB, Payload, and ImageKit before
using email-signature persistence or opening `/admin`. `HT_USER` and `HT_PASSWORD` optionally
enable shared Basic Auth; if they are omitted, the tool remains public.

After configuring an environment, reset and seed its content:

```bash
pnpm seed
```

The seed clears all people, assets, and template versions while preserving administrator users,
then restores the default template and assets. Public image URLs are served from the application
domain under `/assets/*`; direct ImageKit URLs are not used in generated signatures. Use a different
MongoDB database and `IMAGEKIT_ROOT_FOLDER` for each environment.

## Quality checks

```bash
pnpm lint
pnpm tsc
pnpm test
pnpm build
```

## Deployment

Import the repository into Vercel. The standard Next.js build settings are detected automatically;
no GitHub Pages deployment step is required.

## Email signatures

The **Email signature** action looks up the entered email key, prefills saved names and positions,
stores new face assignments, and lets returning users choose between their saved face and the current
editor face. The **Load saved face** action can restore a saved face to the editor.

Payload manages administrators, people, assets, and the live HTML template at
`/admin`. SVG face masters are stored in ImageKit and delivered as PNG through immutable canonical
`/assets/*` URLs for email-client compatibility.
