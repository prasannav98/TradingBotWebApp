import { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import React from 'react';

export default function TradingBot() {
  const [symbol, setSymbol] = useState("AAPL");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [training, setTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [predictionMessage, setPredictionMessage] = useState("");
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    shares: 0,
    currentValue: 10000,
  });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [tradedDates, setTradedDates] = useState(new Set());
  const [chartBase64, setChartBase64] = useState(''); // Added chartBase64 state

  const fetchData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8000/fetch_data", {
        symbol,
        start_date: startDate,
        end_date: endDate,
      });
      if (response.data.error) {
        setMessage(response.data.error);
      } else {
        setData(response.data.data);
      }
    } catch (error) {
      setMessage("Error fetching data");
    }
    setLoading(false);
  };

  const trainModel = async () => {
    setTraining(true);
    setTrainMessage("Training in progress...");
    try {
      const response = await axios.post("http://localhost:8000/train_model", {
        symbol,
        start_date: startDate,
        end_date: endDate,
      });
      setTrainMessage(response.data.message);
    } catch (error) {
      setTrainMessage("Error training model");
    }
    setTraining(false);
  };

  const getPredictions = async () => {
    setPredictionMessage("Fetching predictions...");
    try {
      const response = await axios.post("http://localhost:8000/get_predictions", {
        symbol,
        data: data, //send the data to the API
      });
      if (response.data.error) {
        setPredictionMessage(response.data.error);
      } else {
        setPredictions(response.data.predictions);
        setPredictionMessage("Predictions loaded successfully.");
        setChartBase64(response.data.chart); // Set chartBase64
      }
    } catch (error) {
      setPredictionMessage("Error fetching predictions");
    }
  };

  const simulateTrade = (action, price, date) => {
    if (tradedDates.has(date)) {
      return;
    }

    setPortfolio((prevPortfolio) => {
      let newPortfolio = { ...prevPortfolio };
      if (action === "BUY" && newPortfolio.cash >= price) {
        newPortfolio.shares += 1;
        newPortfolio.cash -= price;
        setTransactionHistory((prevHistory) => [
          ...prevHistory,
          { date, action, price },
        ]);
      } else if (action === "SELL" && newPortfolio.shares > 0) {
        newPortfolio.shares -= 1;
        newPortfolio.cash += price;
        setTransactionHistory((prevHistory) => [
          ...prevHistory,
          { date, action, price },
        ]);
      }
      newPortfolio.currentValue = newPortfolio.shares * price + newPortfolio.cash;
      return newPortfolio;
    });
    setTradedDates((prevDates) => new Set(prevDates.add(date)));
  };

  const chartData = {
    series: [
      {
        name: "Close Price",
        data: data.map((item) => ({
          x: new Date(item.Date).getTime(),
          y: item[`Close_${symbol}`],
        })),
      },
    ],
    options: {
      chart: {
        id: "stock-chart",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        title: {
          text: "Price",
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Trading Bot</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchData} className="bg-blue-500 text-white p-2 rounded">
          Fetch Data
        </button>
        <button onClick={trainModel} className="bg-green-500 text-white p-2 rounded">
          Train Model
        </button>
        <button onClick={getPredictions} className="bg-purple-500 text-white p-2 rounded">
          Get Predictions
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {message && <p className="text-red-500">{message}</p>}
      {training && <p className="text-blue-500">{trainMessage}</p>}
      {predictionMessage && <p className="text-green-500">{predictionMessage}</p>}
      {data.length > 0 && (
        <div className="mt-4">
          <Chart options={chartData.options} series={chartData.series} type="line" height={350} />
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Close Price</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.Date}</td>
                  <td className="border p-2">{item[`Close_${symbol}`]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {chartBase64 && <img src={`data:image/png;base64,${chartBase64}`} alt="Predictions Chart" style={{maxWidth:"100%"}}/>}
      {predictions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Predictions</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Predicted Action</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((item, index) => {
                const price = data[index] ? data[index][`Close_${symbol}`] : 0;
                return (
                  <tr key={index}>
                    <td className="border p-2">{item.Date}</td>
                    <td className="border p-2">
                      {item.Action || "N/A"}
                      {item.Action && price > 0 && simulateTrade(item.Action, price, item.Date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Portfolio</h2>
        <p>Cash: ${portfolio.cash.toFixed(2)}</p>
        <p>Shares: {portfolio.shares}</p>
        <p>Value: ${portfolio.currentValue.toFixed(2)}</p>
        <p>Profit/Loss: ${(portfolio.currentValue - 10000).toFixed(2)}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Transaction History</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.date}</td>
                  <td className="border p-2">{item.action}</td>
                  <td className="border p-2">${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}