<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Retail Demand Forecasting & Inventory Optimization Workflow

This workflow document provides a comprehensive guide for implementing a retail demand forecasting and inventory optimization system using the `retail_store_inventory_cleaned.csv` dataset. The system integrates machine learning forecasting models with a Retrieval-Augmented Generation (RAG) pipeline to provide contextual insights.

## 1. Data Preparation & Understanding

### Dataset Overview: `retail_store_inventory_cleaned.csv`

Our primary dataset (`retail_store_inventory_cleaned.csv`) contains rich retail store inventory data with the following key features:

- **Time-based data**: Date column spanning from 2022-01-01 to 2023-12-04
- **Store and product identifiers**: Store ID, Product ID, Category, Region
- **Inventory metrics**: Inventory Level, Units Sold, Units Ordered, Demand Forecast
- **Pricing data**: Price, Discount, Competitor Pricing
- **External factors**: Weather Condition, Holiday/Promotion
- **Seasonality indicators**: Seasonality column plus binary indicators (Is_Spring, Is_Summer, etc.)
- **Derived features**: Units_Sold_Lag1, Units_Sold_Lag7, Units_Sold_MA7, Inventory_to_Sales

### Data Processing Steps

1. **Data Loading**:
   ```python
   import pandas as pd
   
   # Load the inventory dataset
   inventory_data = pd.read_csv('data/retail_store_inventory_cleaned.csv')
   
   # Display basic information
   print(inventory_data.info())
   print(inventory_data.describe())
   ```

2. **Exploratory Data Analysis**:
   - Analyze time-series patterns by Store ID, Product ID, and Category
   - Examine seasonality patterns using the provided seasonal indicators
   - Study the relationship between weather conditions and sales
   - Evaluate the impact of promotions on demand

3. **Data Enhancement**:
   - Integrate with external weather API for forecast data
   - Pull social media sentiment data for products when available
   - Collect news events that might impact supply chain

## 2. Forecasting Model Development

### Time Series Forecasting

1. **Prophet Model Implementation**:
   ```python
   from prophet import Prophet
   
   def train_prophet_model(df, product_id, store_id):
       # Filter data for specific product and store
       product_data = df[(df['Product ID'] == product_id) & (df['Store ID'] == store_id)]
       
       # Prepare data for Prophet (requires 'ds' and 'y' columns)
       prophet_data = product_data[['Date', 'Units Sold']].rename(columns={'Date': 'ds', 'Units Sold': 'y'})
       
       # Add additional regressors
       for regressor in ['Price', 'Discount', 'Holiday/Promotion', 'Is_Summer', 'Is_Winter']:
           if regressor in product_data.columns:
               prophet_data[regressor] = product_data[regressor]
       
       # Initialize and train model
       model = Prophet()
       
       # Add regressors
       for regressor in ['Price', 'Discount', 'Holiday/Promotion', 'Is_Summer', 'Is_Winter']:
           if regressor in prophet_data.columns:
               model.add_regressor(regressor)
       
       model.fit(prophet_data)
       return model
   ```

2. **LSTM Model for Complex Patterns**:
   ```python
   from tensorflow.keras.models import Sequential
   from tensorflow.keras.layers import LSTM, Dense, Dropout
   
   def create_lstm_model(df, product_id, store_id, lookback=30):
       # Filter and prepare data
       product_data = df[(df['Product ID'] == product_id) & (df['Store ID'] == store_id)]
       
       # Feature selection and scaling
       features = ['Units Sold', 'Price', 'Discount', 'Inventory Level', 
                  'Weather Condition', 'Holiday/Promotion', 'Units_Sold_Lag7']
       
       # Create sequences
       X, y = create_sequences(product_data, features, lookback)
       
       # Build LSTM model
       model = Sequential([
           LSTM(50, return_sequences=True, input_shape=(lookback, len(features))),
           Dropout(0.2),
           LSTM(50),
           Dropout(0.2),
           Dense(1)
       ])
       
       model.compile(optimizer='adam', loss='mse')
       return model, X, y
   ```

