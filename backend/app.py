import os
import json
import secrets
import functools
import time
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, session, send_from_directory, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))

# Secure session cookies
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False,  # Set True in production with HTTPS
    PERMANENT_SESSION_LIFETIME=1800,  # 30 minutes
)

# CORS configuration
CORS(app, supports_credentials=True, origins=["*"])

# ─── Rate Limiting & Brute Force Protection ───
LOGIN_ATTEMPTS = {}  # {ip: {count: int, last_attempt: float, locked_until: float}}
MAX_ATTEMPTS = 5
LOCKOUT_DURATION = 900  # 15 minutes in seconds

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = Path(__file__).parent / 'data'
UPLOAD_DIR = BASE_DIR / 'public' / 'uploads'
DIST_DIR = BASE_DIR / 'dist'
PORTFOLIO_JSON = DATA_DIR / 'portfolio.json'

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Auth credentials from .env (password is hashed for security)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_PASSWORD_HASH = generate_password_hash(os.getenv('ADMIN_PASSWORD'))

def check_rate_limit(ip):
    """Check if IP is rate-limited or locked out."""
    now = time.time()
    if ip in LOGIN_ATTEMPTS:
        info = LOGIN_ATTEMPTS[ip]
        # Check if lockout has expired
        if info.get('locked_until', 0) > 0 and now > info['locked_until']:
            LOGIN_ATTEMPTS[ip] = {'count': 0, 'last_attempt': now, 'locked_until': 0}
        # Check if locked out
        if LOGIN_ATTEMPTS[ip].get('locked_until', 0) > 0:
            remaining = int(LOGIN_ATTEMPTS[ip]['locked_until'] - now)
            return False, f"Account locked. Try again in {remaining} seconds."
    return True, ""

def record_failed_attempt(ip):
    """Record a failed login attempt."""
    now = time.time()
    if ip not in LOGIN_ATTEMPTS:
        LOGIN_ATTEMPTS[ip] = {'count': 0, 'last_attempt': now, 'locked_until': 0}
    LOGIN_ATTEMPTS[ip]['count'] += 1
    LOGIN_ATTEMPTS[ip]['last_attempt'] = now
    if LOGIN_ATTEMPTS[ip]['count'] >= MAX_ATTEMPTS:
        LOGIN_ATTEMPTS[ip]['locked_until'] = now + LOCKOUT_DURATION
        return True  # Locked out
    return False

def reset_attempts(ip):
    """Reset login attempts after successful login."""
    LOGIN_ATTEMPTS.pop(ip, None)

