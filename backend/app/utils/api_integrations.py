import requests
import tweepy
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

load_dotenv()

class WeatherAPI:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_weather_forecast(self, city: str, days: int = 7) -> List[Dict[str, Any]]:
        """
        Get weather forecast for the specified city
        
        Args:
            city (str): City name
            days (int): Number of days to forecast
            
        Returns:
            List[Dict[str, Any]]: Weather forecast data
        """
        try:
            # Get city coordinates
            geo_url = f"{self.base_url}/weather"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': 'metric'
            }
            response = requests.get(geo_url, params=params)
            data = response.json()
            
            if 'coord' not in data:
                raise ValueError(f"Could not find city: {city}")
                
            lat, lon = data['coord']['lat'], data['coord']['lon']
            
            # Get forecast
            forecast_url = f"{self.base_url}/forecast"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric',
                'cnt': days * 8  # 8 forecasts per day
            }
            
            response = requests.get(forecast_url, params=params)
            forecast_data = response.json()
            
            # Process and format forecast data
            processed_forecast = []
            for item in forecast_data['list']:
                processed_forecast.append({
                    'timestamp': datetime.fromtimestamp(item['dt']),
                    'temperature': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'weather': item['weather'][0]['main'],
                    'description': item['weather'][0]['description']
                })
                
            return processed_forecast
            
        except Exception as e:
            print(f"Error fetching weather data: {str(e)}")
            return []

class TwitterAPI:
    def __init__(self):
        self.api_key = os.getenv('TWITTER_API_KEY')
        self.api_secret = os.getenv('TWITTER_API_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # Initialize Twitter client
        self.client = tweepy.Client(
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.access_token,
            access_token_secret=self.access_token_secret
        )
        
    def get_trending_topics(self, location: str = "worldwide") -> List[Dict[str, Any]]:
        """
        Get trending topics for a location
        
        Args:
            location (str): Location to get trends for
            
        Returns:
            List[Dict[str, Any]]: Trending topics data
        """
        try:
            # Get location ID
            available_locations = self.client.available_trends()
            location_id = next(
                (loc['woeid'] for loc in available_locations if loc['name'].lower() == location.lower()),
                None
            )
            
            if not location_id:
                location_id = 1  # Default to worldwide
            
            # Get trends
            trends = self.client.get_place_trends(location_id)
            
            # Process and format trends data
            processed_trends = []
            for trend in trends[0]['trends']:
                processed_trends.append({
                    'name': trend['name'],
                    'tweet_volume': trend.get('tweet_volume', 0),
                    'url': trend['url']
                })
                
            return processed_trends
            
        except Exception as e:
            print(f"Error fetching Twitter trends: {str(e)}")
            return []
            
    def search_tweets(self, query: str, count: int = 100) -> List[Dict[str, Any]]:
        """
        Search for tweets matching a query
        
        Args:
            query (str): Search query
            count (int): Number of tweets to retrieve
            
        Returns:
            List[Dict[str, Any]]: Tweet data
        """
        try:
            tweets = self.client.search_recent_tweets(
                query=query,
                max_results=count,
                tweet_fields=['created_at', 'public_metrics']
            )
            
            processed_tweets = []
            for tweet in tweets.data:
                processed_tweets.append({
                    'text': tweet.text,
                    'created_at': tweet.created_at,
                    'retweets': tweet.public_metrics['retweet_count'],
                    'likes': tweet.public_metrics['like_count']
                })
                
            return processed_tweets
            
        except Exception as e:
            print(f"Error searching tweets: {str(e)}")
            return []

class ExternalDataAnalyzer:
    def __init__(self):
        self.weather_api = WeatherAPI()
        self.twitter_api = TwitterAPI()
        
    def analyze_weather_impact(self, city: str, product_category: str) -> Dict[str, Any]:
        """
        Analyze how weather might impact product demand
        
        Args:
            city (str): City to analyze
            product_category (str): Product category to analyze
            
        Returns:
            Dict[str, Any]: Weather impact analysis
        """
        forecast = self.weather_api.get_weather_forecast(city)
        
        # Simple impact analysis based on weather conditions
        impact = {
            'temperature_impact': 0,
            'weather_impact': 0,
            'recommendations': []
        }
        
        for day in forecast:
            # Temperature impact
            if day['temperature'] > 25:  # Hot weather
                if product_category in ['beverages', 'ice_cream']:
                    impact['temperature_impact'] += 1
            elif day['temperature'] < 10:  # Cold weather
                if product_category in ['hot_drinks', 'soup']:
                    impact['temperature_impact'] += 1
                    
            # Weather condition impact
            if day['weather'] == 'Rain':
                if product_category in ['umbrellas', 'raincoats']:
                    impact['weather_impact'] += 1
                    
        return impact
        
    def analyze_social_trends(self, product_name: str) -> Dict[str, Any]:
        """
        Analyze social media trends for a product
        
        Args:
            product_name (str): Product to analyze
            
        Returns:
            Dict[str, Any]: Social trends analysis
        """
        tweets = self.twitter_api.search_tweets(product_name)
        trends = self.twitter_api.get_trending_topics()
        
        analysis = {
            'tweet_volume': len(tweets),
            'average_sentiment': 0,
            'trending_related': [],
            'recommendations': []
        }
        
        # Check if product is related to any trending topics
        for trend in trends:
            if product_name.lower() in trend['name'].lower():
                analysis['trending_related'].append(trend)
                
        return analysis 