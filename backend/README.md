# Portfolio Admin CMS Backend

A lightweight Flask-based admin CMS for managing portfolio content without a database.

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
python app.py
```

3. Access the application:
- **Portfolio**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin
- **API Endpoint**: http://localhost:5000/api/portfolio
- **Health Check**: http://localhost:5000/health

## Login Credentials

Set these in the `.env` file in the Portfolio root directory:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Vamshi@2024
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin/login` | Authenticate admin | No |
| POST | `/admin/logout` | Logout admin | No |
| GET | `/admin/check` | Check auth status | No |
| GET | `/api/portfolio` | Get all portfolio data | No |
| PUT | `/api/portfolio` | Update entire portfolio | Yes |
| GET | `/api/portfolio/<section>` | Get specific section | No |
| PUT | `/api/portfolio/<section>` | Update specific section | Yes |
| POST | `/upload` | Upload file (image/PDF) | Yes |

## File Structure

```
backend/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── start.py            # Startup script
├── README.md           # This file
├── data/
│   └── portfolio.json  # Portfolio data storage
└── admin/
    ├── index.html      # Admin dashboard
    ├── admin.css       # Admin styles
    └── admin.js        # Admin JavaScript
```

## Data Storage

All portfolio content is stored in `data/portfolio.json`. The JSON file is automatically created on first run with default data.

## File Uploads

Uploaded files are stored in `public/uploads/`. Supported formats:
- **Images**: PNG, JPG, JPEG, GIF, WebP, SVG
- **Resume**: PDF only