3. **Ensemble Approach**:
   - Combine Prophet (for capturing seasonality) with LSTM (for complex patterns)
   - Weight models based on recent performance

### Feature Importance Analysis

Implement SHAP (SHapley Additive exPlanations) to understand which features most impact the forecasts:

```python
import shap

def analyze_feature_importance(model, X):
    explainer = shap.Explainer(model)
    shap_values = explainer(X)
    
    # Plot feature importance
    shap.summary_plot(shap_values, X)
    
    return shap_values
```

## 3. Inventory Optimization

### Reorder Point Calculation

Use forecasted demand to determine optimal reorder points:

```python
def calculate_reorder_point(forecast, lead_time, safety_stock_factor=1.5):
    """
    Calculate reorder point based on forecasted demand
    
    Parameters:
    - forecast: Array of daily demand forecasts
    - lead_time: Number of days it takes to restock
    - safety_stock_factor: Multiplier for safety stock
    
    Returns:
    - reorder_point: The inventory level at which to place an order
    """
    # Calculate average daily demand during lead time
    avg_daily_demand = forecast[:lead_time].mean()
    
    # Calculate standard deviation of demand during lead time
    std_demand = forecast[:lead_time].std()
    
    # Calculate safety stock
    safety_stock = safety_stock_factor * std_demand * (lead_time ** 0.5)
    
    # Calculate reorder point
    reorder_point = (avg_daily_demand * lead_time) + safety_stock
    
    return reorder_point
```

### Economic Order Quantity (EOQ)

Calculate the optimal order quantity to minimize total inventory costs:

```python
def calculate_eoq(annual_demand, ordering_cost, holding_cost_percentage, unit_cost):
    """
    Calculate Economic Order Quantity
    
    Parameters:
    - annual_demand: Annual demand quantity
    - ordering_cost: Cost per order
    - holding_cost_percentage: Annual holding cost as percentage of unit cost
    - unit_cost: Cost per unit
    
    Returns:
    - eoq: Economic Order Quantity
    """
    holding_cost = holding_cost_percentage * unit_cost
    eoq = (2 * annual_demand * ordering_cost / holding_cost) ** 0.5
    
    return eoq
```

## 4. RAG Pipeline for Contextual Insights

Implement a Retrieval-Augmented Generation pipeline to provide contextual insights about inventory decisions:

### Document Processing

1. **Create Knowledge Base**:
   ```python
   from llama_index import SimpleDirectoryReader, GPTVectorStoreIndex
   from llama_index import StorageContext, load_index_from_storage
   import os
   
   # Process documents to build knowledge base
   def build_knowledge_base(documents_path, persist_dir="./storage"):
       if not os.path.exists(persist_dir):
           # Load documents
           documents = SimpleDirectoryReader(documents_path).load_data()
           
           # Create index
           index = GPTVectorStoreIndex.from_documents(documents)
           
           # Persist index
           index.storage_context.persist(persist_dir=persist_dir)
           
           return index
       else:
           # Load from disk
           storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
           index = load_index_from_storage(storage_context)
           
           return index
   ```

2. **Integrate with ChromaDB**:
   ```python
   from llama_index.vector_stores import ChromaVectorStore
   from llama_index import StorageContext
   import chromadb
   
   # Set up ChromaDB
   chroma_client = chromadb.PersistentClient(path="./chroma_db")
   chroma_collection = chroma_client.create_collection("retail_knowledge")
   
   # Create vector store
   vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
   storage_context = StorageContext.from_defaults(vector_store=vector_store)
   ```

### Query Engine

Create a query engine for answering inventory-related questions:

