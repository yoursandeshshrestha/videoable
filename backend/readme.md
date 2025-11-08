# Create virtual environment

python3 -m venv venv

# Install dependencies

pip install -r requirements.txt

# Run the server

python -m uvicorn app.main:app --reload
