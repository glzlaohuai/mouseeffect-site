# MouseEffect website

The public marketing, privacy and support site for MouseEffect, a native macOS 27.0+ mouse particle utility by Hiimob Apps.

**Live:** https://mouseeffect.hiimobapps.cn/  
**Support:** 494763134@qq.com  
**App Store ID:** 6828321000 (not yet released; all download messaging says coming soon)

## Local development

Use Node.js 22.12+ or 24 and npm.

```sh
npm ci
npm run dev
npm run build
npm run verify
npm run preview
node scripts/browser-check.mjs http://127.0.0.1:4321
```

`build` checks TypeScript and generates static HTML. `verify` requires every locale, all 42 pages, local links, canonical/hreflang, sitemap, CNAME and custom 404. The optional browser check uses Playwright Chromium and axe, inspects all 42 routes at desktop and mobile widths, checks Arabic RTL, reduced motion, keyboard demo controls, language preservation and 404. Install Chromium with `npx playwright install chromium` if needed. Pass an output directory as its second argument to save screenshots and JSON evidence.

## Routes and translations

Each locale has a complete home page, ten-section privacy policy and eight-section support guide. The files in `src/data/` share a checked schema, with no English fallback. `src/data/locales.ts` controls language order and paths.

| Language           | Home        | Privacy             | Support             |
| ------------------ | ----------- | ------------------- | ------------------- |
| English            | `/`         | `/privacy/`         | `/support/`         |
| 简体中文           | `/zh-hans/` | `/zh-hans/privacy/` | `/zh-hans/support/` |
| 繁體中文           | `/zh-hant/` | `/zh-hant/privacy/` | `/zh-hant/support/` |
| 日本語             | `/ja/`      | `/ja/privacy/`      | `/ja/support/`      |
| 한국어             | `/ko/`      | `/ko/privacy/`      | `/ko/support/`      |
| Français           | `/fr/`      | `/fr/privacy/`      | `/fr/support/`      |
| Deutsch            | `/de/`      | `/de/privacy/`      | `/de/support/`      |
| Español            | `/es/`      | `/es/privacy/`      | `/es/support/`      |
| Português (Brasil) | `/pt-br/`   | `/pt-br/privacy/`   | `/pt-br/support/`   |
| Русский            | `/ru/`      | `/ru/privacy/`      | `/ru/support/`      |
| العربية            | `/ar/`      | `/ar/privacy/`      | `/ar/support/`      |
| Bahasa Indonesia   | `/id/`      | `/id/privacy/`      | `/id/support/`      |
| ไทย                | `/th/`      | `/th/privacy/`      | `/th/support/`      |
| Tiếng Việt         | `/vi/`      | `/vi/privacy/`      | `/vi/support/`      |

The website is multilingual. **The native app interface is currently Chinese.** Product descriptions and screenshot captions state this explicitly.

## Product facts

Built-in effects are free. Creating, editing and temporarily previewing custom effects is free. Unsaved drafts last for the current app session. A one-time in-app purchase (US$4.99 base price, local App Store pricing applies) unlocks saving and formally activating custom effects. Purchases can be restored with the same Apple Account. There is no subscription.

Privacy text is grounded in read-only inspection of the native app's mouse monitor, transparent overlay, settings, preset/asset storage and StoreKit implementation. There is no global keyboard monitoring, screen capture, pointer replacement, mouse-history recording, developer payment server, analytics, account system, advertising or website form. Hosting logs are separately disclosed. Support uses `mailto:`.

## Assets and design

To refresh all four current captures:

```sh
node scripts/import-screenshots.mjs /absolute/path/to/current/raw/screenshots
```

The importer requires `library.png`, `editor.png`, `settings.png` and `purchase.png`. It writes size metadata to prevent layout shifts and source SHA-256 values to `SCREENSHOTS.json`.

The app icon is the original MouseEffect icon. Current app screenshots are copied from the native project's release capture directory and optimized to WebP without altering the UI. The repository includes no generated product mockups. The canvas is a labeled website demonstration, not the native rendering engine. Rendering is bounded, stops offscreen/when hidden, has explicit pause and keyboard-accessible burst controls, and starts paused for `prefers-reduced-motion`.

`PRODUCT.md` and `DESIGN.md` record the approved product and visual context. The native application workspace is not modified by this site.

## Deploy

Pushes to `main` build, validate and publish `dist/` through `.github/workflows/deploy.yml`. GitHub Pages uses **GitHub Actions** as its source. The workflow has read-only repository content, Pages write and OIDC permissions; it needs no deployment secret.

- Custom domain: `mouseeffect.hiimobapps.cn`
- Public DNS: `mouseeffect CNAME glzlaohuai.github.io.` (TTL 600)
- Alibaba Cloud DNS record ID: `2116087460806743040`
- `public/CNAME` preserves the domain in the artifact
- GitHub Pages enforces HTTPS
- `public/robots.txt` and generated `/sitemap.xml` cover the public site

When the app is actually released, update availability copy in all fourteen locale files together. Do not replace “coming soon” with a live download claim until App Store availability has been verified.
