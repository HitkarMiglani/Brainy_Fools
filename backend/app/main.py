from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from .rag_pipeline import RetailRAGPipeline
from .utils.api_integrations import ExternalDataAnalyzer
from models.forecasting import ProphetForecaster
from models.inventory import InventoryOptimizer

app = FastAPI(title="Retail Demand Forecasting API")

twitter_api = TwitterAPI()
weather_api = WeatherAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
rag_pipeline = RetailRAGPipeline("data/retail_data.csv")
external_analyzer = ExternalDataAnalyzer()
forecaster = None
inventory_optimizer = None

# Load sample data
def load_sample_data():
    return pd.read_csv("data/retail_data.csv")

# Models
class ForecastRequest(BaseModel):
    product: Optional[str] = None
    range: str = "7d"

class Settings(BaseModel):
    forecastInterval: str
    reorderThreshold: int
    notificationEmail: str
    dataRefreshInterval: int
    apiKey: str
    weatherApiKey: str
    socialMediaApiKey: str

# Endpoints
@app.get("/")
async def root():
    return {"message": "Retail Demand Forecasting API"}

@app.get("/forecast")
async def get_forecast(product: Optional[str] = None, range: str = "7d"):
    try:
        # Generate sample forecast data
        dates = pd.date_range(start=datetime.now(), periods=7, freq='D')
        forecast_data = []
        for date in dates:
            forecast_data.append({
                "ds": date.strftime("%Y-%m-%d"),
                "yhat": np.random.randint(100, 200),
                "yhat_lower": np.random.randint(80, 150),
                "yhat_upper": np.random.randint(150, 250)
            })
        return {"forecast": forecast_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory-recommendations")
async def get_inventory_recommendations(category: Optional[str] = None):
    try:
        df = load_sample_data()
        if category and category != "all":
            df = df[df['category'] == category]
        
        recommendations = []
        for _, row in df.iterrows():
            status = "In Stock"
            if row['current_stock'] < row['reorder_point']:
                status = "Reorder needed"
            elif row['current_stock'] == 0:
                status = "Out of Stock"
                
            recommendations.append({
                "product_id": row['product_id'],
                "product_name": row['product_name'],
                "category": row['category'],
                "current_stock": row['current_stock'],
                "reorder_point": row['reorder_point'],
                "status": status
            })
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
async def get_products():
    try:
        df = load_sample_data()
        products = [{"id": row['product_id'], "name": row['product_name']} for _, row in df.iterrows()]
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories")
async def get_categories():
    try:
        df = load_sample_data()
        categories = [{"id": cat, "name": cat} for cat in df['category'].unique()]
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/sales")
async def get_sales_analytics(range: str = "30d", metric: str = "revenue"):
    try:
        # Generate sample sales data
        dates = pd.date_range(start=datetime.now() - timedelta(days=30), periods=30, freq='D')
        sales_data = []
        for date in dates:
            sales_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": np.random.randint(1000, 5000)
            })
        return {"sales": sales_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/categories")
async def get_category_analytics(range: str = "30d"):
    try:
        df = load_sample_data()
        category_data = []
        for category in df['category'].unique():
            category_data.append({
                "category": category,
                "value": np.random.randint(1000, 5000)
            })
        return {"categories": category_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings")
async def get_settings():
    try:
        # Load settings from file or database
        settings = {
            "forecastInterval": "daily",
            "reorderThreshold": 20,
            "notificationEmail": "",
            "dataRefreshInterval": 5,
            "apiKey": "",
            "weatherApiKey": "",
            "socialMediaApiKey": ""
        }
        return {"settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/settings")
async def update_settings(settings: Settings):
    try:
        # Save settings to file or database
        return {"message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/upload-data")
async def get_upload_data():
    try:
        df = load_sample_data()
        items = []
        for _, row in df.iterrows():
            items.append({
                "product_id": row['product_id'],
                "product_name": row['product_name'],
                "category": row['category'],
                "current_stock": row['current_stock'],
                "price": row['price'],
                "historical_sales": row['historical_sales']
            })
        return {"item": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/initialize-pipeline")
async def initialize_pipeline():
    """Initialize the RAG pipeline and forecasting models"""
    global rag_pipeline, forecaster, inventory_optimizer
    try:
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

@app.get("/trending-topics")
async def get_trending_topics(woeid: int = 1):
    """Get trending topics from Twitter for a specific location"""
    try:
        trends = twitter_api.get_trending_topics(woeid)
        return {"trends": trends}
    except Exception as e:
        return {"error": str(e)}

@app.get("/weather")
async def get_weather(city: str, country_code: str = None):
    """Get weather data for a specific city"""
    try:
        weather_data = weather_api.get_weather(city, country_code)
        return {"weather": weather_data}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 