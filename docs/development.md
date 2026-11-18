# Development

Use Node 22 as in the Pages workflow. Install dependencies with `npm ci`.

- Start the local React Router app with `npm run dev`. Open the URL it prints with Playwright CLI.
- Check types with `npm run typecheck` and build with `npm run build`.
- For layout changes, check the affected pages at desktop and mobile widths. Inspect the browser console and failed requests.

Keep the public site and admin behavior distinct when checking a change. The public site uses trailing slashes for canonical URLs.

Use `web:` for public site commits, `admin:` for admin commits and `admin and web:` when a change affects both.
