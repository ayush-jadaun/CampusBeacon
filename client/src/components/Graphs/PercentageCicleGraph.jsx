// src/components/Graphs/PercentageCircleGraph.jsx
import React from "react";

const PercentageCircleGraph = ({
  percentage = 0,
  size = 60,
  strokeWidth = 5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let color = "text-red-500"; // Default color (bad attendance)
  if (percentage >= 75) {
    color = "text-green-500";
  } else if (percentage >= 50) {
    color = "text-beacon";
  }

  return (
    <div
      className="relative inline-flex items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <svg className="absolute top-0 left-0" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-ink-3" // Track color
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground Circle (Progress) */}
        <circle
          className={color} // Use dynamic color based on percentage
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from the top
        />
      </svg>
      {/* Percentage Text */}
      <span className={`absolute font-mono text-xs font-medium ${color}`}>
        {`${Math.round(percentage)}%`}
      </span>
    </div>
  );
};

export default PercentageCircleGraph;
