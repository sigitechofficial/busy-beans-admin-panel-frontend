import React from "react";
import { MdCheck } from "react-icons/md";

/**
 * PipelineStepper Component
 * Displays horizontal pipeline progress with steps
 */
export default function PipelineStepper({ pipeline, currentStatus }) {
  // Filter out WON or LOST based on current status
  const visibleSteps = pipeline.filter(step => {
    if (currentStatus === 'LOST') return step.label !== 'WON';
    return step.label !== 'LOST';
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
      <div className="relative flex justify-between items-center min-w-[800px] px-4">
        {/* Background Line */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-0" />
        
        {visibleSteps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative z-10 bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors border-2 ${
              step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
              step.status === 'current' ? 'bg-black border-black text-white' :
              'bg-white border-gray-200 text-gray-500'
            }`}>
              {step.status === 'completed' ? <MdCheck size={16} /> : step.id}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${
              step.status === 'current' ? 'text-black font-bold' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
