import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import {
  FiX,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiSearch,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fetchSubjects, clearResourcesError } from "../../slices/resourceSlice";
import { enrollInSubject, clearEnrollmentError } from "../../slices/enrollmentSlice";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "transparent",
    border: "none",
    padding: 0,
    overflow: "visible",
    maxWidth: "95vw",
    width: "600px",
    maxHeight: "85vh",
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    backgroundColor: "rgba(14, 17, 22, 0.85)",
    zIndex: 50,
  },
};

Modal.setAppElement("#root");

const EnrollmentModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    subjects: availableSubjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useSelector((state) => state.resource);
  const {
    userEnrollments,
    loading: enrollLoading,
    error: enrollError,
  } = useSelector((state) => state.enrollment);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const userId = user?.id;
  const enrolledSubjectIds = useMemo(() => new Set(userEnrollments.map(s => s.id)), [userEnrollments]);

  const filteredSubjects = useMemo(() => {
    if (!availableSubjects) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(lowerSearchTerm) ||
        subject.code.toLowerCase().includes(lowerSearchTerm)
    );
  }, [availableSubjects, searchTerm]);

  useEffect(() => {
    if (isOpen && (!availableSubjects.length || subjectsError)) {
      dispatch(fetchSubjects());
    }
    return () => {
      if (subjectsError) dispatch(clearResourcesError());
      if (enrollError) dispatch(clearEnrollmentError());
    };
  }, [isOpen, dispatch, availableSubjects.length, subjectsError, enrollError]);

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjectIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const handleEnroll = useCallback(async () => {
    if (!userId || selectedSubjectIds.size === 0) return;

    const subjectsToEnroll = Array.from(selectedSubjectIds);
    const enrollPromises = subjectsToEnroll.map((subjectId) =>
      dispatch(enrollInSubject({ userId, subjectId })).unwrap()
    );

    const results = await Promise.allSettled(enrollPromises);

    let successCount = 0;
    let failureCount = 0;
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            successCount++;
        } else {
            failureCount++;
            console.error("Enrollment failed for a subject:", result.reason);
        }
    });

    if(successCount > 0) {
        toast.success(`Successfully enrolled in ${successCount} subject(s).`);
    }
    if(failureCount > 0) {
        toast.error(`Failed to enroll in ${failureCount} subject(s). Check console or previous messages.`);
    }

    if (successCount > 0) {
       setSelectedSubjectIds(new Set());
       onClose();
    }
  }, [dispatch, userId, selectedSubjectIds, onClose]);

  const handleClose = () => {
     if (subjectsError) dispatch(clearResourcesError());
     if (enrollError) dispatch(clearEnrollmentError());
     setSearchTerm("");
     setSelectedSubjectIds(new Set());
     onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Enroll in Subjects Modal"
      closeTimeoutMS={300}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-ink-2 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] border border-ink-line text-paper p-6 relative overflow-hidden flex flex-col flex-grow"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-dim hover:text-beacon transition-colors z-10"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        <h2 className="font-display text-2xl font-semibold mb-4 text-paper">
          Enroll in Subjects
        </h2>

         <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dim"/>
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-sm bg-ink border border-ink-line focus:border-beacon focus:outline-none transition-colors text-paper placeholder:text-dim"
            />
         </div>

        {subjectsError && (
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1}}
             className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-sm mb-4 text-sm flex items-center"
           >
              <FiAlertCircle className="mr-2 flex-shrink-0"/> Error fetching subjects: {subjectsError}
              <button onClick={() => dispatch(fetchSubjects())} className="ml-auto text-xs underline hover:text-paper">Retry</button>
          </motion.div>
        )}
         {enrollError && (
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1}}
             className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-sm mb-4 text-sm flex items-center"
           >
              <FiAlertCircle className="mr-2 flex-shrink-0"/> Enrollment Error: {enrollError}
          </motion.div>
        )}

        <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-2 min-h-[200px]">
           {subjectsLoading && !filteredSubjects.length && (
                 <div className="flex justify-center items-center h-full">
                    <FiLoader className="animate-spin text-beacon text-3xl" />
                 </div>
           )}
           {!subjectsLoading && !filteredSubjects.length && !subjectsError && (
                 <p className="text-center text-dim italic pt-10">No subjects found{searchTerm ? ' matching your search' : ''}.</p>
           )}

           {filteredSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.has(subject.id);
                const isAlreadyEnrolled = enrolledSubjectIds.has(subject.id);
                return (
                 <div
                    key={subject.id}
                    onClick={() => !isAlreadyEnrolled && handleSubjectToggle(subject.id)}
                    className={`flex items-center justify-between p-3 rounded-sm border transition-all duration-200 ${
                        isAlreadyEnrolled
                        ? 'bg-ink border-ink-line opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-beacon/10 border-beacon'
                        : 'bg-ink border-ink-line hover:border-beacon/60 cursor-pointer'
                    }`}
                 >
                    <div className="flex items-center">
                        {isAlreadyEnrolled ? (
                             <FiCheckSquare className="mr-3 text-green-500 text-xl flex-shrink-0" title="Already Enrolled"/>
                        ) : isSelected ? (
                            <FiCheckSquare className="mr-3 text-beacon text-xl flex-shrink-0"/>
                        ) : (
                             <FiSquare className="mr-3 text-dim text-xl flex-shrink-0"/>
                        )}
                        <div>
                            <p className={`font-medium ${isAlreadyEnrolled ? 'text-dim' : 'text-paper'}`}>{subject.name}</p>
                            <p className="font-mono text-xs text-dim">{subject.code} {isAlreadyEnrolled ? '(Already Enrolled)' : ''}</p>
                        </div>
                    </div>
                 </div>
                 );
            })}

        </div>

        <div className="flex justify-end pt-2 border-t border-ink-line mt-auto">
          <button
            type="button"
            onClick={handleEnroll}
            disabled={enrollLoading || subjectsLoading || selectedSubjectIds.size === 0}
            className={`px-7 py-2.5 rounded-full font-semibold flex items-center justify-center transition-colors duration-300 ${
              enrollLoading || subjectsLoading || selectedSubjectIds.size === 0
                ? "bg-ink-3 text-dim cursor-not-allowed"
                : "bg-beacon text-ink hover:bg-beacon-soft"
            }`}
          >
            {enrollLoading ? (
              <>
                <FiLoader className="animate-spin mr-2" /> Enrolling...
              </>
            ) : (
              <>
                <FiSave className="mr-2" /> Enroll Selected ({selectedSubjectIds.size})
              </>
            )}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default EnrollmentModal;
