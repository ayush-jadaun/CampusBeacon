import React from "react";
import { motion } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";
import SubjectStatCard from "./SubjectStatCard";
import LoadingSpinner from "../../utils/LoadingSpinner";
import ErrorDisplay from "../../utils/ErrorDisplay";

const SubjectBreakdownSection = ({
    themeStyles,
    errorSubjectPercentages,
    onRetrySubjectWise,
    loadingSubjectPercentages,
    subjectPercentageList = [],
    userEnrollments = [],
    selectedSubjectId,
    unrollingSubjectId,
    onSubjectSelect,
    onUnenrollSubject,
    unenrollLoading,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${themeStyles.cardBg} rounded-sm p-5 md:p-6 mb-8 border ${themeStyles.borderColor}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2
                    className={`font-display text-xl font-semibold ${themeStyles.headingColor} flex items-center`}
                >
                    <FiBookOpen className="mr-2 text-beacon" /> Subject Breakdown
                </h2>
                <span className="font-mono text-xs uppercase tracking-widest text-dim">
                    {userEnrollments.length} Subject(s)
                </span>
            </div>

            {errorSubjectPercentages && (
                <ErrorDisplay
                    error={errorSubjectPercentages}
                    onRetry={onRetrySubjectWise}
                    messagePrefix="Subject Stats Error: "
                />
            )}
            {loadingSubjectPercentages &&
                subjectPercentageList.length === 0 &&
                userEnrollments.length > 0 && <LoadingSpinner />}
            {!loadingSubjectPercentages &&
                userEnrollments.length > 0 &&
                subjectPercentageList.length === 0 &&
                !errorSubjectPercentages && (
                    <p className="text-sm text-dim italic text-center py-4">
                        No attendance marked for any enrolled subject yet.
                    </p>
                )}

            {userEnrollments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userEnrollments.map((enrollment) => {
                        const stats = subjectPercentageList.find(
                            (p) => p.subjectId === enrollment.id
                        );
                        const isLoadingThisStat = loadingSubjectPercentages && !stats;

                        return (
                            <SubjectStatCard
                                key={enrollment.id}
                                themeStyles={themeStyles}
                                enrollment={enrollment}
                                stats={stats}
                                isLoadingThisStat={isLoadingThisStat}
                                isSelected={selectedSubjectId === enrollment.id.toString()}
                                isUnenrolling={unrollingSubjectId === enrollment.id}
                                onClick={onSubjectSelect}
                                onUnenrollClick={onUnenrollSubject}
                                unenrollLoading={unenrollLoading}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default SubjectBreakdownSection;