```python
from llama_index.query_engine import RetrieverQueryEngine

def create_query_engine(index):
    retriever = index.as_retriever(similarity_top_k=3)
    return RetrieverQueryEngine(retriever=retriever)

def get_inventory_insights(query_engine, question, inventory_context):
    """
    Get AI-powered insights about inventory decisions
    
    Parameters:
    - query_engine: The RAG query engine
    - question: Question about inventory
    - inventory_context: Current inventory metrics
    
    Returns:
    - response: AI response with inventory insights
    """
    # Enhance question with inventory context
    enhanced_question = f"{question}\n\nCurrent context: {inventory_context}"
    
    # Query the engine
    response = query_engine.query(enhanced_question)
    
    return response
```

## 5. Application Integration

### Backend API with FastAPI

Implement a FastAPI backend to serve the forecasting model and RAG pipeline:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import json

app = FastAPI()

class ForecastRequest(BaseModel):
    product_id: str
    store_id: str
    forecast_days: int = 30

@app.post("/api/forecast")
async def get_forecast(request: ForecastRequest):
    try:
        # Load data for the specific product and store
        df = pd.read_csv('data/retail_store_inventory_cleaned.csv')
        product_data = df[(df['Product ID'] == request.product_id) & 
                         (df['Store ID'] == request.store_id)]
        
        if len(product_data) == 0:
            raise HTTPException(status_code=404, detail="Product or store not found")
        
        # Generate forecast
        model = train_prophet_model(df, request.product_id, request.store_id)
        future = model.make_future_dataframe(periods=request.forecast_days)
        forecast = model.predict(future)
        
        # Calculate inventory recommendations
        latest_inventory = product_data['Inventory Level'].iloc[-1]
        average_daily_demand = forecast['yhat'].tail(request.forecast_days).mean()
        lead_time = 7  # Example lead time in days
        reorder_point = calculate_reorder_point(
            forecast['yhat'].tail(request.forecast_days).values, 
            lead_time
        )
        
        # Prepare response
        response = {
            "forecast": forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(request.forecast_days).to_dict('records'),
            "current_inventory": float(latest_inventory),
            "average_daily_demand": float(average_daily_demand),
            "reorder_point": float(reorder_point),
            "days_until_stockout": float(latest_inventory / average_daily_demand) if average_daily_demand > 0 else float('inf')
        }
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Frontend with Next.js

Create interactive dashboards using Next.js and Recharts:

1. **Forecast Page** (`pages/forecast.js`):
   - Time series charts of historical data and forecasts
   - Confidence intervals for predictions
   - Filter controls for product, store, and time range

2. **Inventory Page** (`pages/inventory.js`):
   - Current inventory levels vs. reorder points
   - Stockout risk indicators
   - Recommended order quantities
   - Inventory health metrics

3. **Analytics Page** (`pages/analytics.js`):
   - Feature importance visualizations
   - Seasonal patterns analysis
   - Demand drivers analysis (price, weather, promotions)

## 6. Deployment Strategy

1. **Development Environment**:
   - Local setup with Docker containers
   - Jupyter notebooks for model experimentation

2. **Testing Environment**:
   - CI/CD pipeline with automated tests
   - Model validation with historical data

3. **Production Deployment**:
   - Containerized application with Docker
   - Model versioning and tracking
   - Scheduled retraining of models

## 7. Monitoring and Maintenance

1. **Model Performance Monitoring**:
   - Track forecast accuracy metrics (MAPE, MAE, RMSE)
   - Compare predicted vs. actual demand
   - Alert on significant deviations

2. **System Health Monitoring**:
   - API response times
   - Database performance
   - Memory and CPU usage

3. **Periodic Model Retraining**:
   - Weekly retraining schedule
   - Performance evaluation before deploying new models
   - A/B testing of model versions

## Conclusion

This workflow provides a comprehensive guide to implementing a retail demand forecasting and inventory optimization system using the `retail_store_inventory_cleaned.csv` dataset. By following these steps, you'll build a system that not only predicts future demand but also provides actionable inventory insights augmented by a RAG pipeline.

<div>⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/48848160/af6fb542-b5cc-46a7-a4c8-656f38c9923b/Steps-to-Setup-Demand-ML-Solution-Automated-version-1.pdf

