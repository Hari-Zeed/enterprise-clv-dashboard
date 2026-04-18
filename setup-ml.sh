#!/bin/bash
set -e

echo "Setting up Python Machine Learning Environment..."

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "python3 could not be found. Please install python3."
    exit 1
fi

# Initialize virtual environment in project root
python3 -m venv .venv
echo "Virtual environment created at ./.venv"

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip
python3 -m pip install --upgrade pip

# Install requirements
if [ -f "requirements.txt" ]; then
    echo "Installing required modules from requirements.txt..."
    pip install -r requirements.txt
else
    echo "Installing required modules directly..."
    pip install numpy pandas scikit-learn xgboost joblib
fi

# Ensure storage directories exist
mkdir -p storage/models
mkdir -p storage/datasets

echo "ML Environment setup complete ✅"
echo "You can now run Node processes out of this project and ml.service.ts will route to .venv/bin/python."
