import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { defaultStoreHours, getStoreStatus, StoreStatus } from '../data/schedule';
import { StoreScheduleModal } from './StoreScheduleModal';

interface StoreStatusBadgeProps {
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function StoreStatusBadge({ compact = false, className = '', showIcon = true }: StoreStatusBadgeProps) {
  const [status, setStatus] = useState<StoreStatus>(() => getStoreStatus(defaultStoreHours));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Update status every 30 seconds
    const interval = setInterval(() => {
      setStatus(getStoreStatus(defaultStoreHours));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 ${
          status.isOpen
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm shadow-emerald-500/10'
            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 shadow-sm shadow-rose-500/10'
        } ${compact ? 'px-2 py-0.5 text-[11px] sm:text-xs rounded-full' : 'px-3 py-1.5 text-xs sm:text-sm rounded-full font-semibold'} ${className}`}
      >
        {/* Pulsing Dot */}
        <span className="relative flex h-2 w-2">
          {status.isOpen ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </>
          )}
        </span>

        {showIcon && <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80" />}

        <span className="font-bold tracking-tight">
          {status.isOpen ? 'Abierto' : 'Cerrado'}
        </span>

        {!compact && (
          <span className="text-[11px] opacity-75 font-normal hidden lg:inline border-l border-current/20 pl-2">
            {status.isOpen ? status.subText : status.nextEventText}
          </span>
        )}
      </button>

      {/* Schedule Modal */}
      <StoreScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
