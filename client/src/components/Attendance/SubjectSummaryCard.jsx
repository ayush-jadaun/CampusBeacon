import React from "react";
import { FiBarChart2 } from "react-icons/fi";
import LoadingSpinner from "../../utils/LoadingSpinner"; // Adjust path
import ErrorDisplay from "../../utils/ErrorDisplay"; // Adjust path

const SubjectSummaryCard = ({
    themeStyles,
    errorPercentage,
    onRetryDetailed,
    loadingPercentage,
    percentageData,
}) => {
    return (
        <div
            className={`${themeStyles.cardBg} rounded-sm p-5 border ${themeStyles.borderColor} sticky top-4`}
        >
            <h3
                className={`font-display text-lg font-semibold mb-4 ${themeStyles.headingColor} flex items-center`}
            >
                <FiBarChart2 className="mr-2 text-beacon" /> Summary (Selected Subject)
            </h3>
            {errorPercentage && (
                <ErrorDisplay
                    error={errorPercentage}
                    onRetry={onRetryDetailed}
                    messagePrefix="Subject Summary Error: "
                />
            )}
            {loadingPercentage && !percentageData && <LoadingSpinner />}
            {!loadingPercentage || percentageData ? (
                percentageData ? (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-xs uppercase tracking-widest text-dim">
                                Overall Percentage:
                            </span>
                            <span
                                className={`font-display font-semibold text-lg ${
                                    percentageData.percentage >= 75
                                        ? "text-green-400"
                                        : percentageData.percentage >= 50
                                        ? "text-beacon"
                                        : "text-red-400"
                                }`}
                            >
                                {percentageData.percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-ink-3 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${
                                    percentageData.percentage >= 75
                                        ? "bg-green-500"
                                        : percentageData.percentage >= 50
                                        ? "bg-beacon"
                                        : "bg-red-500"
                                }`}
                                style={{ width: `${percentageData.percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-dim">Total Present:</span>
                            <span className="font-medium text-green-400">
                                {percentageData.presentDays}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dim">Total Absent:</span>
                            <span className="font-medium text-red-400">
                                {percentageData.absentDays}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-ink-line pt-2 mt-2">
                            <span className="text-dim">Total Marked:</span>
                            <span className="font-medium text-paper">
                                {percentageData.totalDays}
                            </span>
                        </div>
                    </div>
                ) : (
                    !errorPercentage && (
                        <p className="text-sm text-dim italic text-center py-4">
                            No overall attendance data for this subject yet.
                        </p>
                    )
                )
            ) : null}
        </div>
    );
};

export default SubjectSummaryCard;
