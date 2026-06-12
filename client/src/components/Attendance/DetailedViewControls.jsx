import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiPlusCircle, FiLoader } from "react-icons/fi";
import { format } from "date-fns";

const DetailedViewControls = ({
  themeStyles,
  selectedSubject,
  selectedDate,
  onDateChange,
  onMarkTodayClick,
  maxDate,
  isActionDisabled,
}) => {
  const todayDate = format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`${themeStyles.cardBg} rounded-sm p-4 md:p-6 mb-8 border ${themeStyles.borderColor} grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center`}
    >
      <div className="md:col-span-1">
        <h3 className="font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
          Viewing Details For:
        </h3>
        <p
          className="font-display text-lg text-paper font-medium truncate"
          title={selectedSubject?.name}
        >
          {selectedSubject?.name || "..."}
        </p>
        <p className="font-mono text-xs text-dim">
          {selectedSubject?.code || "..."}
        </p>
      </div>

      <div className="md:col-span-1">
        <label
          htmlFor="detailSelectedDate"
          className="block font-mono text-xs uppercase tracking-widest text-dim mb-2"
        >
          Select Date
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim pointer-events-none z-10" />
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            className="relative w-full pl-10 pr-4 py-2.5 rounded-sm bg-ink border border-ink-line focus:border-beacon focus:outline-none transition-colors text-paper placeholder:text-dim cursor-pointer"
            maxDate={maxDate}
            id="detailSelectedDate"
            popperPlacement="bottom-start"
          />
        </div>
      </div>

      <div className="md:col-span-1 flex justify-end items-end h-full">
        <button
          onClick={onMarkTodayClick}
          disabled={isActionDisabled}
          title={`Mark attendance for ${selectedSubject?.name} for ${todayDate}`}
          className={`w-full md:w-auto px-6 py-2.5 rounded-full font-semibold flex items-center justify-center transition-colors duration-300 ${
            isActionDisabled
              ? "bg-ink-3 text-dim cursor-not-allowed"
              : "bg-beacon text-ink hover:bg-beacon-soft"
          }`}
        >
          {isActionDisabled && <FiLoader className="animate-spin mr-2" />}
          {!isActionDisabled && <FiPlusCircle className="mr-2" />}
          Mark for Today
        </button>
      </div>
    </div>
  );
};

export default DetailedViewControls;
