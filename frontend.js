import { useState } from "react";
import axios from "axios";

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
      });
      if (response.data.error) {
        setPredictionMessage(response.data.error);
      } else {
        setPredictions(response.data.predictions);
        setPredictionMessage("Predictions loaded successfully.");
      }
    } catch (error) {
      setPredictionMessage("Error fetching predictions");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Trading Bot</h1>
      <div className="flex gap-2 mb-4">
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Stock Symbol" className="border p-2 rounded" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchData} className="bg-blue-500 text-white p-2 rounded">Fetch Data</button>
        <button onClick={trainModel} className="bg-green-500 text-white p-2 rounded">Train Model</button>
        <button onClick={getPredictions} className="bg-purple-500 text-white p-2 rounded">Get Predictions</button>
      </div>
      {loading && <p>Loading...</p>}
      {message && <p className="text-red-500">{message}</p>}
      {training && <p className="text-blue-500">{trainMessage}</p>}
      {predictionMessage && <p className="text-green-500">{predictionMessage}</p>}
      {data.length > 0 && (
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
                <td className="border p-2">{item.Close}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
              {predictions.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.Date}</td>
                  <td className="border p-2">{item.Action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
