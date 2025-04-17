import pandas as pd
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.llms import HuggingFaceHub
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional, Union
from datetime import datetime
import logging
from utils.api_integrations import ExternalDataAnalyzer
import time
from tqdm import tqdm

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RetailRAGPipeline:
    def __init__(
        self,
        data_path: Optional[str] = None,
        model_name: str = "sentence-transformers/all-mpnet-base-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        batch_size: int = 32  # Added batch processing parameter increace 
    ):
        """
        Initialize the RAG pipeline for retail demand forecasting.
        
        Args:
            data_path (str, optional): Path to the retail inventory data
            model_name (str): Name of the embedding model to use
            chunk_size (int): Size of text chunks for processing
            chunk_overlap (int): Overlap between text chunks
            batch_size (int): Number of documents to process in a batch
        """
        self.data_path = data_path
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
        self.vector_store = None
        self.qa_chain = None
        self.external_analyzer = ExternalDataAnalyzer()
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.processed_data = None
        self.batch_size = batch_size
        
    def validate_csv_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and clean the CSV data.
        
        Args:
            df (pd.DataFrame): Input dataframe
            
        Returns:
            pd.DataFrame: Cleaned and validated dataframe
        """
        required_columns = ['Name', 'Category', 'Inventory Level', 'Price', 'Units Sold']
        
        # Check for required columns
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Clean data
        df = df.dropna(subset=required_columns)
        df['current_stock'] = pd.to_numeric(df['Inventory Level'], errors='coerce')
        df['price'] = pd.to_numeric(df['Price'], errors='coerce')
        df['historical_sales'] = pd.to_numeric(df['Units Sold'], errors='coerce')
        
        return df
    
    def load_and_process_data(self) -> List[str]:
        """
        Load and process retail data, converting it to text chunks for embedding.
        
        Returns:
            List[str]: Processed text chunks
        """
        if not self.data_path:
            default_path = "./data/retail_store_inventory_cleaned.csv"
            self.data_path = default_path
            logger.info(f"No data path provided, using default: {default_path}")
        
        try:
            print(f"Loading data from {self.data_path}...")
            start_time = time.time()
            df = pd.read_csv(self.data_path)
            print(f"Data loaded: {len(df)} rows, {df.shape[1]} columns")
            
            # Cache the processed data
            self.processed_data = df
            
            # Convert dataframe to text representation
            print("Converting data to text format...")
            texts = []
            
            # Process in chunks for better memory management
            chunk_size = 1000  # Process 1000 rows at a time
            total_chunks = (len(df) // chunk_size) + (1 if len(df) % chunk_size > 0 else 0)
            
            for i in tqdm(range(total_chunks), desc="Processing data chunks"):
                start_idx = i * chunk_size
                end_idx = min((i + 1) * chunk_size, len(df))
                chunk_df = df.iloc[start_idx:end_idx]
                
                for _, row in chunk_df.iterrows():
                    # Create detailed text representation of each inventory record
                    text = f"""
                    Date: {row['Date']}
                    Store ID: {row['Store ID']}
                    Product ID: {row['Product ID']}
                    Category: {row['Category']}
                    Region: {row['Region']}
                    Inventory Level: {row['Inventory Level']}
                    Units Sold: {row['Units Sold']}
                    Units Ordered: {row['Units Ordered']}
                    Demand Forecast: {row['Demand Forecast']}
                    Price: {row['Price']}
                    Discount: {row['Discount']}
                    Weather: {row['Weather Condition']}
                    Holiday/Promotion: {row['Holiday/Promotion']}
                    Competitor Pricing: {row['Competitor Pricing']}
                    Seasonality: {row['Seasonality']}
                    Product Type: {row['Category_Type']}
                    Product Name: {row['Name']}
                    """
                    texts.append(text)
            
            # Split texts into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap
            )
            
            print(f"Splitting {len(texts)} records into chunks...")
            split_texts = text_splitter.create_documents(texts)
            result_texts = [doc.page_content for doc in split_texts]
            
            elapsed_time = time.time() - start_time
            print(f"Data processing completed in {elapsed_time:.2f} seconds")
            print(f"Generated {len(result_texts)} text chunks")
            
            return result_texts
        except Exception as e:
            logger.error(f"Error loading or processing data: {str(e)}")
            raise
    
    def _create_product_context(self, row: pd.Series) -> str:
        """
        Create a detailed product context string.
        
        Args:
            row (pd.Series): Product data row
            
        Returns:
            str: Formatted product context
        """
        return (
            f"Product: {row['Name']}\n"
            f"Category: {row['Category']}\n"
            f"Current Stock: {row['Inventory Level']}\n"
            f"Price: ${row['Price']:.2f}\n"
            f"Historical Sales: {row['Units Sold']}\n"
            f"Last Updated: {datetime.now().strftime('%Y-%m-%d')}"
        )
    
    def create_vector_store(self, texts: List[str]) -> None:
        """
        Create a vector store from the processed texts with progress tracking and batch processing.
        
        Args:
            texts (List[str]): List of text chunks to store
        """
        if not texts:
            logger.warning("No texts provided for vector store creation")
            return
        
        print(f"Creating vector store with {len(texts)} text chunks...")
        start_time = time.time()
        
        # Check if Chroma DB already exists and has the same number of documents
        try:
            existing_db = Chroma(
                persist_directory="./chroma_db",
                embedding_function=self.embeddings
            )
            existing_count = existing_db._collection.count()
            if (existing_count == len(texts)):
                print(f"Using existing vector store with {existing_count} documents.")
                self.vector_store = existing_db
                return
            else:
                print(f"Rebuilding vector store (existing: {existing_count}, new: {len(texts)}).")
        except Exception as e:
            print(f"No existing vector store found or error: {str(e)}")
            
        # Process in batches with progress bar
        if len(texts) > 1000:  # Only use batching for large datasets
            try:
                self.vector_store = Chroma(
                    embedding_function=self.embeddings,
                    persist_directory="./chroma_db"
                )
                
                batches = [texts[i:i + self.batch_size] for i in range(0, len(texts), self.batch_size)]
                
                for i, batch in enumerate(tqdm(batches, desc="Processing batches")):
                    self.vector_store.add_texts(batch)
                    if i % 5 == 0:  # Persist every 5 batches
                        self.vector_store.persist()
                        print(f"Persisted at batch {i+1}/{len(batches)}")
                
                # Final persist
                self.vector_store.persist()
            except Exception as e:
                logger.error(f"Error in batch processing: {str(e)}")
                # Fall back to standard processing
                print("Falling back to standard processing method...")
                self.vector_store = Chroma.from_texts(
                    texts=texts,
                    embedding=self.embeddings,
                    persist_directory="./chroma_db"
                )
        else:
            # Standard processing for smaller datasets
            with tqdm(total=1, desc="Creating vector store") as pbar:
                self.vector_store = Chroma.from_texts(
                    texts=texts,
                    embedding=self.embeddings,
                    persist_directory="./chroma_db"
                )
                pbar.update(1)
        
        elapsed_time = time.time() - start_time
        print(f"Vector store creation completed in {elapsed_time:.2f} seconds.")
    
    def setup_qa_chain(self) -> None:
        """Set up the question-answering chain with a language model."""
        try:
            # Initialize the language model
            llm = HuggingFaceHub(
                repo_id="google/flan-t5-large",
                model_kwargs={"temperature": 0.1, "max_length": 512}
            )
            
            # Create a custom prompt template
            template = """
            You are a retail demand forecasting assistant. Use the following context to answer the question.
            Consider both the product information and external factors like weather and social trends.
            
            Context:
            {context}
            
            External Data:
            {external_data}
            
            Question: {question}
            
            Answer:
            """
            
            prompt = PromptTemplate(
                template=template,
                input_variables=["context", "external_data", "question"]
            )
            
            # Create the QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 3}
                ),
                chain_type_kwargs={"prompt": prompt}
            )
        except Exception as e:
            logger.error(f"Error setting up QA chain: {str(e)}")
            raise
    
    def get_external_context(self, product_name: str, category: str, city: str) -> str:
        """
        Get external context from weather and social media data.
        
        Args:
            product_name (str): Name of the product
            category (str): Product category
            city (str): City for weather analysis
            
        Returns:
            str: Formatted external context
        """
        try:
            # Get weather impact
            weather_impact = self.external_analyzer.analyze_weather_impact(city, category)
            
            # Get social trends
            social_trends = self.external_analyzer.analyze_social_trends(product_name)
            
            # Format external context
            external_context = f"""
            Weather Impact Analysis:
            - Temperature Impact Score: {weather_impact.get('temperature_impact', 'N/A')}
            - Weather Condition Impact: {weather_impact.get('weather_impact', 'N/A')}
            
            Social Media Analysis:
            - Tweet Volume: {social_trends.get('tweet_volume', 'N/A')}
            - Related Trends: {[trend['name'] for trend in social_trends.get('trending_related', [])]}
            """
            
            return external_context
        except Exception as e:
            logger.error(f"Error getting external context: {str(e)}")
            return "External data unavailable"
    
    def query(
        self,
        question: str,
        product_name: Optional[str] = None,
        category: Optional[str] = None,
        city: Optional[str] = None
    ) -> str:
        """
        Query the RAG pipeline with a question.
        
        Args:
            question (str): The question to answer
            product_name (str, optional): Name of the product
            category (str, optional): Product category
            city (str, optional): City for weather analysis
            
        Returns:
            str: The answer to the question
        """
        if not self.qa_chain:
            raise ValueError("QA chain not initialized. Call setup_qa_chain() first.")
        
        try:
            # Get external context if product details are provided
            external_data = ""
            if product_name and category and city:
                external_data = self.get_external_context(product_name, category, city)
            
            # Run the query with external context
            response = self.qa_chain.run(
                context="",
                external_data=external_data,
                question=question
            )
            
            return response
        except Exception as e:
            logger.error(f"Error in query: {str(e)}")
            return f"Error processing query: {str(e)}"
    
    def initialize_pipeline(self) -> None:
        """Initialize the complete RAG pipeline with progress reporting."""
        try:
            print("Initializing RAG pipeline...")
            
            print("Step 1/3: Loading and processing data...")
            start_time = time.time()
            texts = self.load_and_process_data()
            data_time = time.time() - start_time
            print(f"Data processing completed in {data_time:.2f} seconds. Generated {len(texts)} text chunks.")
            
            print("Step 2/3: Creating vector store...")
            start_time = time.time()
            self.create_vector_store(texts)
            vector_time = time.time() - start_time
            print(f"Vector store creation completed in {vector_time:.2f} seconds.")
            
            print("Step 3/3: Setting up QA chain...")
            start_time = time.time()
            self.setup_qa_chain()
            qa_time = time.time() - start_time
            print(f"QA chain setup completed in {qa_time:.2f} seconds.")
            
            print("Pipeline initialization complete! Ready to answer queries.")
        except Exception as e:
            logger.error(f"Error initializing pipeline: {str(e)}")
            raise

# Example usage
if __name__ == "__main__":
    # Initialize the pipeline
    rag_pipeline = RetailRAGPipeline("data/retail_store_inventory_cleaned.csv")
    rag_pipeline.initialize_pipeline()
    
    # Example queries with external context
    questions = [
        {
            "question": "What is the current stock level for product X?",
            "product_name": "Product X",
            "category": "electronics",
            "city": "New York"
        },
        {
            "question": "Which products are likely to have high demand next week?",
            "product_name": None,
            "category": "all",
            "city": "New York"
        },
        {
            "question": "What are the best-selling products in category Y?",
            "product_name": None,
            "category": "Y",
            "city": "New York"
        }
    ]
    
    for q in questions:
        answer = rag_pipeline.query(
            question=q["question"],
            product_name=q["product_name"],
            category=q["category"],
            city=q["city"]
        )
        print(f"Q: {q['question']}")
        print(f"A: {answer}\n")
