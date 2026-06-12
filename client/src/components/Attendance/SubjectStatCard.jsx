import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { FiLoader, FiTrash2 } from "react-icons/fi";
import LoadingSpinner from "../../utils/LoadingSpinner";
const PercentageCircleGraph = React.lazy(() => import("../Graphs/PercentageCicleGraph"));

const SubjectStatCard = ({
    themeStyles,
    enrollment,
    stats,
    isLoadingThisStat,
    isSelected,
    isUnenrolling,
    onClick,
    onUnenrollClick,
    unenrollLoading,
}) => {
    const handleUnenroll = (e) => {
        e.stopPropagation();
        onUnenrollClick(enrollment.id);
    };

    const handleCardClick = () => {
        if (!isUnenrolling) {
            onClick(enrollment.id);
        }
    };

    return (
        <motion.div
            layout
            whileHover={
                !isUnenrolling ? { scale: 1.03, transition: { duration: 0.15 } } : {}
            }
            className={`p-4 rounded-sm border transition-all relative overflow-hidden group ${
                isSelected
                    ? "bg-beacon/10 border-beacon"
                    : `bg-ink border-ink-line ${
                            isUnenrolling
                                ? "opacity-50 cursor-default"
                                : "hover:border-beacon/60 cursor-pointer"
                        }`
            }`}
        >
            <div onClick={handleCardClick} className="cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-2">
                        <h4
                            className="font-semibold text-paper truncate"
                            title={enrollment.name}
                        >
                            {enrollment.name}
                        </h4>
                        <p className="font-mono text-xs text-dim">{enrollment.code}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Suspense fallback={<LoadingSpinner size="text-xl" />}>
                            {stats && !isLoadingThisStat && (
                                <PercentageCircleGraph
                                    percentage={stats.percentage}
                                    size={40}
                                    strokeWidth={4}
                                    themeStyles={themeStyles}
                                />
                            )}
                            {isLoadingThisStat && <LoadingSpinner size="text-xl" />}
                        </Suspense>
                    </div>
                </div>
                {stats && !isLoadingThisStat && (
                    <div className="text-xs space-y-0.5 text-dim mt-1">
                        <p>
                            Present:{" "}
                            <span className="text-green-400 font-medium">
                                {stats.presentDays}
                            </span>
                        </p>
                        <p>
                            Absent:{" "}
                            <span className="text-red-400 font-medium">
                                {stats.absentDays}
                            </span>
                        </p>
                    </div>
                )}
                {!stats && !isLoadingThisStat && (
                    <p className="text-xs text-dim italic mt-3">No stats yet</p>
                )}
            </div>
            <button
                onClick={handleUnenroll}
                disabled={isUnenrolling || unenrollLoading}
                title={`Unenroll from ${enrollment.name}`}
                className={`absolute top-2 right-2 p-1 rounded-sm text-dim hover:text-red-400 hover:bg-ink-3 transition-all duration-150 z-10
                                     ${
                                         isUnenrolling
                                             ? "opacity-50 cursor-wait"
                                             : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                                     } ${
                    unenrollLoading && !isUnenrolling ? "cursor-not-allowed" : ""
                }`}
            >
                {isUnenrolling ? (
                    <FiLoader className="animate-spin" size={16} />
                ) : (
                    <FiTrash2 size={16} />
                )}
            </button>
        </motion.div>
    );
};

export default SubjectStatCard;
