# Iveus Studios

A complete, self-hosted commercial photography portfolio for models, brands and products, with weddings as a secondary collection built with **Tailwind CSS 4** and **Three.js**. The supplied black-and-gold logo is included unmodified. The brand spelling is interpreted as “Iveus”; change the text if needed.

## Start here

1. Unzip this folder.
2. Preview with **Node.js 20+**: run `npm start`, then open `http://localhost:4173`.
   - No installation is needed just to preview: all runtime assets are already in `dist/`.
   - Or run `python3 -m http.server 4173 --directory dist` from this folder.
   - Opening `dist/index.html` directly gives a basic preview, but Three.js needs an HTTP server because browsers restrict JavaScript module loading from local files.
3. Your email and phone are already configured. Personalise `dist/config.js` with your Instagram profile and your own photos.
4. Upload the **contents of `dist/`** to your own web host's public folder. No Node.js server or database is required on your host.

Nothing has been deployed or published.

## What is included

- Responsive editorial homepage and the supplied logo.
- Three manually selected hero photographs.
- A real Three.js photo plane with gentle pointer parallax, ambient light and fine grain.
- Reduced-motion support, motion pause, offscreen suspension and a static image fallback when WebGL is unavailable.
- Filterable model, brand, product and wedding collections.
- Full-screen photo viewer, arrow-key navigation, swipe gestures and native accessible dialogs.
- Photography approach, studio introduction and enquiry section.
- Enquiry preparation with copy/download; email and WhatsApp actions are connected to your supplied contact details.
- All photos, fonts, compiled Tailwind CSS and Three.js runtime files stored locally.
- Image attribution, font/software license files, research notes and a validation summary.

## Personalise the contact details

Open `dist/config.js`:

```js
email: 'iveusstudios@gmail.com',
whatsapp: '919559481865', // +91 95594 81865
instagram: 'https://www.instagram.com/YOUR_PROFILE/',
```

Leave a value blank to hide that channel. The enquiry form is deliberately **frontend-only**: it prepares the visitor's enquiry and opens their email or WhatsApp, where they review and send it. There is no backend inbox, automatic email delivery, database or form service. Without contact details, the preview only offers copy and download and explains that nothing was sent. The supplied email and phone are connected, including a click-to-call link.

To receive submissions automatically, connect a form endpoint on your own host and update the submit handler in `dist/app.js` and the privacy copy. Never place private SMTP credentials or secret API keys in browser code.

## Replace the demo images

The bundled photography is sourced from Unsplash and is visibly marked as sample imagery. **These are not represented as photographs taken by Iveus.** No competitor photographs or videos have been copied.

Replace files in `dist/assets/` with your own portfolio, or change their relative paths in `dist/config.js`. Use images you own or are authorised to present as your work.

- `hero.jpg`: fashion/model hero.
- `hero-product.jpg`: product hero.
- `hero-brand.jpg`: menswear/model hero.
- Model, product and brand assets are referenced directly by gallery records in `config.js`.
- `wedding.jpg`: secondary wedding collection.
- `about.jpg`: editorial photograph supporting the studio introduction; it is not identified as the studio owner.
- `iveus-logo.jpeg`: your exact original logo. The header crops only its surrounding black space using CSS.

For each photo record, update `title`, `subtitle`, `category`, `alt`, `position`, `photographer` and `source`. Categories must match one of `models`, `brands`, `products`, or `weddings`. Shape can be `tall` or `short`. Add/remove gallery records as needed; counts update automatically. The supplied hero controls expect three `heroSlides`; update the three buttons in `dist/index.html` if you change that number.

`position` controls the image crop using two percentages, for example `50% 20%`. Both the static hero and Three.js hero use this setting. Keep important details away from the outer edges for narrow mobile screens.

After you have replaced **all** demo photography, set `demoMode: false` and update/remove `photoCredits`. Update the static about image's alternative text in `dist/index.html` as well. The reference imagery demonstrates the intended visual style, not a claim about your actual clients, locations, awards or experience.

## Edit the design and content

| File | Purpose |
|---|---|
| `dist/index.html` | Page structure, copy, metadata, form and dialogs |
| `dist/config.js` | Contact details, hero images, gallery records, image credits |
| `dist/styles.css` | Custom typography, layout, colours and responsive rules |
| `src/tailwind.css` | Tailwind theme and source-scanning configuration |
| `dist/tailwind.css` | Precompiled production utility CSS |
| `dist/app.js` | Navigation, gallery, lightbox, enquiry preparation, privacy/credits |
| `dist/scene.js` | Three.js photo plane, animation and fallbacks |
| `dist/vendor/` | Local Three.js runtime and its MIT license |
| `dist/fonts.css`, `dist/assets/fonts/` | Local font declarations, files and OFL licenses |
| `scripts/serve.mjs` | Dependency-free local preview server |
| `scripts/copy-vendor.mjs` | Copies the pinned Three.js distribution into `dist/` |
| `IMAGE-CREDITS.json` | Exact image sources, artists, license links and filenames |
| `RESEARCH.md` | References reviewed and design choices |
| `VALIDATION.md` | Checks completed and testing limits |

These HTML, CSS and JS files are the complete editable source. No proprietary page builder is required.

## Rebuild after changing Tailwind classes

The compiled assets are included, so installation is optional unless rebuilding.

```sh
npm ci
npm run build
npm start
```

`npm run build` regenerates Tailwind CSS and refreshes the local Three.js runtime. It does not overwrite your HTML, custom CSS, configuration, photographs or interaction code. Dependency versions are pinned and `package-lock.json` is included.

For custom colours and layouts, edit `dist/styles.css`. If changing Tailwind classes or the Tailwind theme, rebuild before uploading.

## Hosting

Use any static-file host, Apache/Nginx directory, or cPanel `public_html`. Upload everything **inside** `dist/` together; keep relative paths unchanged. Subdirectory hosting is supported. Serve `.js` files with a JavaScript MIME type and use HTTPS. No build service, paid plugin, CDN, API key or database is needed.

Before publication, replace the sample images with your actual portfolio and confirm your supplied contact details. Check your biography, session categories and copy reflect what you offer. Update `index.html`'s title, description and Open Graph text; add your canonical URL after choosing the domain. Review the simple privacy note against your host and any integrations you add.

## Technical notes

All essential UI works independently of Three.js. A WebGL2-capable browser enhances the hero; unsupported devices retain the static photograph. Modern Chrome, Safari, Firefox and Edge support the APIs used. Reduced-motion preferences are respected. Images below the fold load lazily.

The site has no analytics, tracking cookies, local storage, hidden form submission or third-party runtime requests. External source/profile links and email/WhatsApp actions open only when clicked. Web hosting access logs are controlled by your provider.

## Attribution

See `IMAGE-CREDITS.json` and `RESEARCH.md`. Font licenses are under `dist/assets/fonts/`. Three.js and Tailwind are MIT licensed; retain `THIRD-PARTY-LICENSES.txt` and `dist/vendor/THREE-LICENSE.txt` with redistributed source. Your supplied logo remains yours.
