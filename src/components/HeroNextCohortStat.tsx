import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cohort } from "../types";

interface HeroNextCohortStatProps {
  onClick?: () => void;
}

export default function HeroNextCohortStat({ onClick }: HeroNextCohortStatProps) {
  const [targetCohort, setTargetCohort] = useState<Cohort | null>(null);

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/public/cohorts");
      if (res.ok) {
        const data: Cohort[] = await res.json();
        if (data && data.length > 0) {
          const now = new Date();
          // Filter valid cohorts with start dates
          const validCohorts = data
            .filter(c => c.start_date && (c.status === "enrolling" || c.status === "draft" || c.status === "active"))
            .map(c => ({
              cohort: c,
              startDate: new Date(c.start_date + "T00:00:00")
            }))
            .filter(item => !isNaN(item.startDate.getTime()))
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

          if (validCohorts.length > 0) {
            // Pick closest upcoming or current cohort
            setTargetCohort(validCohorts[0].cohort);
          } else if (data.length > 0) {
            setTargetCohort(data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch public cohorts for hero stat:", err);
    }
  };

  useEffect(() => {
    fetchCohorts();
    // Poll every 5 seconds so when admin creates a cohort in Curriculum Calendar, it auto updates
    const interval = setInterval(fetchCohorts, 5000);
    return () => clearInterval(interval);
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

    const monthNames = ["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
    // JS getMonth(): 0 = Jan, 1 = Feb ... 7 = Aug
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