# Session-based auth decorator
def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('authenticated'):
            return jsonify({'error': 'Unauthorized', 'message': 'Please login first'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ─── Portfolio Data Helpers ───

def load_portfolio():
    """Load portfolio data from JSON file."""
    if PORTFOLIO_JSON.exists():
        with open(PORTFOLIO_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_portfolio(data):
    """Save portfolio data to JSON file."""
    with open(PORTFOLIO_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─── Auth Routes ───

@app.route('/admin/login', methods=['POST'])
def admin_login():
    """Authenticate admin user."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request', 'message': 'No JSON body provided'}), 400
    
    ip = request.remote_addr or request.environ.get('REMOTE_ADDR', 'unknown')
    
    # Check rate limit
    allowed, lockout_msg = check_rate_limit(ip)
    if not allowed:
        return jsonify({'error': 'Rate limited', 'message': lockout_msg}), 429
    
    username = data.get('username', '')
    password = data.get('password', '')
    
    if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
        reset_attempts(ip)
        session['authenticated'] = True
        session['username'] = username
        session.permanent = True
        return jsonify({'success': True, 'message': 'Login successful', 'username': username})
    else:
        locked = record_failed_attempt(ip)
        remaining = MAX_ATTEMPTS - LOGIN_ATTEMPTS.get(ip, {}).get('count', 0)
        if locked:
            return jsonify({'error': 'Account locked', 'message': f'Too many failed attempts. Account locked for {LOCKOUT_DURATION // 60} minutes.'}), 429
        return jsonify({'error': 'Invalid credentials', 'message': f'Username or password is incorrect. {remaining} attempts remaining.'}), 401

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    """Logout admin user."""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/admin/check', methods=['GET'])
def admin_check():
    """Check if user is authenticated."""
    if session.get('authenticated'):
        return jsonify({'authenticated': True, 'username': session.get('username')})
    return jsonify({'authenticated': False}), 401

# ─── Portfolio API Routes ───

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Get portfolio data (public)."""
    data = load_portfolio()
    return jsonify(data)

@app.route('/api/portfolio', methods=['PUT'])
@login_required
def update_portfolio():
    """Update portfolio data (admin only)."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request', 'message': 'No JSON body provided'}), 400
    
    current = load_portfolio()
    current.update(data)
    save_portfolio(current)
    return jsonify({'success': True, 'message': 'Portfolio updated successfully'})

@app.route('/api/portfolio/<section>', methods=['GET'])
def get_portfolio_section(section):
    """Get a specific section of portfolio data."""
    data = load_portfolio()
    if section in data:
        return jsonify(data[section])
    return jsonify({'error': 'Section not found'}), 404

@app.route('/api/portfolio/<section>', methods=['PUT'])
@login_required
def update_portfolio_section(section):
    """Update a specific section of portfolio data."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request', 'message': 'No JSON body provided'}), 400
    
    current = load_portfolio()
    current[section] = data
    save_portfolio(current)
    return jsonify({'success': True, 'message': f'Section "{section}" updated successfully'})

# ─── File Upload Routes ───

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    """Upload a file (image or PDF)."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = secure_filename(file.filename)
    file_type = request.form.get('type', 'image')  # 'image' or 'resume'
    
    if file_type == 'resume':
        if not allowed_file(filename, ALLOWED_PDF_EXTENSIONS):
            return jsonify({'error': 'Only PDF files are allowed for resume'}), 400
        save_path = UPLOAD_DIR / filename
    else:
        if not allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'error': 'Only image files are allowed'}), 400
        save_path = UPLOAD_DIR / filename
    
    file.save(str(save_path))
    
    # Return the relative URL path
    file_url = f'uploads/{filename}'
    return jsonify({
        'success': True,
        'message': 'File uploaded successfully',
        'url': file_url,
        'filename': filename
    })

# ─── Serve uploaded files ───

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files."""
    return send_from_directory(str(UPLOAD_DIR), filename)

# ─── Serve admin dashboard ───

ADMIN_DIR = Path(__file__).parent / 'admin'

@app.route('/admin')
@app.route('/admin/')
def admin_dashboard():
    """Serve the admin dashboard HTML."""
    admin_html = ADMIN_DIR / 'index.html'
    if admin_html.exists():
        return send_from_directory(str(ADMIN_DIR), 'index.html')
    return jsonify({'error': 'Admin dashboard not found'}), 404

@app.route('/admin.css')
def admin_css():
    """Serve admin CSS."""
    css_file = ADMIN_DIR / 'admin.css'
    if css_file.exists():
        return send_from_directory(str(ADMIN_DIR), 'admin.css', mimetype='text/css')
    return jsonify({'error': 'Not found'}), 404

@app.route('/admin.js')
def admin_js():
    """Serve admin JS."""
    js_file = ADMIN_DIR / 'admin.js'
    if js_file.exists():
        return send_from_directory(str(ADMIN_DIR), 'admin.js', mimetype='application/javascript')
    return jsonify({'error': 'Not found'}), 404

# ─── Serve static files from public directory ───

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from the public directory."""
    public_dir = BASE_DIR / 'public'
    file_path = public_dir / filename
    if file_path.exists() and file_path.is_file():
        return send_from_directory(str(public_dir), filename)
    # Fallback to root
    root_file = BASE_DIR / filename
    if root_file.exists() and root_file.is_file():
        return send_from_directory(str(BASE_DIR), filename)
    return jsonify({'error': 'File not found'}), 404

# ─── Health check ───

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'Portfolio Admin CMS'})

# ─── Serve Vite-built frontend ───
@app.route('/')
def serve_frontend():
    """Serve the portfolio frontend from dist/."""
    index_file = DIST_DIR / 'index.html'
    if index_file.exists():
        return send_from_directory(str(DIST_DIR), 'index.html')
    return jsonify({'error': 'Frontend not built. Run npm run build first.'}), 404

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve Vite-built assets."""
    if DIST_DIR.exists():
        return send_from_directory(str(DIST_DIR / 'assets'), filename)
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    print(f"Admin credentials: {ADMIN_USERNAME} / (from .env)")
    print(f"Portfolio JSON: {PORTFOLIO_JSON}")
    print(f"Upload directory: {UPLOAD_DIR}")
    debug_mode = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
