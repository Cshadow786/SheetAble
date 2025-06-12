# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    poppler-utils \
    abcm2ps \
    inkscape \
    build-essential \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libglib2.0-0 \
    jq \
    fonts-dejavu \
    ghostscript && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir flask pdf2image

# Copy application files
COPY . .

# Set environment variable for Flask
ENV FLASK_APP=app.py

# Expose Flask's default port
EXPOSE 5000

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]
