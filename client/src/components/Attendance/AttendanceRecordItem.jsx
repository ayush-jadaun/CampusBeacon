import React from "react";
import { FiCheckCircle, FiXCircle, FiEdit2 } from "react-icons/fi";
import { format, parseISO, isValid } from "date-fns";

const AttendanceRecordItem = ({
    themeStyles,
    record,
    onEditClick,
    isActionDisabled,
}) => {
    const handleEdit = () => {
        onEditClick("edit", record);
    };

    return (
        <div
            key={record.id}
            className={`flex items-center justify-between p-3 rounded-sm transition-colors border ${themeStyles.borderColor} bg-ink hover:bg-ink-3`}
        >
            <div className="flex items-center">
                {record.status === "Present" ? (
                    <FiCheckCircle className="text-green-500 mr-3 text-xl flex-shrink-0" />
                ) : (
                    <FiXCircle className="text-red-500 mr-3 text-xl flex-shrink-0" />
                )}
                <div>
                    <p
                        className={`text-sm font-semibold ${
                            record.status === "Present" ? "text-green-400" : "text-red-400"
                        }`}
                    >
                        {record.status}
                    </p>
                    {record.markedAt && isValid(parseISO(record.markedAt)) && (
                        <p className="font-mono text-xs text-dim">
                            Marked at {format(parseISO(record.markedAt), "HH:mm")}
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={handleEdit}
                className={`p-1.5 rounded-sm text-dim hover:text-beacon hover:bg-ink-3 transition-all ${
                    isActionDisabled ? "cursor-not-allowed opacity-50" : ""
                }`}
                title="Edit Attendance Status"
                disabled={isActionDisabled}
            >
                <FiEdit2 size={16} />
            </button>
        </div>
    );
};

export default AttendanceRecordItem;
