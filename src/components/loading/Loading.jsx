import React from "react";
import "./loading.css";

export default function Loading() {
  return (
    <div className="stock-loader-container">
      <div className="stock-loader">
        <div className="stock-bar bar1"></div>
        <div className="stock-bar bar2"></div>
        <div className="stock-bar bar3"></div>
        <div className="stock-bar bar4"></div>
        <div className="stock-bar bar5"></div>
      </div>
      <span className="stock-loader-text">Please Wait !</span>
    </div>
  );
}
