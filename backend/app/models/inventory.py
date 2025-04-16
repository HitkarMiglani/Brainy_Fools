import pandas as pd
import numpy as np
from typing import Dict, List, Any
from .forecasting import ProphetForecaster

class InventoryOptimizer:
    def __init__(self, forecaster: ProphetForecaster, safety_stock_days: int = 7):
        """
        Initialize the inventory optimizer.
        
        Args:
            forecaster (ProphetForecaster): Trained forecasting model
            safety_stock_days (int): Number of days to keep as safety stock
        """
        self.forecaster = forecaster
        self.safety_stock_days = safety_stock_days
        self.data = None
        
    def load_inventory_data(self):
        """Load and preprocess inventory data"""
        df = pd.read_csv(self.forecaster.data_path)
        
        # Calculate current inventory levels
        inventory_levels = df.groupby('product_id').agg({
            'current_stock': 'sum',
            'price': 'mean',
            'category': 'first'
        }).reset_index()
        
        self.data = inventory_levels
        return inventory_levels
    
    def calculate_reorder_points(self) -> pd.DataFrame:
        """
        Calculate reorder points based on forecasted demand
        
        Returns:
            pd.DataFrame: Reorder points for each product
        """
        if self.data is None:
            self.load_inventory_data()
            
        # Get forecast for next 30 days
        forecast = self.forecaster.predict(periods=30)
        
        # Calculate average daily demand
        avg_daily_demand = forecast['yhat'].mean()
        
        # Calculate reorder point
        reorder_point = avg_daily_demand * self.safety_stock_days
        
        # Add reorder points to inventory data
        self.data['reorder_point'] = reorder_point
        self.data['reorder_quantity'] = np.maximum(
            reorder_point - self.data['current_stock'],
            0
        )
        
        return self.data
    
    def get_recommendations(self) -> List[Dict[str, Any]]:
        """
        Get inventory optimization recommendations
        
        Returns:
            List[Dict[str, Any]]: List of recommendations
        """
        inventory_data = self.calculate_reorder_points()
        
        recommendations = []
        for _, row in inventory_data.iterrows():
            if row['current_stock'] < row['reorder_point']:
                recommendations.append({
                    'product_id': row['product_id'],
                    'category': row['category'],
                    'current_stock': row['current_stock'],
                    'reorder_point': row['reorder_point'],
                    'reorder_quantity': row['reorder_quantity'],
                    'price': row['price'],
                    'status': 'Reorder needed'
                })
            else:
                recommendations.append({
                    'product_id': row['product_id'],
                    'category': row['category'],
                    'current_stock': row['current_stock'],
                    'reorder_point': row['reorder_point'],
                    'reorder_quantity': 0,
                    'price': row['price'],
                    'status': 'Stock sufficient'
                })
        
        return recommendations
    
    def get_inventory_health(self) -> Dict[str, Any]:
        """
        Get overall inventory health metrics
        
        Returns:
            Dict[str, Any]: Inventory health metrics
        """
        recommendations = self.get_recommendations()
        
        total_products = len(recommendations)
        products_needing_reorder = sum(1 for r in recommendations if r['status'] == 'Reorder needed')
        total_reorder_value = sum(r['reorder_quantity'] * r['price'] for r in recommendations)
        
        return {
            'total_products': total_products,
            'products_needing_reorder': products_needing_reorder,
            'reorder_percentage': (products_needing_reorder / total_products) * 100,
            'total_reorder_value': total_reorder_value
        } 