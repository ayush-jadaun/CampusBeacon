import React from "react";
import { motion } from "framer-motion";
import { FiPlusSquare } from "react-icons/fi";

const AttendancePageHeader = ({
    onEnrollMoreClick,
    enrollError,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="py-6 md:py-8"
        >
            <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs text-beacon tracking-[0.25em] uppercase">
                    ( Attendance )
                </span>
                <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-semibold text-paper">
                        Attendance Tracker
                    </h1>
                    <p className="text-dim mt-1">Overview of your attendance stats.</p>
                </div>
                {!enrollError && (
                    <button
                        onClick={onEnrollMoreClick}
                        title="Enroll in More Subjects"
                        className="px-5 py-2.5 rounded-full font-semibold bg-beacon text-ink flex items-center justify-center transition-colors duration-300 hover:bg-beacon-soft"
                    >
                        <FiPlusSquare className="mr-2" /> Enroll More
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default AttendancePageHeader;
