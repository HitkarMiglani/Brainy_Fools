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
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional, Union
from datetime import datetime
import logging
from .utils.api_integrations import ExternalDataAnalyzer

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RetailRAGPipeline:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.vector_store = None
        self.qa_chain = None
        self.embeddings = OpenAIEmbeddings()
        
    def initialize_pipeline(self):
        """Initialize the RAG pipeline with data processing and model setup"""
        try:
            # Load and process data
            df = pd.read_csv(self.data_path)
            
            # Create text chunks from data
            text_chunks = self._create_text_chunks(df)
            
            # Create vector store
            self.vector_store = FAISS.from_texts(text_chunks, self.embeddings)
            
            # Initialize QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=OpenAI(),
                chain_type="stuff",
                retriever=self.vector_store.as_retriever()
            )
            
            return True
        except Exception as e:
            print(f"Error initializing pipeline: {str(e)}")
            return False
    
    def _create_text_chunks(self, df: pd.DataFrame) -> List[str]:
        """Create text chunks from the retail data"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # Convert DataFrame to text
        texts = []
        for _, row in df.iterrows():
            text = f"""
            Product: {row['product_name']}
            Category: {row['category']}
            Current Stock: {row['current_stock']}
            Price: {row['price']}
            Historical Sales: {row['historical_sales']}
            Reorder Point: {row['reorder_point']}
            """
            texts.append(text)
        
        # Split into chunks
        chunks = []
        for text in texts:
            chunks.extend(text_splitter.split_text(text))
        
        return chunks
    
    def query(self, question: str) -> Dict[str, Any]:
        """Query the RAG pipeline with a question"""
        try:
            if not self.qa_chain:
                return {"error": "Pipeline not initialized"}
            
            result = self.qa_chain({"query": question})
            return {"answer": result["result"]}
        except Exception as e:
            return {"error": str(e)}
    
    def get_relevant_data(self, query: str) -> List[Dict[str, Any]]:
        """Get relevant data based on semantic similarity"""
        try:
            if not self.vector_store:
                return []
            
            # Get similar documents
            docs = self.vector_store.similarity_search(query, k=5)
            
            # Process and return relevant data
            relevant_data = []
            for doc in docs:
                # Extract information from document
                data = self._extract_data_from_doc(doc.page_content)
                if data:
                    relevant_data.append(data)
            
            return relevant_data
        except Exception as e:
            print(f"Error getting relevant data: {str(e)}")
            return []
    
    def _extract_data_from_doc(self, doc_content: str) -> Dict[str, Any]:
        """Extract structured data from document content"""
        try:
            lines = doc_content.split('\n')
            data = {}
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    data[key.strip()] = value.strip()
            return data
        except Exception as e:
            print(f"Error extracting data from doc: {str(e)}")
            return {}

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