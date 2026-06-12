import React from "react";
import { format } from "date-fns";
import { FiList } from "react-icons/fi";
import AttendanceRecordItem from "./AttendanceRecordItem";
import NoRecordsFound from "./NoRecordsFound";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";

const DailyRecordsList = ({
  themeStyles,
  selectedDate,
  attendError,
  onRetryDetailed,
  attendLoading,
  records = [],
  onEditRecordClick,
  onMarkThisDateClick,
  isActionDisabled,
}) => {
  const sortedRecords = [...records].sort((a, b) =>
    a.markedAt && b.markedAt ? new Date(a.markedAt) - new Date(b.markedAt) : 0
  );

  return (
    <div
      className={`${themeStyles.cardBg} rounded-sm p-5 md:p-6 border ${themeStyles.borderColor} min-h-[300px] flex flex-col`}
    >
      <h3
        className={`font-display text-lg font-semibold mb-4 ${themeStyles.headingColor} flex items-center`}
      >
        <FiList className="mr-2 text-beacon" /> Records for{" "}
        {selectedDate
          ? format(selectedDate, "eee, dd MMM yyyy")
          : "Selected Date"}
      </h3>

      {attendError && (
        <ErrorDisplay
          error={attendError}
          onRetry={onRetryDetailed}
          messagePrefix="Records Error: "
        />
      )}

      {attendLoading && records.length === 0 && <LoadingSpinner />}

      {!attendError && !attendLoading && records.length === 0 && (
        <NoRecordsFound
          themeStyles={themeStyles}
          selectedDate={selectedDate}
          onMarkThisDateClick={onMarkThisDateClick}
          isActionDisabled={isActionDisabled}
        />
      )}

      {!attendError && records.length > 0 && (
        <div className={`space-y-2 ${attendLoading ? "opacity-60" : ""}`}>
          {sortedRecords.map((record) => (
            <AttendanceRecordItem
              key={record.id}
              themeStyles={themeStyles}
              record={record}
              onEditClick={onEditRecordClick}
              isActionDisabled={isActionDisabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyRecordsList;
