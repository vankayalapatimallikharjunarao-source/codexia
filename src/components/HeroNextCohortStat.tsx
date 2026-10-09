import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cohort } from "../types";

interface HeroNextCohortStatProps {
  onClick?: () => void;
}

const DEFAULT_COHORT: Cohort = {
  id: "CODX-2026-10-BASE-01",
  name: "October 2026 Base Cohort",
  track: "base",
  repo_url: "https://github.com/codexia-academy/base-sprint-october-2026",
  documents: [],
  status: "enrolling",
  start_date: "2026-10-15",
  end_date: "2026-10-28",
  year: 2026,
  month: 10,
  sequence: 1,
  capacity: 150
};

export default function HeroNextCohortStat({ onClick }: HeroNextCohortStatProps) {
  const [targetCohort, setTargetCohort] = useState<Cohort>(DEFAULT_COHORT);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCohorts = async () => {
      try {
        const res = await fetch("/api/public/cohorts", { signal: controller.signal });
        if (!isMounted) return;
        if (res.ok) {
          const data: Cohort[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const now = new Date();
            // Filter valid cohorts with start dates
            const validCohorts = data
              .filter(c => c && c.start_date && (c.status === "enrolling" || c.status === "draft" || c.status === "active"))
              .map(c => ({
                cohort: c,
                startDate: new Date(c.start_date + "T00:00:00")
              }))
              .filter(item => !isNaN(item.startDate.getTime()))
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            if (validCohorts.length > 0) {
              // Pick closest upcoming or current cohort, or the latest cohort if all are past
              const upcoming = validCohorts.filter(item => item.startDate.getTime() >= now.getTime());
              if (upcoming.length > 0) {
                setTargetCohort(upcoming[0].cohort);
              } else {
                setTargetCohort(validCohorts[validCohorts.length - 1].cohort);
              }
            } else if (data.length > 0) {
              setTargetCohort(data[0]);
            }
          }
        }
      } catch {
        // Silently preserve current fallback on network error/offline or during restart
      }
    };

    fetchCohorts();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCohorts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchCohorts);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCohorts();
      }
    }, 20000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchCohorts);
    };
  }, []);

  const getDisplayContent = () => {
    if (!targetCohort || !targetCohort.start_date) {
      return {
        title: "NEXT COHORT ANNOUNCING SOON",
        subtitle: "ENROLLMENT OPEN NOW"
      };
    }

    const startDate = new Date(targetCohort.start_date + "T00:00:00");
    if (isNaN(startDate.getTime())) {
      return {
        title: "NEXT COHORT STARTS SOON",
        subtitle: "ENROLLMENT OPEN NOW"
      };
    }

    const allMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthStr = allMonths[startDate.getMonth()];
    const dayStr = startDate.getDate();

    const now = new Date();
    const diffTime = startDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let subtitle = "ENROLLMENT OPEN NOW";
    if (daysLeft > 0 && daysLeft <= 60) {
      subtitle = `ENROLLMENT OPEN NOW · ${daysLeft} DAYS LEFT`;
    } else if (daysLeft <= 0 && daysLeft >= -14) {
      subtitle = "CLASSES STARTING · ENROLLMENT OPEN";
    }

    return {
      title: `NEXT COHORT STARTS ${monthStr} ${dayStr}`,
      subtitle
    };
  };

  const { title, subtitle } = getDisplayContent();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
      }}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="space-y-1.5 pl-4 border-l-2 border-[#2a2c35] hover:border-cyan/50 group cursor-pointer transition-colors duration-300"
      onClick={onClick}
    >
      <div className="font-sans text-lg font-bold text-white uppercase tracking-tight group-hover:text-cyan transition-colors duration-200">
        {title}
      </div>
      <div className="font-mono text-[9px] uppercase text-[#A0A2B0] tracking-widest">
        {subtitle}
      </div>
    </motion.div>
  );
}
