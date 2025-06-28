"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [stockName, setStockName] = useState("");
  const [date, setDate] = useState("");
  const [closePrice, setClosePrice] = useState(0);
  const [openPrice, setOpenPrice] = useState(0);
  const [candleType, setCandleType] = useState("G");
  const [volumeChange, setVolumeChange] = useState("B");
  const [submittedData, setSubmittedData] = useState(null);
  const [bullishPattern, setBullishPattern] = useState("");
  const [bearishPattern, setBearishPattern] = useState("");
  const [bullishPricePattern, setBullishPricePattern] = useState("");
  const [bearishPricePattern, setBearishPricePattern] = useState("");
  const [support, setSupport] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [verdict, setVerdict] = useState("");
  const [stopLoss, setStopLoss] = useState(0);
  const [target, setTarget] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState("");
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [movingAverage, setMovingAverage] = useState("");
  const [x, setX] = useState(0);
  const [base, setBase] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimeout = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stockName || !date || !closePrice || !candleType || !volumeChange) {
      alert("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    let photoUrl = "";
    if (photo) {
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("customName", `${stockName}_${date}`);
      const res = await fetch("/api/analysis/upload-photo", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.url;
      } else {
        setApiStatus("Error uploading photo");
        setIsSubmitting(false);
        return;
      }
    }
    setSupport(
      candleType === "G"
        ? parseFloat((parseFloat(openPrice) + parseFloat(closePrice)) / 2)
        : low
    );
    setResistance(
      candleType === "G"
        ? high
        : parseFloat((parseFloat(openPrice) + parseFloat(closePrice)) / 2)
    );
    setVerdict(
      verdictHelper(
        candleType,
        volumeChange,
        movingAverage,
        bullishPattern,
        bearishPattern,
        bullishPricePattern,
        bearishPricePattern
      )
    );
    setStopLoss(calculateStopLoss(verdict, closePrice, support, resistance));
    setTarget(
      candleType === "G"
        ? getBullishTarget(bullishPricePattern, x, base)
        : getBearishTarget(bearishPricePattern, x, base)
    );
    var risk = closePrice - stopLoss;
    var reward = target - closePrice;
    var riskRewardRatio = reward / risk;
    var finalVerdict = riskRewardRatio >= 3 ? "B" : "S";
    const data = {
      stockName,
      date,
      closePrice: parseFloat(closePrice),
      candleType,
      volumeChange,
      movingAverage,
      bullishPattern,
      bearishPattern,
      bullishPricePattern,
      bearishPricePattern,
      x,
      target,
      support,
      resistance,
      verdict,
      stopLoss,
      risk,
      reward,
      riskRewardRatio,
      finalVerdict,
      photoUrl, // add photoUrl to the object
    };
    setSubmittedData(data);
    // API integration
    setApiStatus(null);
    try {
      const res = await fetch("/api/analysis/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setApiStatus("Analysis submitted successfully.");
        handleClear();
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setApiStatus(null), 3500);
      } else {
        const err = await res.json();
        setApiStatus("Error: " + (err.error || "Failed to submit analysis."));
      }
    } catch (err) {
      setApiStatus("Error: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleClear = () => {
    setStockName("");
    setDate("");
    setClosePrice(0);
    setOpenPrice(0);
    setCandleType("G");
    setVolumeChange("B");
    setSubmittedData(null);
    setBullishPattern("");
    setBearishPattern("");
    setBullishPricePattern("");
    setBearishPricePattern("");
    setSupport(0);
    setResistance(0);
    setVerdict("");
    setStopLoss(0);
    setTarget(0);
    setFinalVerdict("");
    setLow(0);
    setHigh(0);
    setMovingAverage("");
    setX(0);
    setBase(0);
  };

  const handleCandleTypeChange = (e) => {
    setCandleType(e.target.value);
    if (candleType === "G") {
      setBearishPattern("");
      setBearishPricePattern("");
    } else {
      setBullishPattern("");
      setBullishPricePattern("");
    }
  };

  const verdictHelper = (
    candleType,
    volumeChange,
    movingAverage,
    bullishPattern,
    bearishPattern,
    bullishPricePattern,
    bearishPricePattern
  ) => {
    let type = candleType === "G" ? "B" : "S";
    const chars = [
      type,
      volumeChange.charAt(0),
      movingAverage.charAt(0),
      bullishPattern.charAt(0),
      bearishPattern.charAt(0),
      bullishPricePattern.charAt(0),
      bearishPricePattern.charAt(0),
    ];
    const allBOrI = chars
      .filter((item) => item !== "" && item != null)
      .every((char) => char && (char === "B" || char === "I"));
    if (allBOrI) return "B";
    const allSOrI = chars.every(
      (char) => char && (char === "S" || char === "I")
    );
    if (allSOrI) return "S";
    return "I";
  };

  const getBullishTarget = (bullishPricePattern, X, base) => {
    switch (bullishPricePattern) {
      case "B-IHS":
        return base + X;
      case "B-DB":
        return base + X / 2;
      case "B-BW":
        return base + X;
      case "B-RB":
        return 5 * X;
      case "B-BMT":
        return 2 * X;
      case "B-UF":
        return base + X;
      case "I":
        return base;
      default:
        return base;
    }
  };

  const getBearishTarget = (bearishPricePattern, X, base) => {
    switch (bearishPricePattern) {
      case "S-HS":
        return base - X;
      case "S-DT":
        return base - X / 2;
      case "S-BW":
        return base - X;
      case "S-DF":
        return base - X;
      case "I":
        return base;
      default:
        return 0;
    }
  };

  const calculateStopLoss = (verdict, close, support, resistance) => {
    if (verdict === "B") {
      if (close < 100) {
        return close * 0.98;
      } else {
        return support - 2;
      }
    } else {
      if (close < 100) {
        return close * 1.02;
      } else {
        return resistance + 2;
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-700 dark:text-gray-200">Loading...</span>
      </div>
    );
  }
  if (!session || !session.user?.adminApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-700 dark:text-gray-200">Contact the admin to approve your request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Stock Data Entry
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-4xl mx-auto"
      >
        <div className="mb-4">
          <label
            htmlFor="stockName"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Stock Name:
          </label>
          <input
            type="text"
            id="stockName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="date"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Date:
          </label>
          <input
            type="date"
            id="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="candleType"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Last Candle Type:
          </label>
          <select
            id="candleType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={candleType}
            onChange={handleCandleTypeChange}
            required
          >
            <option value="G">Last Candle - Green</option>
            <option value="R">Last Candle - Red</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="volumeChange"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Volume Change:
          </label>
          <select
            id="volumeChange"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={volumeChange}
            onChange={(e) => setVolumeChange(e.target.value)}
            required
          >
            <option value="B">Green Candle with Increased Volume</option>
            <option value="S">Red Candle with Increased Volume</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="movingAverage"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Moving Average:
          </label>
          <select
            id="movingAverage"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={movingAverage}
            onChange={(e) => setMovingAverage(e.target.value)}
            required
          >
            <option value="B">Positive Crossover of 5-13 or 5-26</option>
            <option value="S">Negative Crossover of 5-13 or 5-26</option>
            <option value="I">No Crossover</option>
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="openPrice"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Open Price:
          </label>
          <input
            type="number"
            id="openPrice"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={openPrice}
            onChange={(e) => setOpenPrice(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="closePrice"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Close Price:
          </label>
          <input
            type="number"
            id="closePrice"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={closePrice}
            onChange={(e) => setClosePrice(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="high"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            High Price:
          </label>
          <input
            type="number"
            id="high"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={high}
            onChange={(e) => setHigh(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="low"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Low Price:
          </label>
          <input
            type="number"
            id="low"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={low}
            onChange={(e) => setLow(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        {/* Pattern selectors in full width */}
        <div className="md:col-span-2">
          {candleType === "G" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4 border p-4 rounded dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                  Choose Bullish Candlestick Pattern
                </h3>
                <select
                  id="bullishPattern"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={bullishPattern}
                  onChange={(e) => setBullishPattern(e.target.value)}
                  required
                >
                  <option value="B-BP">Bullish Piercing</option>
                  <option value="B-BE">Bullish Engulf</option>
                  <option value="B-HT">Hammer At The Top</option>
                  <option value="B-MS">Morning Star</option>
                  <option value="I">No Pattern</option>
                </select>
              </div>
              <div className="mb-4 border p-4 rounded dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                  Choose Bullish Price Pattern
                </h3>
                <select
                  id="bullishPricePattern"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={bullishPricePattern}
                  onChange={(e) => setBullishPricePattern(e.target.value)}
                  required
                >
                  <option value="B-IHS">Inverted Head And Shoulder</option>
                  <option value="B-DB">Double Bottom</option>
                  <option value="B-BW">Bullish Wedge</option>
                  <option value="B-RB">Rounding Bottom</option>
                  <option value="B-BMT">Breaking Multiple Tops</option>
                  <option value="B-UF">Up Flag</option>
                  <option value="I">No Pattern</option>
                </select>
              </div>
            </div>
          )}
          {candleType === "R" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4 border p-4 rounded dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                  Choose Bearish Candlestick Pattern
                </h3>
                <select
                  id="bearishPattern"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={bearishPattern}
                  onChange={(e) => setBearishPattern(e.target.value)}
                  required
                >
                  <option value="S-BP">Bearish Pearcing</option>
                  <option value="S-BE">Bearish Engulfing</option>
                  <option value="S-ES">Evening Star</option>
                  <option value="S-HM">Hanging Man</option>
                  <option value="I">No Pattern</option>
                </select>
              </div>
              <div className="mb-4 border p-4 rounded dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                  Choose Bearish Price Pattern
                </h3>
                <select
                  id="bearishPricePattern"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={bearishPricePattern}
                  onChange={(e) => setBearishPricePattern(e.target.value)}
                  required
                >
                  <option value="S-HS">Head And Shoulder</option>
                  <option value="S-DT">Double Top</option>
                  <option value="S-BW">Bearish Wedge</option>
                  <option value="S-DF">Down Flag</option>
                  <option value="I">No Pattern</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="mb-6">
          <label
            htmlFor="x"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            X:
          </label>
          <input
            type="number"
            id="x"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={x}
            onChange={(e) => setX(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="base"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Base:
          </label>
          <input
            type="number"
            id="base"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={base}
            onChange={(e) => setBase(parseFloat(e.target.value))}
            required
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="photo"
            className="block text-gray-700 dark:text-gray-200 font-bold mb-2"
          >
            Upload Photo:
          </label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </div>
        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              "Submit"
            )}
          </button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            onClick={handleClear}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            Clear Form
          </button>
        </div>
      </form>
      {submittedData && (
        <div className="mt-4 border p-4 rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Submitted Data:
          </h2>
          <pre className="text-xs text-gray-800 dark:text-gray-200">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
      {apiStatus && apiStatus.includes("successfully") && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-opacity animate-fade-in-out">
          {apiStatus}
        </div>
      )}
      {apiStatus && !apiStatus.includes("successfully") && (
        <div className="mt-2 text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
          {apiStatus}
        </div>
      )}
    </div>
  );
}

/* Add this to your global CSS or tailwind config:
@keyframes fade-in-out {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
.animate-fade-in-out {
  animation: fade-in-out 3.5s ease-in-out;
}
*/
