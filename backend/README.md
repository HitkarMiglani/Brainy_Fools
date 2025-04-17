# Brainy Fools Backend

This is the backend service for the Brainy Fools retail analytics platform. It provides APIs for forecasting, inventory management, and data analysis using a RAG (Retrieval-Augmented Generation) pipeline.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Server

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`

## API Endpoints

### Forecasting
- `GET /forecast`: Get sales forecasts
- `GET /inventory-recommendations`: Get inventory recommendations
- `GET /products`: List available products
- `GET /categories`: List product categories

### Analytics
- `GET /analytics/sales`: Get sales analytics
- `GET /analytics/categories`: Get category performance data

### Settings
- `GET /settings`: Get current settings
- `POST /settings`: Update settings

### Data Management
- `GET /upload-data`: List uploaded data items

## RAG Pipeline

The backend uses a RAG pipeline for intelligent data analysis and recommendations. The pipeline:
1. Processes retail data from CSV files
2. Creates embeddings using OpenAI's API
3. Stores vectors in a FAISS index
4. Provides semantic search and question-answering capabilities

## Data Format

The system expects CSV files with the following columns:
- product_name
- category
- current_stock
- price
- historical_sales
- reorder_point 