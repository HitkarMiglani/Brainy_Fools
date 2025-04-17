from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
import logging
from rag_pipeline import RetailRAGPipeline
from utils.api_integrations import ExternalDataAnalyzer, TwitterAPI, WeatherAPI
from models.forecasting import ProphetForecaster, LSTMForecaster, EnsembleForecaster
from models.inventory import InventoryOptimizer

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"  # Disable oneDNN optimizations for TensorFlow

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Retail Demand Forecasting API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
DATA_PATH = "data/store_S004_inventory.csv"
CHROMA_DB_PATH = "./chroma_db"

# Initialize API components
twitter_api = TwitterAPI()
weather_api = WeatherAPI()
external_analyzer = ExternalDataAnalyzer()

# Initialize core components (will be properly initialized in startup event)
rag_pipeline = RetailRAGPipeline(DATA_PATH)

forecaster = None
lstm_forecaster = None
ensemble_forecaster = None
inventory_optimizer = None

# Model definitions
class ForecastRequest(BaseModel):
    product_id: str
    store_id: str
    forecast_days: int = 30
    forecast_type: str = "ensemble"  # Options: "prophet", "lstm", "ensemble"

class InventoryRequest(BaseModel):
    product_id: Optional[str] = None
    store_id: Optional[str] = None
    forecast_days: int = 30
    
class RAGQueryRequest(BaseModel):
    question: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = "New York"

class Settings(BaseModel):
    lead_time: int = 7
    safety_stock_factor: float = 1.5
    forecast_days: int = 30
    ordering_cost: float = 25.0
    holding_cost_percentage: float = 0.25
    prophet_weight: float = 0.6
    notification_email: Optional[str] = None

