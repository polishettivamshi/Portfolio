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
    print("  Starting Flask backend on http://localhost:5000")
    print()
    print("=" * 60)
    
    # Run Flask app
    os.chdir(backend_dir)
    os.execvp(sys.executable, [sys.executable, app_path])

if __name__ == '__main__':
    main()