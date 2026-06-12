import React from "react";
import { FiCalendar, FiPlusCircle } from "react-icons/fi";
import { format } from "date-fns";

const NoRecordsFound = ({
  selectedDate,
  onMarkThisDateClick,
  isActionDisabled,
}) => {
  const handleMarkClick = () => {
    // Calls modal with 'create' mode and the currently selected date
    onMarkThisDateClick("create", null, selectedDate);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
      <FiCalendar size={40} className="text-dim mb-3" />
      <p className="text-dim italic">
        No attendance record found for this subject on{" "}
        {selectedDate
          ? format(selectedDate, "dd MMM yyyy")
          : "the selected date"}
        .
      </p>
      <button
        onClick={handleMarkClick}
        disabled={isActionDisabled}
        className={`mt-4 px-5 py-2 rounded-full text-sm font-semibold flex items-center justify-center transition-colors duration-300 ${
          isActionDisabled
            ? "bg-ink-3 text-dim cursor-not-allowed"
            : "bg-beacon text-ink hover:bg-beacon-soft"
        }`}
      >
        <FiPlusCircle className="mr-1.5" /> Mark for this Date
      </button>
    </div>
  );
};

export default NoRecordsFound;
