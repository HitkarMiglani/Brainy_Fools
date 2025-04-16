import pandas as pd
from prophet import Prophet
import numpy as np
from typing import Dict, Any

class ProphetForecaster:
    def __init__(self, data_path: str):
        """
        Initialize the Prophet forecaster.
        
        Args:
            data_path (str): Path to the retail data CSV file
        """
        self.data_path = data_path
        self.model = None
        self.data = None
        
    def load_and_preprocess_data(self):
        """Load and preprocess the retail data for forecasting"""
        df = pd.read_csv(self.data_path)
        
        # Convert date column to datetime if it exists
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
        
        # Aggregate sales by date
        daily_sales = df.groupby('date')['sales'].sum().reset_index()
        daily_sales.columns = ['ds', 'y']
        
        self.data = daily_sales
        return daily_sales
    
    def train(self):
        """Train the Prophet model"""
        if self.data is None:
            self.load_and_preprocess_data()
            
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True
        )
        
        self.model.fit(self.data)
    
    def predict(self, periods: int = 30) -> pd.DataFrame:
        """
        Generate forecasts for the specified number of periods
        
        Args:
            periods (int): Number of days to forecast
            
        Returns:
            pd.DataFrame: Forecast results
        """
        if self.model is None:
            self.train()
            
        future = self.model.make_future_dataframe(periods=periods)
        forecast = self.model.predict(future)
        
        return forecast
    
    def get_forecast_components(self) -> Dict[str, Any]:
        """
        Get the components of the forecast (trend, seasonality, etc.)
        
        Returns:
            Dict[str, Any]: Forecast components
        """
        if self.model is None:
            self.train()
            
        forecast = self.predict()
        
        components = {
            'trend': forecast[['ds', 'trend']].to_dict('records'),
            'weekly': forecast[['ds', 'weekly']].to_dict('records'),
            'yearly': forecast[['ds', 'yearly']].to_dict('records'),
            'yhat': forecast[['ds', 'yhat']].to_dict('records'),
            'yhat_lower': forecast[['ds', 'yhat_lower']].to_dict('records'),
            'yhat_upper': forecast[['ds', 'yhat_upper']].to_dict('records')
        }
        
        return components 