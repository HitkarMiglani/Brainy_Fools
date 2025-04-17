import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from models.forecasting import ProphetForecaster, EnsembleForecaster

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InventoryOptimizer:
    def __init__(self, forecaster, safety_stock_factor: float = 1.5, lead_time: int = 7):
        """
        Initialize the inventory optimizer.
        
        Args:
            forecaster: Trained forecasting model (ProphetForecaster or EnsembleForecaster)
            safety_stock_factor (float): Multiplier for safety stock calculation
            lead_time (int): Number of days it takes to restock
        """
        self.forecaster = forecaster
        self.safety_stock_factor = safety_stock_factor
        self.lead_time = lead_time
        self.data = None
        
    def load_inventory_data(self, product_id: Optional[str] = None, store_id: Optional[str] = None):
        """
        Load and preprocess inventory data
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
        """
        logger.info(f"Loading inventory data from {self.forecaster.data_path}")
        df = pd.read_csv(self.forecaster.data_path)
        
        # Filter data if product_id and store_id are provided
        if product_id and store_id:
            logger.info(f"Filtering data for Product ID: {product_id}, Store ID: {store_id}")
            df = df[(df['Product ID'] == product_id) & (df['Store ID'] == store_id)]
            
            if df.empty:
                logger.warning(f"No data found for Product ID: {product_id}, Store ID: {store_id}")
                return None
        
        # Use the most recent data
        latest_date = df['Date'].max()
        latest_data = df[df['Date'] == latest_date]
        
        # If no specific product and store were requested, aggregate by product and store
        if not product_id and not store_id:
            inventory_levels = latest_data.groupby(['Product ID', 'Store ID', 'Category']).agg({
                'Inventory Level': 'sum',
                'Price': 'mean',
                'Units Sold': 'sum',
                'Region': 'first'
            }).reset_index()
        else:
            inventory_levels = latest_data
        
        self.data = inventory_levels
        logger.info(f"Inventory data loaded successfully. Shape: {inventory_levels.shape}")
        return inventory_levels
    
    def calculate_reorder_point(self, forecast, lead_time: Optional[int] = None) -> float:
        """
        Calculate reorder point based on forecasted demand
        
        Args:
            forecast: Array of daily demand forecasts
            lead_time: Number of days it takes to restock (overrides instance lead_time if provided)
            
        Returns:
            float: The inventory level at which to place an order
        """
        if lead_time is None:
            lead_time = self.lead_time
            
        logger.info(f"Calculating reorder point with lead time: {lead_time}")
        
        # Calculate average daily demand during lead time
        avg_daily_demand = forecast[:lead_time].mean()
        
        # Calculate standard deviation of demand during lead time
        std_demand = forecast[:lead_time].std()
        
        # Calculate safety stock
        safety_stock = self.safety_stock_factor * std_demand * (lead_time ** 0.5)
        
        # Calculate reorder point
        reorder_point = (avg_daily_demand * lead_time) + safety_stock
        
        logger.info(f"Reorder point calculated: {reorder_point}")
        return reorder_point
    
    def calculate_eoq(self, annual_demand: float, ordering_cost: float, 
                     holding_cost_percentage: float, unit_cost: float) -> float:
        """
        Calculate Economic Order Quantity
        
        Args:
            annual_demand: Annual demand quantity
            ordering_cost: Cost per order
            holding_cost_percentage: Annual holding cost as percentage of unit cost
            unit_cost: Cost per unit
            
        Returns:
            float: Economic Order Quantity
        """
        logger.info("Calculating Economic Order Quantity")
        
        holding_cost = holding_cost_percentage * unit_cost
        eoq = (2 * annual_demand * ordering_cost / holding_cost) ** 0.5
        
        logger.info(f"EOQ calculated: {eoq}")
        return eoq
    
    def calculate_stockout_probability(self, current_inventory: float, 
                                      forecast: np.ndarray, 
                                      forecast_std: np.ndarray,
                                      days: int = 30) -> float:
        """
        Calculate the probability of stockout within the specified days
        
        Args:
            current_inventory: Current inventory level
            forecast: Array of daily demand forecasts
            forecast_std: Array of daily demand forecast standard deviations
            days: Number of days to look ahead
            
        Returns:
            float: Probability of stockout (0-1)
        """
        logger.info(f"Calculating stockout probability for {days} days")
        
        # Calculate cumulative demand
        cumulative_demand = np.cumsum(forecast[:days])
        
        # Calculate cumulative standard deviation (assuming independence)
        cumulative_std = np.sqrt(np.cumsum(forecast_std[:days] ** 2))
        
        # Calculate the probability of stockout for each day
        from scipy.stats import norm
        z_scores = (cumulative_demand - current_inventory) / cumulative_std
        stockout_probs = norm.cdf(z_scores)
        
        # Return the maximum probability
        max_prob = np.max(stockout_probs)
        
        logger.info(f"Stockout probability calculated: {max_prob}")
        return max_prob
    
    def calculate_reorder_points(self, product_id: Optional[str] = None, 
                               store_id: Optional[str] = None,
                               forecast_days: int = 30) -> pd.DataFrame:
        """
        Calculate reorder points based on forecasted demand
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
            forecast_days (int): Number of days to forecast
            
        Returns:
            pd.DataFrame: Reorder points for each product/store
        """
        if self.data is None:
            self.load_inventory_data(product_id, store_id)
            
        if self.data is None or self.data.empty:
            logger.error("No inventory data available")
            return None
        
        logger.info("Calculating reorder points for inventory")
        
        # Generate forecasts
        if isinstance(self.forecaster, EnsembleForecaster):
            ensemble_forecast = self.forecaster.predict(forecast_days)
            forecast_values = ensemble_forecast['ensemble_forecast'].values
            forecast_lower = ensemble_forecast['ensemble_lower'].values
            forecast_upper = ensemble_forecast['ensemble_upper'].values
            
            # Estimate standard deviation from confidence intervals
            forecast_std = (forecast_upper - forecast_lower) / 3.92  # 95% confidence interval is approx. 1.96 std deviations each way
        else:
            # Using only Prophet forecaster
            prophet_forecast = self.forecaster.predict(forecast_days)
            forecast_values = prophet_forecast['yhat'].tail(forecast_days).values
            forecast_lower = prophet_forecast['yhat_lower'].tail(forecast_days).values
            forecast_upper = prophet_forecast['yhat_upper'].tail(forecast_days).values
            
            # Estimate standard deviation from confidence intervals
            forecast_std = (forecast_upper - forecast_lower) / 3.92
        
        # Default parameters for EOQ calculation
        ordering_cost = 25.0  # Cost per order (default)
        holding_cost_percentage = 0.25  # 25% of unit cost per year (default)
        
        # Calculate reorder points and EOQ for each product/store
        results = []
        
        for _, row in self.data.iterrows():
            # Get current inventory
            current_inventory = row['Inventory Level']
            
            # Get unit price
            unit_price = row['Price']
            
            # Calculate annual demand (based on 30-day forecast)
            annual_demand = forecast_values.mean() * 365
            
            # Calculate reorder point
            reorder_point = self.calculate_reorder_point(forecast_values, self.lead_time)
            
            # Calculate EOQ
            eoq = self.calculate_eoq(annual_demand, ordering_cost, holding_cost_percentage, unit_price)
            
            # Calculate days until stockout (assuming average demand)
            avg_daily_demand = forecast_values.mean()
            days_until_stockout = float('inf') if avg_daily_demand <= 0 else current_inventory / avg_daily_demand
            
            # Calculate stockout probability
            stockout_prob = self.calculate_stockout_probability(current_inventory, forecast_values, forecast_std)
            
            # Determine status
            if current_inventory <= reorder_point:
                status = 'Reorder needed'
            else:
                status = 'Stock sufficient'
            
            # Calculate optimal order quantity
            if current_inventory < reorder_point:
                # Order enough to reach reorder point + EOQ
                optimal_order = max(0, eoq)
            else:
                optimal_order = 0
            
            # Add result
            result = {
                'Product ID': row['Product ID'] if 'Product ID' in row else None,
                'Store ID': row['Store ID'] if 'Store ID' in row else None,
                'Category': row['Category'] if 'Category' in row else None,
                'Region': row['Region'] if 'Region' in row else None,
                'Current Inventory': current_inventory,
                'Reorder Point': reorder_point,
                'EOQ': eoq,
                'Optimal Order Quantity': optimal_order,
                'Days Until Stockout': days_until_stockout,
                'Stockout Probability': stockout_prob,
                'Price': unit_price,
                'Status': status
            }
            
            results.append(result)
        
        results_df = pd.DataFrame(results)
        logger.info("Reorder points calculated successfully")
        
        return results_df
    
    def get_recommendations(self, product_id: Optional[str] = None, 
                           store_id: Optional[str] = None,
                           forecast_days: int = 30) -> List[Dict[str, Any]]:
        """
        Get inventory optimization recommendations
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
            forecast_days (int): Number of days to forecast
            
        Returns:
            List[Dict[str, Any]]: List of recommendations
        """
        inventory_data = self.calculate_reorder_points(product_id, store_id, forecast_days)
        
        if inventory_data is None or inventory_data.empty:
            logger.error("No inventory data available for recommendations")
            return []
        
        logger.info("Generating inventory recommendations")
        
        # Convert to list of dictionaries
        recommendations = inventory_data.to_dict('records')
        
        return recommendations
    
    def get_inventory_health(self, product_id: Optional[str] = None, 
                            store_id: Optional[str] = None,
                            forecast_days: int = 30) -> Dict[str, Any]:
        """
        Get overall inventory health metrics
        
        Args:
            product_id (str, optional): Filter data for a specific product
            store_id (str, optional): Filter data for a specific store
            forecast_days (int): Number of days to forecast
            
        Returns:
            Dict[str, Any]: Inventory health metrics
        """
        recommendations = self.get_recommendations(product_id, store_id, forecast_days)
        
        if not recommendations:
            logger.error("No recommendations available for inventory health metrics")
            return {
                'total_products': 0,
                'products_needing_reorder': 0,
                'reorder_percentage': 0,
                'total_reorder_value': 0,
                'average_days_until_stockout': 0,
                'high_risk_products': 0
            }
        
        logger.info("Calculating inventory health metrics")
        
        total_products = len(recommendations)
        products_needing_reorder = sum(1 for r in recommendations if r['Status'] == 'Reorder needed')
        total_reorder_value = sum(r['Optimal Order Quantity'] * r['Price'] for r in recommendations)
        
        # Calculate average days until stockout (excluding infinity values)
        days_until_stockout_values = [r['Days Until Stockout'] for r in recommendations if r['Days Until Stockout'] != float('inf')]
        average_days_until_stockout = sum(days_until_stockout_values) / len(days_until_stockout_values) if days_until_stockout_values else float('inf')
        
        # Calculate high risk products (stockout probability > 25%)
        high_risk_products = sum(1 for r in recommendations if r['Stockout Probability'] > 0.25)
        
        return {
            'total_products': total_products,
            'products_needing_reorder': products_needing_reorder,
            'reorder_percentage': (products_needing_reorder / total_products) * 100 if total_products > 0 else 0,
            'total_reorder_value': total_reorder_value,
            'average_days_until_stockout': average_days_until_stockout,
            'high_risk_products': high_risk_products,
            'high_risk_percentage': (high_risk_products / total_products) * 100 if total_products > 0 else 0
        }