import pandas as pd
import numpy as np
from prophet import Prophet
from typing import Dict, Any, List, Tuple, Optional
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
    def load_and_preprocess_data(self, product_id: Optional[str] = None, store_id: Optional[str] = None):
        """
        Load and preprocess the retail data for forecasting
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
        """
        logger.info(f"Loading data from {self.data_path}")
        df = pd.read_csv(self.data_path)
        
        # Convert Date column to datetime
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Filter data if product_id and store_id are provided
        if product_id and store_id:
            logger.info(f"Filtering data for Product ID: {product_id}, Store ID: {store_id}")
            df = df[(df['Product ID'] == product_id) & (df['Store ID'] == store_id)]
            
            if df.empty:
                logger.warning(f"No data found for Product ID: {product_id}, Store ID: {store_id}")
                return None
        
        # Prepare data for Prophet (requires 'ds' and 'y' columns)
        prophet_data = df[['Date', 'Units Sold']].rename(columns={'Date': 'ds', 'Units Sold': 'y'})
        
        # Add additional regressors
        regressors = ['Price', 'Discount', 'Holiday/Promotion', 'Is_Summer', 'Is_Winter']
        for regressor in regressors:
            if regressor in df.columns:
                prophet_data[regressor] = df[regressor]
        
        self.data = prophet_data
        logger.info(f"Data loaded successfully. Shape: {prophet_data.shape}")
        return prophet_data
    
    def train(self, product_id: Optional[str] = None, store_id: Optional[str] = None):
        """
        Train the Prophet model
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
        """
        if self.data is None:
            self.data = self.load_and_preprocess_data(product_id, store_id)
            
        if self.data is None or self.data.empty:
            logger.error("No data available for training")
            return None
            
        logger.info("Training Prophet model")
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        
        # Add regressors
        for column in self.data.columns:
            if column not in ['ds', 'y']:
                self.model.add_regressor(column)
        
        self.model.fit(self.data)
        logger.info("Prophet model trained successfully")
        return self.model
    
    def predict(self, periods: int = 30) -> pd.DataFrame:
        """
        Generate forecasts for the specified number of periods
        
        Args:
            periods (int): Number of days to forecast
            
        Returns:
            pd.DataFrame: Forecast results
        """
        if self.model is None:
            logger.warning("Model not trained. Training now.")
            self.train()
            
        logger.info(f"Generating forecast for {periods} periods")
        future = self.model.make_future_dataframe(periods=periods)
        
        # Add regressor values for future dates
        for column in self.data.columns:
            if column not in ['ds', 'y']:
                if column in future.columns:
                    # Use mean of historical values for future dates
                    future.loc[future['ds'] > self.data['ds'].max(), column] = self.data[column].mean()
        
        forecast = self.model.predict(future)
        logger.info("Forecast generated successfully")
        
        return forecast
    
    def get_forecast_components(self) -> Dict[str, Any]:
        """
        Get the components of the forecast (trend, seasonality, etc.)
        
        Returns:
            Dict[str, Any]: Forecast components
        """
        if self.model is None:
            logger.warning("Model not trained. Training now.")
            self.train()
            
        forecast = self.predict()
        
        components = {
            'trend': forecast[['ds', 'trend']].to_dict('records'),
            'yhat': forecast[['ds', 'yhat']].to_dict('records'),
            'yhat_lower': forecast[['ds', 'yhat_lower']].to_dict('records'),
            'yhat_upper': forecast[['ds', 'yhat_upper']].to_dict('records')
        }
        
        # Add weekly and yearly seasonality if they exist
        if 'weekly' in forecast.columns:
            components['weekly'] = forecast[['ds', 'weekly']].to_dict('records')
        if 'yearly' in forecast.columns:
            components['yearly'] = forecast[['ds', 'yearly']].to_dict('records')
        
        return components


