import React from 'react';
import { JobStatus, UrgencyLevel } from '../types';

interface StatusBadgeProps {
  status?: JobStatus;
  urgency?: UrgencyLevel;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, urgency }) => {
  if (status) {
    const colors = {
      [JobStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [JobStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [JobStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [JobStatus.LATE]: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  }

  if (urgency) {
    const colors = {
      [UrgencyLevel.LOW]: 'bg-green-50 text-green-700 border border-green-200',
      [UrgencyLevel.MEDIUM]: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      [UrgencyLevel.HIGH]: 'bg-red-50 text-red-700 border border-red-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[urgency]}`}>
        {urgency}
      </span>
    );
  }

  return null;
};