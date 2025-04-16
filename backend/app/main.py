from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict
import json
from .rag_pipeline import RetailRAGPipeline
from .models.forecasting import ProphetForecaster
from .models.inventory import InventoryOptimizer

app = FastAPI(title="Retail Demand Forecasting API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
rag_pipeline = None
forecaster = None
inventory_optimizer = None

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload and process retail data"""
    try:
        df = pd.read_csv(file.file)
        # Save the data
        df.to_csv("data/retail_data.csv", index=False)
        return {"message": "Data uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/initialize-pipeline")
async def initialize_pipeline():
    """Initialize the RAG pipeline and forecasting models"""
    global rag_pipeline, forecaster, inventory_optimizer
    try:
        rag_pipeline = RetailRAGPipeline("data/retail_data.csv")
        rag_pipeline.initialize_pipeline()
        
        forecaster = ProphetForecaster("data/retail_data.csv")
        inventory_optimizer = InventoryOptimizer(forecaster)
        
        return {"message": "Pipeline initialized successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/query")
async def query_rag(question: str):
    """Query the RAG pipeline"""
    if not rag_pipeline:
        return {"error": "Pipeline not initialized"}
    try:
        response = rag_pipeline.query(question)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/forecast")
async def get_forecast():
    """Get demand forecasts"""
    if not forecaster:
        return {"error": "Forecaster not initialized"}
    try:
        forecast = forecaster.predict()
        return {"forecast": forecast.to_dict()}
    except Exception as e:
        return {"error": str(e)}

@app.get("/inventory-recommendations")
async def get_inventory_recommendations():
    """Get inventory optimization recommendations"""
    if not inventory_optimizer:
        return {"error": "Inventory optimizer not initialized"}
    try:
        recommendations = inventory_optimizer.get_recommendations()
        return {"recommendations": recommendations}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 