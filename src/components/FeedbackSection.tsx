import React, { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { StudentFeedback } from "../types";

interface FeedbackSectionProps {
  signedInUser: string | null;
  onNewFeedback: (rating: number, comment: string) => void;
  showNotification: (msg: string) => void;
}

export default function FeedbackSection({
  signedInUser,
  onNewFeedback,
  showNotification,
}: FeedbackSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showNotification("Please select a star rating first.");
      return;
    }
    
    onNewFeedback(rating, comment);
    setSubmitted(true);
    showNotification("Feedback submitted successfully. Thank you!");
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-[#16171D] border border-cyan/20 rounded-2xl text-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
        <CheckCircle className="w-12 h-12 text-cyan mx-auto mb-4 animate-bounce" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-2">
          Feedback Received
        </h3>
        <p className="text-[10px] text-[#A0A2B0] uppercase tracking-wider max-w-md mx-auto leading-relaxed">
          Your response has been synchronized with the developer dashboard. We constantly refine the Codexia consensus architecture based on user evaluation.
        </p>
        <button
          onClick={() => {
            setRating(0);
            setComment("");
            setSubmitted(false);
          }}
          className="mt-6 px-4 py-2 border border-cyan/30 hover:border-cyan text-cyan text-[9px] uppercase tracking-widest rounded-lg transition-all"
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-[#16171D] border border-[#2a2c35] rounded-2xl font-mono relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      
      <div className="flex flex-col space-y-4">
        {/* Rating Stars */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    isFilled 
                      ? "fill-[#E58A3C] text-[#E58A3C]" 
                      : "text-slate-700 hover:text-slate-500"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>

        {/* Comment textarea */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional — what did you find useful or missing?"
            rows={4}
            className="w-full bg-[#0D0E12]/50 border border-[#2a2c35] p-4 rounded-xl font-sans text-xs text-white placeholder-slate-600 focus:border-[#E58A3C] focus:outline-none focus:ring-1 focus:ring-[#E58A3C] transition-colors leading-relaxed"
          />
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#E58A3C] hover:bg-[#d47b2c] text-black font-semibold text-xs rounded-xl cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(229,138,60,0.2)]"
          >
            Submit Feedback
          </button>
          
          <span className="text-[7px] text-slate-500 uppercase tracking-widest">
            AUTHENTICATED AS: {signedInUser || "GUEST"}
          </span>
        </div>
      </div>
    </div>
  );
}
