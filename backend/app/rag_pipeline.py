import pandas as pd
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import HuggingFaceHub
import os
from dotenv import load_dotenv

class RetailRAGPipeline:
    def __init__(self, data_path, model_name="sentence-transformers/all-mpnet-base-v2"):
        """
        Initialize the RAG pipeline for retail demand forecasting.
        
        Args:
            data_path (str): Path to the retail inventory data
            model_name (str): Name of the embedding model to use
        """
        load_dotenv()
        self.data_path = data_path
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
        self.vector_store = None
        self.qa_chain = None
        
    def load_and_process_data(self):
        """Load and process the retail inventory data."""
        df = pd.read_csv(self.data_path)
        
        # Create product descriptions by combining relevant columns
        df['product_context'] = df.apply(
            lambda row: f"Product: {row['Name']}, Category: {row['Category_Type']}, "
                       f"Current Stock: {row['Inventory Level']}, Price: {row['Price']}, "
                       f"Historical Sales: {row['historical_sales']}",
            axis=1
        )
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        texts = text_splitter.split_text('\n'.join(df['product_context']))
        return texts
    
    def create_vector_store(self, texts):
        """Create a vector store from the processed texts."""
        self.vector_store = Chroma.from_texts(
            texts=texts,
            embedding=self.embeddings,
            persist_directory="./chroma_db"
        )
    
    def setup_qa_chain(self):
        """Set up the question-answering chain with a language model."""
        # Initialize the language model
        llm = HuggingFaceHub(
            repo_id="google/flan-t5-large",
            model_kwargs={"temperature": 0.1, "max_length": 512}
        )
        
        # Create the QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(
                search_kwargs={"k": 3}
            )
        )
    
    def query(self, question):
        """Query the RAG pipeline with a question."""
        if not self.qa_chain:
            raise ValueError("QA chain not initialized. Call setup_qa_chain() first.")
        
        return self.qa_chain.run(question)
    
    def initialize_pipeline(self):
        """Initialize the complete RAG pipeline."""
        texts = self.load_and_process_data()
        self.create_vector_store(texts)
        self.setup_qa_chain()

# Example usage
if __name__ == "__main__":
    # Initialize the pipeline
    rag_pipeline = RetailRAGPipeline(r"backend\app\data\retail_store_inventory_cleaned.csv")
    rag_pipeline.initialize_pipeline()
    
    # Example queries
    questions = [
        "What is the current stock level for product X?",
        "Which products are likely to have high demand next week?",
        "What are the best-selling products in category Y?"
    ]
    
    for question in questions:
        answer = rag_pipeline.query(question)
        print(f"Q: {question}")
        print(f"A: {answer}\n") 