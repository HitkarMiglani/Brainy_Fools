#!/usr/bin/env python3

import os
import subprocess
import sys
import time

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        print("Checking dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("All dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("Failed to install required dependencies")
        return False

def run_application():
    """Run the FastAPI application using uvicorn"""
    try:
        os.chdir("app")
        print("Starting the retail demand forecasting application...")
        print("The server will be available at http://localhost:8000")
        subprocess.call([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("\nShutting down the server...")
    except Exception as e:
        print(f"Error starting server: {str(e)}")
    finally:
        os.chdir("..")

if __name__ == "__main__":
    # Go to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Check and install dependencies
    if check_dependencies():
        # Run the application
        run_application()
    else:
        print("Please install the required dependencies and try again.")