"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react"; // Or similar icons
import React, { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number | null; // Score between 0 and 1
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score !== null) {
      // Animate score
      const targetScore = Math.round(score * 100);
      let currentScore = 0;
      const increment = targetScore / 50; // Animate over 50 steps

      const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          currentScore = targetScore;
          clearInterval(interval);
        }
        setDisplayScore(Math.round(currentScore));
      }, 20); // Adjust interval for animation speed

      return () => clearInterval(interval);
    }
  }, [score]);


  if (score === null) {
    return null;
  }

  const percentageScore = displayScore;
  let interpretation: string;
  let interpretationColor: string;
  let IconComponent: React.ElementType;

  if (percentageScore >= 70) {
    interpretation = "High Similarity";
    interpretationColor = "text-green-600";
    IconComponent = CheckCircle;
  } else if (percentageScore >= 30) {
    interpretation = "Moderate Similarity";
    interpretationColor = "text-yellow-600";
    IconComponent = TrendingUp;
  } else {
    interpretation = "Low Similarity";
    interpretationColor = "text-red-600";
    IconComponent = AlertCircle;
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl transform transition-all duration-500 ease-out scale-95 animate-fadeIn">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-headline">Similarity Score</CardTitle>
        <CardDescription>Based on the textual content of the documents.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-secondary"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary"
              strokeWidth="3.5"
              strokeDasharray={`${percentageScore}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              transform="rotate(-90 18 18)"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-headline text-primary">{percentageScore}%</span>
          </div>
        </div>
        
        <Progress value={percentageScore} className="w-full h-3 [&>div]:bg-primary" />
        
        <div className={`flex items-center text-lg font-medium ${interpretationColor}`}>
          <IconComponent className="w-6 h-6 mr-2" />
          <span>{interpretation}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Add CSS for fadeIn animation if not already present
// You can put this in globals.css or a relevant style block
// @keyframes fadeIn {
//   from { opacity: 0; transform: scale(0.95); }
//   to { opacity: 1; transform: scale(1); }
// }
// .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
// Ensure tailwind.config.js has this animation too if needed.
// For now, simple transition on scale should be fine.
