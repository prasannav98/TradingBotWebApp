# Trading Bot Web Interface

This project provides a web interface for a trading bot, allowing users to fetch stock data, train a model, get predictions, and simulate trading.

## Features

* **Data Fetching:** Fetch historical stock data for a specified symbol and date range.
* **Model Training:** Train a prediction model using the fetched data.
* **Prediction Generation:** Generate trading predictions based on the trained model.
* **Trading Simulation:** Simulate trading based on the generated predictions, tracking portfolio performance and transaction history.
* **Interactive Chart:** Displays a chart of the stock's closing price.
* **Limited Table Rows:** Displays a limited number of rows in tables to improve initial page load.
* **Scrollable Tables:** Tables with scrollable content for easier viewing of large datasets.

## Technologies Used

* **Frontend:**
    * React
    * Axios (for API requests)
    * react-apexcharts (for charting)
* **Backend:**
    * FastAPI (Python)
    * (Your prediction model libraries, e.g., scikit-learn, TensorFlow, etc.)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Backend Setup:**

    * Navigate to the backend directory.
    * Create a virtual environment (recommended):

        ```bash
        python3 -m venv venv
        source venv/bin/activate  # On Linux/macOS
        venv\Scripts\activate      # On Windows
        ```

    * Install dependencies:

        ```bash
        pip install -r requirements.txt
        ```

    * Run the FastAPI server:

        ```bash
        uvicorn main:app --reload
        ```

3.  **Frontend Setup:**

    * Navigate to the frontend directory.
    * Install dependencies:

        ```bash
        npm install
        ```

    * Start the React development server:

        ```bash
        npm start
        ```

4.  **Configuration:**

    * Ensure the frontend is configured to connect to the correct backend API endpoint (usually `http://localhost:8000`).
    * Adjust the prediction model and data fetching logic in the backend as needed.

## Usage

1.  Open the web interface in your browser (usually `http://localhost:3000`).
2.  Enter the stock symbol, start date, and end date.
3.  Click "Fetch Data" to retrieve historical stock data.
4.  Click "Train Model" to train the prediction model.
5.  Click "Get Predictions" to generate trading predictions.
6.  View the data, predictions, portfolio, and transaction history.

## Notes

* Replace `<repository_url>` and `<repository_directory>` with your actual repository information.
* Ensure your backend API is running before starting the frontend.
* Adjust the prediction model and trading simulation logic to match your specific requirements.
* Install the necessary python libraries that your backend code requires.