# Helper to load data
def load_retail_data():
    """Load the retail inventory data"""
    try:
        df = pd.read_csv(DATA_PATH)
        logger.info(f"Loaded retail data with shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error loading retail data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    global rag_pipeline, forecaster, lstm_forecaster, ensemble_forecaster, inventory_optimizer
    
    try:
        logger.info("Initializing RAG pipeline...")
        rag_pipeline = RetailRAGPipeline(DATA_PATH)
        rag_pipeline.initialize_pipeline()
        
        logger.info("Initializing forecasting models...")
        forecaster = ProphetForecaster(DATA_PATH)
        lstm_forecaster = LSTMForecaster(DATA_PATH, lookback=30)
        ensemble_forecaster = EnsembleForecaster(DATA_PATH, lookback=30)
        
        logger.info("Initializing inventory optimizer...")
        inventory_optimizer = InventoryOptimizer(ensemble_forecaster)
        
        logger.info("Startup initialization complete")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

# Routes
@app.get("/")
async def root():
    return {"message": "Retail Demand Forecasting API", "version": "1.0.0"}

@app.post("/api/forecast")
async def get_forecast(request: ForecastRequest):
    """
    Generate demand forecasts for a specific product and store
    """
    try:
        logger.info(f"Generating forecast for Product ID: {request.product_id}, Store ID: {request.store_id}")
        
        if request.forecast_type.lower() == "prophet":
            if not forecaster:
                raise HTTPException(status_code=500, detail="Prophet forecaster not initialized")
            
            # Train on the specific product/store
            forecaster.train(product_id=request.product_id, store_id=request.store_id)
            
            # Generate forecast
            forecast = forecaster.predict(periods=request.forecast_days)
            
            # Prepare response
            response = {
                "forecast": forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records'),
                "model_type": "prophet"
            }
            
        elif request.forecast_type.lower() == "lstm":
            if not lstm_forecaster:
                raise HTTPException(status_code=500, detail="LSTM forecaster not initialized")
            
            # Train on the specific product/store
            lstm_forecaster.train(product_id=request.product_id, store_id=request.store_id)
            
            # Generate forecast
            lstm_values = lstm_forecaster.predict(periods=request.forecast_days)
            
            # Create date range for forecast
            start_date = datetime.now()
            dates = pd.date_range(start=start_date, periods=request.forecast_days, freq='D')
            
            # Create forecast dataframe
            forecast_df = pd.DataFrame({
                'ds': dates,
                'lstm_forecast': lstm_values
            })
            
            # Prepare response
            response = {
                "forecast": forecast_df.to_dict('records'),
                "model_type": "lstm"
            }
            
        else:  # Use ensemble by default
            if not ensemble_forecaster:
                raise HTTPException(status_code=500, detail="Ensemble forecaster not initialized")
            
            # Train on the specific product/store
            ensemble_forecaster.train(product_id=request.product_id, store_id=request.store_id)
            
            # Generate forecast
            ensemble_forecast = ensemble_forecaster.predict(periods=request.forecast_days)
            
            # Prepare response
            response = {
                "forecast": ensemble_forecast.to_dict('records'),
                "model_type": "ensemble"
            }
        
        return response
    
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/recommendations")
async def get_inventory_recommendations(request: InventoryRequest):
    """
    Get inventory optimization recommendations for a specific product and store
    """
    try:
        if not inventory_optimizer:
            raise HTTPException(status_code=500, detail="Inventory optimizer not initialized")
        
        logger.info(f"Generating inventory recommendations for Product ID: {request.product_id}, Store ID: {request.store_id}")
        
        # Get recommendations
        recommendations = inventory_optimizer.get_recommendations(
            product_id=request.product_id,
            store_id=request.store_id,
            forecast_days=request.forecast_days
        )
        
        return {"recommendations": recommendations}
    
    except Exception as e:
        logger.error(f"Error generating inventory recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/health")
async def get_inventory_health(request: InventoryRequest):
    """
    Get overall inventory health metrics
    """
    try:
        if not inventory_optimizer:
            raise HTTPException(status_code=500, detail="Inventory optimizer not initialized")
        
        logger.info("Generating inventory health metrics")
        
        # Get health metrics
        health_metrics = inventory_optimizer.get_inventory_health(
            product_id=request.product_id,
            store_id=request.store_id,
            forecast_days=request.forecast_days
        )
        
        return {"inventory_health": health_metrics}
    
    except Exception as e:
        logger.error(f"Error generating inventory health metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/query")
async def query_rag_pipeline(request: RAGQueryRequest):
    """
    Query the RAG pipeline for contextual insights
    """
    try:
        if not rag_pipeline:
            raise HTTPException(status_code=500, detail="RAG pipeline not initialized")
        
        logger.info(f"Querying RAG pipeline: {request.question}")
        
        # Get response from RAG pipeline
        response = rag_pipeline.query(
            question=request.question,
            product_name=request.product_name,
            category=request.category,
            city=request.city
        )
        
        return {"response": response}
    
    except Exception as e:
        logger.error(f"Error querying RAG pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products")
async def get_products():
    """
    Get list of products from the inventory data
    """
    try:
        df = load_retail_data()
        
        # Extract unique products with key information
        products = df[['Product ID', 'Name', 'Category']].drop_duplicates()
        
        return {"products": products.to_dict('records')}
    
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stores")
async def get_stores():
    """
    Get list of stores from the inventory data
    """
    try:
        df = load_retail_data()
        
        # Extract unique stores with region information
        stores = df[['Store ID', 'Region']].drop_duplicates()
        
        return {"stores": stores.to_dict('records')}
    
    except Exception as e:
        logger.error(f"Error retrieving stores: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def get_categories():
    """
    Get list of product categories from the inventory data
    """
    try:
        df = load_retail_data()
        
        # Extract unique categories
        categories = df['Category'].unique().tolist()
        
        return {"categories": categories}
    
    except Exception as e:
        logger.error(f"Error retrieving categories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/sales")
async def get_sales_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_id: Optional[str] = None,
    store_id: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Get sales analytics data filtered by various parameters
    """
    try:
        df = load_retail_data()
        
        # Apply filters
        if product_id:
            df = df[df['Product ID'] == product_id]
        
        if store_id:
            df = df[df['Store ID'] == store_id]
        
        if category:
            df = df[df['Category'] == category]
        
        if start_date:
            start_date = pd.to_datetime(start_date)
            df = df[df['Date'] >= start_date]
        
        if end_date:
            end_date = pd.to_datetime(end_date)
            df = df[df['Date'] <= end_date]
        
        # Group by date and calculate total sales
        if not df.empty:
            sales_data = df.groupby('Date')['Units Sold'].sum().reset_index()
            sales_data['Date'] = sales_data['Date'].dt.strftime('%Y-%m-%d')
            
            # Calculate revenue
            price_data = df.groupby('Date')['Price'].mean().reset_index()
            sales_data['Revenue'] = sales_data['Units Sold'] * price_data['Price']
            
            return {"sales": sales_data.to_dict('records')}
        else:
            return {"sales": []}
    
    except Exception as e:
        logger.error(f"Error retrieving sales analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/inventory")
async def get_inventory_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_id: Optional[str] = None,
    store_id: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Get inventory analytics data filtered by various parameters
    """
    try:
        df = load_retail_data()
        
        # Apply filters
        if product_id:
            df = df[df['Product ID'] == product_id]
        
        if store_id:
            df = df[df['Store ID'] == store_id]
        
        if category:
            df = df[df['Category'] == category]
        
        if start_date:
            start_date = pd.to_datetime(start_date)
            df = df[df['Date'] >= start_date]
        
        if end_date:
            end_date = pd.to_datetime(end_date)
            df = df[df['Date'] <= end_date]
        
        # Group by date and calculate average inventory
        if not df.empty:
            inventory_data = df.groupby('Date')['Inventory Level'].mean().reset_index()
            inventory_data['Date'] = inventory_data['Date'].dt.strftime('%Y-%m-%d')
            
            # Calculate inventory turn rate
            sales_data = df.groupby('Date')['Units Sold'].sum().reset_index()
            inventory_data['Inventory Turn Rate'] = sales_data['Units Sold'] / inventory_data['Inventory Level']
            
            return {"inventory": inventory_data.to_dict('records')}
        else:
            return {"inventory": []}
    
    except Exception as e:
        logger.error(f"Error retrieving inventory analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/feature-importance")
async def get_feature_importance(product_id: str, store_id: str):
    """
    Get feature importance analysis for forecasting
    """
    try:
        if not forecaster:
            raise HTTPException(status_code=500, detail="Forecaster not initialized")
        
        # This is a placeholder for real SHAP analysis
        # In a real implementation, you would:
        # 1. Train the model
        # 2. Run SHAP analysis
        # 3. Return the SHAP values
        
        features = [
            {'feature': 'Price', 'importance': 0.35},
            {'feature': 'Discount', 'importance': 0.25},
            {'feature': 'Weather Condition', 'importance': 0.15},
            {'feature': 'Holiday/Promotion', 'importance': 0.20},
            {'feature': 'Is_Summer', 'importance': 0.05}
        ]
        
        return {"feature_importance": features}
    
    except Exception as e:
        logger.error(f"Error retrieving feature importance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
async def get_settings():
    """
    Get current system settings
    """
    try:
        settings = {
            "lead_time": 7,
            "safety_stock_factor": 1.5,
            "forecast_days": 30,
            "ordering_cost": 25.0,
            "holding_cost_percentage": 0.25,
            "prophet_weight": 0.6,
            "notification_email": None
        }
        
        return {"settings": settings}
    
    except Exception as e:
        logger.error(f"Error retrieving settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings")
async def update_settings(settings: Settings):
    """
    Update system settings
    """
    try:
        # In a real implementation, you would save these settings
        # to a database or configuration file
        
        # Update inventory optimizer settings
        if inventory_optimizer:
            inventory_optimizer.lead_time = settings.lead_time
            inventory_optimizer.safety_stock_factor = settings.safety_stock_factor
        
        return {"message": "Settings updated successfully"}
    
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/external/weather")
async def get_weather(city: str = "New York"):
    """
    Get weather data for a specific city
    """
    try:
        weather_data = weather_api.get_weather(city)
        return {"weather": weather_data}
    
    except Exception as e:
        logger.error(f"Error retrieving weather data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/external/social-trends")
async def get_social_trends(product: str):
    """
    Get social media trends for a specific product
    """
    try:
        trends = twitter_api.get_product_trends(product)
        return {"trends": trends}
    
    except Exception as e:
        logger.error(f"Error retrieving social trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)