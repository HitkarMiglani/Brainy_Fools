# Brainy_Fools
This repo is made to share and deploy the project made during HackForge. Hope you like the code. :) 
# Retail Demand Forecasting &amp; Real-Time Inventory Management

## Overview

This project is an **AI-driven solution for automated demand forecasting and real-time inventory management in retail**. It leverages machine learning, Retrieval-Augmented Generation (RAG), and external data sources (weather, social sentiment) to predict product demand and optimize inventory levels, helping retailers avoid stockouts and overstock situations.

Inspired by industry solutions like Pluto7 Demand ML, this project is designed for rapid deployment and demo in a hackathon setting.

---

## Features

- **Automated Data Ingestion:** Integrate sales, weather, and social media data.
- **RAG Pipeline:** Retrieve relevant context for each product using vector databases and LLMs.
- **Demand Forecasting:** Time-series models (Prophet, LSTM) for accurate predictions.
- **Inventory Optimization:** Automated reorder logic based on predicted demand.
- **Real-Time Dashboard:** Visualize forecasts, inventory status, and alerts.
- **Modular &amp; Scalable:** Easily extendable to new data sources or forecasting models.

---

## Architecture

```

flowchart TB
A[Data Ingestion] --> B[RAG Pipeline]
B --> C[Forecasting Model]
C --> D[Inventory Logic]
D --> E[Dashboard]

```

---

## Tech Stack

| Component              | Tools/Frameworks                                                                 |
|------------------------|----------------------------------------------------------------------------------|
| Data Ingestion         | Python, Pandas, OpenWeatherMap API, Tweepy (Twitter API)                        |
| RAG Pipeline           | LangChain, LlamaIndex, ChromaDB, Hugging Face Transformers                      |
| Forecasting Model      | Facebook Prophet, PyTorch (LSTM/GRU), Scikit-learn                              |
| Inventory Logic        | Python, Rule-based/ML-based optimization                                        |
| Frontend/Dashboard     | Streamlit (rapid prototyping) or React + D3.js                                  |
| APIs &amp; Integration     | FastAPI, WebSocket, Mockaroo (mock data)                                        |

---

## Datasets

- **Sales &amp; Inventory**
  - [Walmart Sales Dataset (Kaggle)](https://www.kaggle.com/datasets/vetrirah/walmart-dataset)
  - [Retail Analysis with Walmart (Kaggle)](https://www.kaggle.com/datasets/rohitsahoo/sales-forecasting)
  - [UCI Online Retail Dataset](https://archive.ics.uci.edu/dataset/352/online+retail)
  - [Mendeley Sales Dataset](https://data.mendeley.com/datasets/sv3vg8g755)
- **Weather**
  - [OpenWeatherMap API](https://openweathermap.org/api)
- **Social Media Sentiment**
  - [Sentiment Analysis Datasets](https://research.aimultiple.com/sentiment-analysis-dataset/)
- **Demand Forecasting Aggregators**
  - [Datarade Demand Forecasting](https://datarade.ai/search/products/demand-forecasting-dataset)
  - [Iguazio Retail Datasets](https://www.iguazio.com/blog/13-best-free-retail-datasets-for-machine-learning/)

---

## Quick Start

### 1. Clone the Repository
```

git clone https://github.com/yourusername/retail-demand-forecasting.git
cd retail-demand-forecasting

```

### 2. Install Dependencies
```

pip install -r requirements.txt

```

### 3. Prepare Data
- Download a sales dataset (see links above) and place it in the `data/` directory.
- (Optional) Set up API keys for weather and Twitter sentiment in `.env`.

### 4. Run the Pipeline
```

python main.py

```

### 5. Launch the Dashboard
```

streamlit run dashboard.py

```

---

## Example Workflow

1. **Data Ingestion:** Load sales, weather, and social sentiment data.
2. **RAG Pipeline:** Retrieve relevant context for each product.
3. **Forecasting:** Train Prophet/LSTM models on historical and external data.
4. **Inventory Logic:** Trigger reorders based on forecasted demand.
5. **Dashboard:** Visualize forecasts, inventory status, and alerts in real time.

---

## Demo Scenario

- **Initial State:** Dashboard shows normal inventory and demand.
- **Event Trigger:** Weather API reports a heatwave; social sentiment spikes.
- **System Response:** RAG pipeline retrieves similar historical events, model updates forecast, inventory system triggers reorder.
- **Visual Output:** Dashboard highlights low stock and reorder action.

---

## References &amp; Further Reading

- [Pluto7 Demand ML Solution](https://pluto7.com/)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [Facebook Prophet Documentation](https://facebook.github.io/prophet/)
- [Streamlit Documentation](https://docs.streamlit.io/)

---

## Contact

For questions or support open an issue or contact the project maintainer.
