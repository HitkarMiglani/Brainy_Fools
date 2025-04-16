# import pandas as pd
# import numpy as np
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain.vectorstores import Chroma
# from langchain.chains import RetrievalQA
# from langchain.llms import HuggingFaceHub
# import os
# from dotenv import load_dotenv

# class RetailRAGPipeline:
#     def __init__(self, data_path, model_name="sentence-transformers/all-mpnet-base-v2"):
#         """
#         Initialize the RAG pipeline for retail demand forecasting.
        
#         Args:
#             data_path (str): Path to the retail inventory data
#             model_name (str): Name of the embedding model to use
#         """
#         load_dotenv()
#         self.data_path = data_path
#         self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
#         self.vector_store = None
#         self.qa_chain = None
        
#     def load_and_process_data(self):
#         """Load and process the retail inventory data."""
#         df = pd.read_csv(self.data_path)
        
#         # Create product descriptions by combining relevant columns
#         df['product_context'] = df.apply(
#             lambda row: f"Product: {row['Name']}, Category: {row['Category_Type']}, "
#                        f"Current Stock: {row['Inventory Level']}, Price: {row['Price']}, "
#                        f"Historical Sales: {row['historical_sales']}",
#             axis=1
#         )
        
#         # Split text into chunks
#         text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000,
#             chunk_overlap=200
#         )
        
#         texts = text_splitter.split_text('\n'.join(df['product_context']))
#         return texts
    
#     def create_vector_store(self, texts):
#         """Create a vector store from the processed texts."""
#         self.vector_store = Chroma.from_texts(
#             texts=texts,
#             embedding=self.embeddings,
#             persist_directory="./chroma_db"
#         )
    
#     def setup_qa_chain(self):
#         """Set up the question-answering chain with a language model."""
#         # Initialize the language model
#         llm = HuggingFaceHub(
#             repo_id="google/flan-t5-large",
#             model_kwargs={"temperature": 0.1, "max_length": 512}
#         )
        
#         # Create the QA chain
#         self.qa_chain = RetrievalQA.from_chain_type(
#             llm=llm,
#             chain_type="stuff",
#             retriever=self.vector_store.as_retriever(
#                 search_kwargs={"k": 3}
#             )
#         )
    
#     def query(self, question):
#         """Query the RAG pipeline with a question."""
#         if not self.qa_chain:
#             raise ValueError("QA chain not initialized. Call setup_qa_chain() first.")
        
#         return self.qa_chain.run(question)
    
#     def initialize_pipeline(self):
#         """Initialize the complete RAG pipeline."""
#         texts = self.load_and_process_data()
#         self.create_vector_store(texts)
#         self.setup_qa_chain()

# # Example usage
# if __name__ == "__main__":
#     # Initialize the pipeline
#     rag_pipeline = RetailRAGPipeline(r"backend\app\data\retail_store_inventory_cleaned.csv")
#     rag_pipeline.initialize_pipeline()
    
#     # Example queries
#     questions = [
#         "What is the current stock level for product X?",
#         "Which products are likely to have high demand next week?",
#         "What are the best-selling products in category Y?"
#     ]
    
#     for question in questions:
#         answer = rag_pipeline.query(question)
#         print(f"Q: {question}")
#         print(f"A: {answer}\n") 


import pandas as pd
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import HuggingFaceHub
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional, Union
from datetime import datetime
import logging
from utils.api_integrations import ExternalDataAnalyzer

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
        chunk_overlap: int = 200
    ):
        """
        Initialize the RAG pipeline for retail demand forecasting.
        
        Args:
            data_path (str, optional): Path to the retail inventory data
            model_name (str): Name of the embedding model to use
            chunk_size (int): Size of text chunks for processing
            chunk_overlap (int): Overlap between text chunks
        """
        self.data_path = data_path
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
        self.vector_store = None
        self.qa_chain = None
        self.external_analyzer = ExternalDataAnalyzer()
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.processed_data = None
        
    def validate_csv_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and clean the CSV data.
        
        Args:
            df (pd.DataFrame): Input dataframe
            
        Returns:
            pd.DataFrame: Cleaned and validated dataframe
        """
        required_columns = ['product_name', 'category', 'current_stock', 'price', 'historical_sales']
        
        # Check for required columns
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Clean data
        df = df.dropna(subset=required_columns)
        df['current_stock'] = pd.to_numeric(df['current_stock'], errors='coerce')
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        df['historical_sales'] = pd.to_numeric(df['historical_sales'], errors='coerce')
        
        return df
    
    def load_and_process_data(self) -> List[str]:
        """
        Load and process the retail inventory data from CSV and APIs.
        
        Returns:
            List[str]: List of processed text chunks
        """
        if not self.data_path:
            logger.warning("No data path provided. Using only API data.")
            return []
        
        try:
            df = pd.read_csv(self.data_path)
            df = self.validate_csv_data(df)
            
            # Create product descriptions with enhanced context
            df['product_context'] = df.apply(
                lambda row: self._create_product_context(row),
                axis=1
            )
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap
            )
            
            texts = text_splitter.split_text('\n'.join(df['product_context']))
            self.processed_data = df
            
            return texts
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
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
            f"Product: {row['product_name']}\n"
            f"Category: {row['category']}\n"
            f"Current Stock: {row['current_stock']}\n"
            f"Price: ${row['price']:.2f}\n"
            f"Historical Sales: {row['historical_sales']}\n"
            f"Last Updated: {datetime.now().strftime('%Y-%m-%d')}"
        )
    
    def create_vector_store(self, texts: List[str]) -> None:
        """
        Create a vector store from the processed texts.
        
        Args:
            texts (List[str]): List of text chunks to store
        """
        if not texts:
            logger.warning("No texts provided for vector store creation")
            return
            
        self.vector_store = Chroma.from_texts(
            texts=texts,
            embedding=self.embeddings,
            persist_directory="./chroma_db"
        )
    
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
        """Initialize the complete RAG pipeline."""
        try:
            texts = self.load_and_process_data()
            self.create_vector_store(texts)
            self.setup_qa_chain()
        except Exception as e:
            logger.error(f"Error initializing pipeline: {str(e)}")
            raise

# Example usage
if __name__ == "__main__":
    # Initialize the pipeline
    rag_pipeline = RetailRAGPipeline("retail_store_inventory.csv")
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