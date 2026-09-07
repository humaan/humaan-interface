# Humaan Interface

A Next.js face builder for creating and exporting a custom Humaan.

## Local development

This project uses Node 24 and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Future email signature tool

Face configuration and generation live in `src/domain/face`, independently of the editor UI. This is
the intended seam for a future HTML email signature generator once its requirements are defined.
