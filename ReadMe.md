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

## Preview Production Build

```bash
npm run preview
```

Windows PowerShell alternative:

```bash
npm.cmd run preview
```

## Project Structure

```text
Portfolio/
  index.html
  style.css
  style.js
  images/
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
