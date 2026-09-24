# Vamshi Polishetti Portfolio

Personal portfolio website built with HTML, CSS, JavaScript, and Vite.

## Features

- Responsive portfolio layout
- Projects, skills, education, experience, and contact sections
- Contact form connected to a Flask email API
- Environment-based API configuration through Vite

## Requirements

- Node.js
- npm

## Environment Variables

Create a `.env` file in the `Portfolio` folder:

```env
VITE_FLASK_CONTACT_FORM_API_URL=https://flask-contact-form-api.onrender.com
VITE_API_KEY=your_contact_form_api_key
```

`VITE_FLASK_CONTACT_FORM_API_URL` should point to the Flask API base URL.

The contact form sends requests to:

```text
${VITE_FLASK_CONTACT_FORM_API_URL}/send-email
```

Note: Vite variables are included in the browser bundle. Do not treat `VITE_API_KEY` as a private server-side secret.

## Install

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd install
```

## Development

```bash
npm run dev
```

Windows PowerShell alternative:

```bash
npm.cmd run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

## Production Build

```bash
npm run build
```

Windows PowerShell alternative:

```bash
npm.cmd run build
```

The production files are generated in:

```text
dist/
```

## GitHub Pages Deployment

This project can deploy through GitHub Actions.

Create these repository secrets or repository variables in GitHub:

```text
VITE_FLASK_CONTACT_FORM_API_URL=https://flask-contact-form-api.onrender.com
VITE_API_KEY=your_contact_form_api_key
```

The deployment workflow passes those values into the Vite build. Because the variables start with `VITE_`, Vite includes them in the generated browser JavaScript.

Recommended location:

```text
Settings > Secrets and variables > Actions > Repository secrets
```

If you create them under repository variables instead, the workflow supports that too.

In GitHub, set Pages source to:

```text
GitHub Actions
```

## Preview Production Build

```bash
npm run preview
```

Windows PowerShell alternative:

```bash
npm.cmd run preview
```

## Favicons

`index.html` declares the site icons from the root of the deployed site, so the
files live in `public/` and Vite copies them to `dist/`:

| File | Purpose |
| --- | --- |
| `favicon.ico` | 16x16 / 32x32 / 48x48 multi-resolution icon |
| `favicon-48x48.png` | PNG icon declared in `<head>` |
| `favicon-96x96.png` | PNG icon declared in `<head>` |
| `favicon-192x192.png` | PNG icon declared in `<head>` |
| `favicon-512x512.png` | Large icon for platforms that request one |
| `apple-touch-icon.png` | 180x180 icon for iOS home screens |

Regenerate them after changing `public/images/Portfolio_icon.jpeg`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-favicons.ps1
```

`-Crop` accepts `WxH+X+Y` geometry and must be square. It defaults to
`170x170+67+14`, which frames the head and shoulders of the source photo; pass
`-Crop ""` to use the largest centred square instead. `-Source`, `-OutDir`,
`-IcoSizes`, `-PngSizes` and `-AppleTouchSize` can also be overridden.

Google only renders a favicon next to search results when the file is a square
(1:1) image that is at least 8x8px and preferably 48x48px or larger, and when
Googlebot-Image can crawl it. The favicon URL must also stay stable, because
Google caches favicons aggressively - a change can take several weeks to show up
in search results.

### SEO files

`public/robots.txt` and `public/sitemap.xml` are copied to the deployed site
root. Crawlers only honour `robots.txt` at the hostname root
(`https://polishettivamshi.github.io/robots.txt`), which a project Pages site
cannot control, but the sitemap is reachable at
`https://polishettivamshi.github.io/Portfolio/sitemap.xml` and can be submitted
in Google Search Console.

## Project Structure

```text
Portfolio/
  index.html
  style.css
  style.js
  admin/
  data/
  public/
    apple-touch-icon.png
    favicon.ico
    favicon-48x48.png
    favicon-96x96.png
    favicon-192x192.png
    favicon-512x512.png
    robots.txt
    sitemap.xml
    images/
  scripts/
    generate-favicons.ps1
  package.json
  .env
```

## Contact Form Backend

The contact form expects the Flask API to support:

```text
POST /send-email
```

The frontend sends JSON with:

```json
{
  "name": "Sender Name",
  "email": "sender@example.com",
  "message": "Message text"
}
```

The request also includes the `X-API-Key` header from `VITE_API_KEY`.
