import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function TestCalendar() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Test blocked dates for July 29-31, 2025
  const blockedDates = [
    new Date(2025, 6, 29), // July 29, 2025
    new Date(2025, 6, 30), // July 30, 2025
    new Date(2025, 6, 31), // July 31, 2025
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Calendar Test - Blocked Dates</h1>
      <p className="mb-4">Testing blocked dates for July 29-31, 2025</p>
      
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(date) => {
          // Disable past dates
          if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
          
          // Disable blocked dates
          return blockedDates.some((blockedDate) => 
            blockedDate.getFullYear() === date.getFullYear() &&
            blockedDate.getMonth() === date.getMonth() &&
            blockedDate.getDate() === date.getDate()
          );
        }}
        modifiers={{
          blocked: (date) => {
            return blockedDates.some((blockedDate) => 
              blockedDate.getFullYear() === date.getFullYear() &&
              blockedDate.getMonth() === date.getMonth() &&
              blockedDate.getDate() === date.getDate()
            );
          }
        }}
        modifiersClassNames={{
          blocked: 'blocked-date'
        }}
        className="rounded-md border"
        defaultMonth={new Date(2025, 6)} // Default to July 2025
      />
      
      <div className="mt-4">
        <p>Selected date: {date ? date.toDateString() : 'None'}</p>
      </div>
      
      <style>{`
        .blocked-date {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
          font-weight: bold;
          opacity: 0.6;
        }
        .blocked-date:hover {
          background-color: #fecaca !important;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}