import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award, TrendingUp, Target, AlertTriangle } from "lucide-react";
import SubjectCard from "./SubjectCard";
import StatsCard from "./StatsCard";
import AttendanceChart from "./AttendanceChart";
import TimeDisplay from "./TimeDisplay";
import { useAttendanceContext } from "../../contexts/attendanceContext";

const DashboardView = ({
  subjects,
  calculateStats,
  onAddSubject,
  onEditSubject,
  onRemoveSubject,
  defaultOptions,
}) => {
  const {
    getAttendanceRecords,
    loading,
    error,
    currentDateTime,
    currentUser,
    refreshUserSubjects,
  } = useAttendanceContext();

  const [trendData, setTrendData] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Calculate monthly attendance data
  const calculateMonthlyData = useCallback((records) => {
    if (!records || records.length === 0) return 0;
    const presentClasses = records.filter(
      (record) => record.status === "Present"
    ).length;
    return parseFloat(((presentClasses / records.length) * 100).toFixed(1));
  }, []);

  // Filter records by month and year
  const filterRecordsByMonth = useCallback((records, month, year) => {
    if (!records) return [];
    return records.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === month - 1 && recordDate.getFullYear() === year
      );
    });
  }, []);

  // Get default trend data
  const getDefaultTrendData = useCallback(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        attendance: 0,
      };
    }).reverse();
  }, []);

  // Fetch attendance trend data
  const fetchAttendanceTrend = useCallback(async () => {
    try {
      // Generate last 6 months data points
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString("default", { month: "short" }),
          year: date.getFullYear(),
          monthNum: date.getMonth() + 1,
        };
      }).reverse();

      if (!subjects?.length) {
        setTrendData(
          lastSixMonths.map(({ month }) => ({
            month,
            attendance: 0,
          }))
        );
        return;
      }

      // Fetch records for all subjects
      const allSubjectsRecords = await Promise.all(
        subjects.map(async (subject) => {
          try {
            const records = await getAttendanceRecords(subject.id);
            return { subjectId: subject.id, records: records || [] };
          } catch (error) {
            console.error(`Error fetching records for ${subject.name}:`, error);
            return { subjectId: subject.id, records: [] };
          }
        })
      );

      // Calculate monthly averages
      const monthlyAverages = lastSixMonths.map(({ month, year, monthNum }) => {
        let totalAttendance = 0;
        let validSubjects = 0;

        allSubjectsRecords.forEach(({ records }) => {
          const monthlyRecords = filterRecordsByMonth(records, monthNum, year);
          if (monthlyRecords.length > 0) {
            totalAttendance += calculateMonthlyData(monthlyRecords);
            validSubjects++;
          }
        });

        return {
          month,
          attendance:
            validSubjects > 0
              ? parseFloat((totalAttendance / validSubjects).toFixed(1))
              : 0,
        };
      });

      setTrendData(monthlyAverages);
    } catch (error) {
      console.error("Error calculating trend data:", error);
      setFetchError("Failed to load attendance trend data");
      setTrendData(getDefaultTrendData());
    }
  }, [
    subjects,
    getAttendanceRecords,
    filterRecordsByMonth,
    calculateMonthlyData,
    getDefaultTrendData,
  ]);

  // Calculate dashboard statistics
  const calculateDashboardStats = useCallback(() => {
    if (!subjects?.length) {
      return {
        bestSubject: null,
        averageAttendance: 0,
        goalsMet: 0,
      };
    }

    try {
      // Find best performing subject
      const bestSubject = [...subjects].sort((a, b) => {
        const statA = calculateStats(a).attendancePercent;
        const statB = calculateStats(b).attendancePercent;
        return statB - statA;
      })[0];

      // Calculate average attendance
      const totalAttendance = subjects.reduce(
        (sum, subject) => sum + calculateStats(subject).attendancePercent,
        0
      );
      const averageAttendance = parseFloat(
        (totalAttendance / subjects.length).toFixed(1)
      );

      // Calculate goals met
      const goalsMet = subjects.filter(
        (subject) => calculateStats(subject).attendancePercent >= subject.goal
      ).length;

      return { bestSubject, averageAttendance, goalsMet };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      return { bestSubject: null, averageAttendance: 0, goalsMet: 0 };
    }
  }, [subjects, calculateStats]);

  // Fetch trend data when subjects change
  useEffect(() => {
    fetchAttendanceTrend();
  }, [fetchAttendanceTrend]);

  const { bestSubject, averageAttendance, goalsMet } =
    calculateDashboardStats();

  return (
    <div className="space-y-6">
      {/* Error Display */}
      <AnimatePresence>
        {(error || fetchError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{error || fetchError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Subject Button */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddSubject}
          className={`flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          Add Subject
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Award}
          title="Best Subject"
          value={
            bestSubject
              ? `${bestSubject.name} - ${calculateStats(
                  bestSubject
                ).attendancePercent.toFixed(1)}%`
              : "N/A"
          }
          colorClass="from-green-500/20 to-green-600/20 border border-green-500/30"
          loading={loading}
        />
        <StatsCard
          icon={TrendingUp}
          title="Average Attendance"
          value={averageAttendance}
          type="percentage"
          colorClass="from-blue-500/20 to-blue-600/20 border border-blue-500/30"
          loading={loading}
        />
        <StatsCard
          icon={Target}
          title="Goals Met"
          value={`${goalsMet}/${subjects.length} Subjects`}
          colorClass="from-purple-500/20 to-purple-600/20 border border-purple-500/30"
          loading={loading}
        />
      </div>

      {/* Attendance Chart */}
      <AttendanceChart data={trendData} loading={loading} />

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-purple-500/30 bg-purple-900/20 h-48"
            />
          ))
        ) : subjects.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            No subjects added yet. Click "Add Subject" to get started.
          </div>
        ) : (
          subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              stats={calculateStats(subject)}
              onEdit={onEditSubject}
              onRemove={onRemoveSubject}
              defaultOptions={defaultOptions}
            />
          ))
        )}
      </div>

      {/* Time Display */}
      <TimeDisplay
        currentTime={currentDateTime}
        currentUser={currentUser?.login}
      />
    </div>
  );
};

export default DashboardView;
