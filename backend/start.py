"""
Portfolio Admin CMS - Startup Script
Run this to start the Flask backend server.
"""
import subprocess
import sys
import os

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    app_path = os.path.join(backend_dir, 'app.py')
    
    print("=" * 60)
    print("  Portfolio Admin CMS")
    print("=" * 60)
    print()
    print("  Starting Flask backend on http://localhost:5000")
    print()
    print("  URLs:")
    print("    Portfolio:  http://localhost:5000")
    print("    Admin:      http://localhost:5000/admin")
    print("    API:        http://localhost:5000/api/portfolio")
    print("    Health:     http://localhost:5000/health")
    print()
    print("  Login Credentials:")
    print("    Username: admin")
    print("    Password: Vamshi@2024")
    print()
    print("=" * 60)
    
    # Run Flask app
    os.chdir(backend_dir)
    os.execvp(sys.executable, [sys.executable, app_path])

if __name__ == '__main__':
    main()