import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getAllHostels } from "../../slices/hostelSlice";

const HostelSelectionPage = () => {
  const dispatch = useDispatch();
  const { hostels, loading } = useSelector((state) => state.hostel);

  useEffect(() => {
    dispatch(getAllHostels());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-ink-2 rounded-sm w-1/3 mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-ink-2 rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-paper py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs text-beacon tracking-[0.25em] uppercase">
              ( Hostels )
            </span>
            <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-paper">
            Select your hostel
          </h1>
          <p className="mt-3 text-dim max-w-xl">
            Mess menus, notices, complaints and officials — pick your block.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.map((hostel, i) => (
            <Link to={`/hostels/${hostel.hostel_id}`} key={hostel.hostel_id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group bg-ink-2 rounded-sm p-6 border border-ink-line hover:border-beacon transition-colors duration-300 h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs text-dim tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-dim group-hover:text-beacon transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-paper mt-4 mb-3 group-hover:text-beacon transition-colors duration-300">
                  {hostel.hostel_name}
                </h2>
                <p className="text-dim text-sm">
                  Click to view hostel details, mess menu, and more.
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostelSelectionPage;
