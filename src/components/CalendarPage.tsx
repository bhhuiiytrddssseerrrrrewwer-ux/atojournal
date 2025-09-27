import React from 'react';
import CalendarView from './CalendarView';

const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Calendar</h2>
      <CalendarView />
    </div>
  );
};

export default CalendarPage;