def create_sequences(data: pd.DataFrame, features: List[str], lookback: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create sequences for LSTM model
    
    Args:
        data (pd.DataFrame): Input dataframe
        features (List[str]): List of feature columns
        lookback (int): Number of time steps to look back
        
    Returns:
        Tuple[np.ndarray, np.ndarray]: X and y arrays for LSTM model
    """
    X, y = [], []
    data_array = data[features].values
    
    for i in range(len(data_array) - lookback):
        X.append(data_array[i:i+lookback])
        y.append(data_array[i+lookback, 0])  # First column is 'Units Sold'
    
    return np.array(X), np.array(y)


class LSTMForecaster:
    def __init__(self, data_path: str, lookback: int = 30):
        """
        Initialize the LSTM forecaster.
        
        Args:
            data_path (str): Path to the retail data CSV file
            lookback (int): Number of time steps to look back
        """
        self.data_path = data_path
        self.lookback = lookback
        self.model = None
        self.data = None
        self.scaler = MinMaxScaler()
        self.features = None
        
    def load_and_preprocess_data(self, product_id: Optional[str] = None, store_id: Optional[str] = None):
        """
        Load and preprocess the retail data for LSTM forecasting
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
        """
        logger.info(f"Loading data from {self.data_path}")
        df = pd.read_csv(self.data_path)
        
        # Convert Date column to datetime
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Filter data if product_id and store_id are provided
        if product_id and store_id:
            logger.info(f"Filtering data for Product ID: {product_id}, Store ID: {store_id}")
            df = df[(df['Product ID'] == product_id) & (df['Store ID'] == store_id)]
            
            if df.empty:
                logger.warning(f"No data found for Product ID: {product_id}, Store ID: {store_id}")
                return None
        
        # Sort by date
        df = df.sort_values('Date')
        
        # Feature selection
        self.features = ['Units Sold', 'Price', 'Discount', 'Inventory Level', 
                         'Units_Sold_Lag7', 'Inventory_to_Sales']
        
        # Add one-hot encoding for weather condition if it exists
        if 'Weather Condition' in df.columns:
            weather_dummies = pd.get_dummies(df['Weather Condition'], prefix='Weather')
            df = pd.concat([df, weather_dummies], axis=1)
            weather_columns = weather_dummies.columns.tolist()
            self.features.extend(weather_columns)
        
        # Add season indicators if they exist
        for season in ['Is_Spring', 'Is_Summer', 'Is_Monsoon', 'Is_Autumn', 'Is_Pre-winter', 'Is_Winter']:
            if season in df.columns:
                self.features.append(season)
        
        # Add Holiday/Promotion if it exists
        if 'Holiday/Promotion' in df.columns:
            self.features.append('Holiday/Promotion')
        
        # Ensure all required features exist
        available_features = [f for f in self.features if f in df.columns]
        
        if len(available_features) < 3:  # Minimum number of features
            logger.warning("Not enough features available for LSTM model")
            return None
        
        self.features = available_features
        
        # Create a dataset with only selected features
        data_subset = df[self.features].copy()
        
        # Handle missing values
        data_subset = data_subset.fillna(method='ffill').fillna(method='bfill')
        
        # Scale the data
        scaled_data = self.scaler.fit_transform(data_subset)
        
        self.data = pd.DataFrame(scaled_data, columns=self.features)
        logger.info(f"Data loaded successfully. Shape: {self.data.shape}")
        return self.data
    
    def train(self, product_id: Optional[str] = None, store_id: Optional[str] = None, epochs: int = 50, batch_size: int = 32):
        """
        Train the LSTM model
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
            epochs (int): Number of training epochs
            batch_size (int): Batch size for training
            
        Returns:
            tf.keras.Model: Trained LSTM model
        """
        if self.data is None:
            self.data = self.load_and_preprocess_data(product_id, store_id)
            
        if self.data is None or self.data.empty:
            logger.error("No data available for training")
            return None
        
        logger.info("Creating sequences for LSTM")
        X, y = create_sequences(self.data, self.features, self.lookback)
        
        if len(X) == 0:
            logger.error("Not enough data points to create sequences")
            return None
        
        # Split data into train and validation sets
        train_size = int(0.8 * len(X))
        X_train, X_val = X[:train_size], X[train_size:]
        y_train, y_val = y[:train_size], y[train_size:]
        
        # Build LSTM model
        logger.info("Building LSTM model")
        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.lookback, len(self.features))),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(1)
        ])
        
        self.model.compile(optimizer='adam', loss='mse')
        
        # Train the model
        logger.info(f"Training LSTM model for {epochs} epochs")
        self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )
        
        logger.info("LSTM model trained successfully")
        return self.model
    
    def predict(self, periods: int = 30) -> np.ndarray:
        """
        Generate forecasts for the specified number of periods
        
        Args:
            periods (int): Number of days to forecast
            
        Returns:
            np.ndarray: Forecasted values
        """
        if self.model is None:
            logger.warning("Model not trained. Training now.")
            self.train()
            
        if self.data is None or self.data.empty:
            logger.error("No data available for prediction")
            return None
        
        logger.info(f"Generating forecast for {periods} periods")
        
        # Get the most recent data points
        input_sequence = self.data.values[-self.lookback:]
        input_sequence = np.reshape(input_sequence, (1, self.lookback, len(self.features)))
        
        # Generate forecasts recursively
        forecasts = []
        current_sequence = input_sequence.copy()
        
        for _ in range(periods):
            # Predict the next value
            next_pred = self.model.predict(current_sequence, verbose=0)
            forecasts.append(next_pred[0, 0])
            
            # Create a new row with the prediction
            next_row = current_sequence[0, -1, :].copy()
            next_row[0] = next_pred[0, 0]  # Update 'Units Sold'
            
            # Update the sequence
            current_sequence = np.append(current_sequence[:, 1:, :], 
                                        np.reshape(next_row, (1, 1, len(self.features))), 
                                        axis=1)
        
        # Inverse transform to get the actual values
        forecast_values = np.zeros((len(forecasts), len(self.features)))
        forecast_values[:, 0] = forecasts  # Set the 'Units Sold' column
        
        # For other columns, use the last values (simplified approach)
        for i in range(1, len(self.features)):
            forecast_values[:, i] = self.data.iloc[-1, i]
        
        # Inverse transform
        forecast_values = self.scaler.inverse_transform(forecast_values)
        
        # Extract only the 'Units Sold' column
        result = forecast_values[:, 0]
        
        logger.info("Forecast generated successfully")
        return result


class EnsembleForecaster:
    def __init__(self, data_path: str, lookback: int = 30):
        """
        Initialize the ensemble forecaster.
        
        Args:
            data_path (str): Path to the retail data CSV file
            lookback (int): Number of time steps to look back for LSTM
        """
        self.data_path = data_path
        self.lookback = lookback
        self.prophet_forecaster = ProphetForecaster(data_path)
        self.lstm_forecaster = LSTMForecaster(data_path, lookback)
        
    def train(self, product_id: Optional[str] = None, store_id: Optional[str] = None):
        """
        Train both forecasting models
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
        """
        logger.info("Training Prophet model")
        self.prophet_forecaster.train(product_id, store_id)
        
        logger.info("Training LSTM model")
        self.lstm_forecaster.train(product_id, store_id)
        
    def predict(self, periods: int = 30, prophet_weight: float = 0.6) -> pd.DataFrame:
        """
        Generate ensemble forecasts for the specified number of periods
        
        Args:
            periods (int): Number of days to forecast
            prophet_weight (float): Weight given to Prophet predictions (0-1)
            
        Returns:
            pd.DataFrame: Ensemble forecast results
        """
        # Get Prophet forecast
        prophet_forecast = self.prophet_forecaster.predict(periods)
        
        # Get LSTM forecast
        lstm_forecast = self.lstm_forecaster.predict(periods)
        
        if prophet_forecast is None or lstm_forecast is None:
            logger.error("One of the models failed to generate forecasts")
            return None
        
        # Extract the relevant columns from Prophet forecast
        prophet_result = prophet_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
        
        # Create a dataframe for LSTM forecast
        lstm_result = pd.DataFrame({
            'ds': prophet_result['ds'],
            'lstm_forecast': lstm_forecast
        })
        
        # Merge the forecasts
        ensemble_forecast = prophet_result.merge(lstm_result, on='ds')
        
        # Calculate weighted average
        ensemble_forecast['ensemble_forecast'] = (prophet_weight * ensemble_forecast['yhat'] + 
                                                 (1 - prophet_weight) * ensemble_forecast['lstm_forecast'])
        
        # Calculate confidence intervals
        prophet_range = ensemble_forecast['yhat_upper'] - ensemble_forecast['yhat_lower']
        ensemble_forecast['ensemble_lower'] = ensemble_forecast['ensemble_forecast'] - prophet_range / 2
        ensemble_forecast['ensemble_upper'] = ensemble_forecast['ensemble_forecast'] + prophet_range / 2
        
        logger.info("Ensemble forecast generated successfully")
        return ensemble_forecast