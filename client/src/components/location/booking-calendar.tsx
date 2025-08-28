import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from "date-fns";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  startTime: string;
  endTime: string;
  hours: number;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onHoursChange: (hours: number) => void;
  blockedDates?: string[];
  bookedDates?: string[];
  blockedTimeSlots?: Set<string>;
  className?: string;
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  startTime,
  endTime,
  hours,
  onStartTimeChange,
  onEndTimeChange,
  onHoursChange,
  blockedDates = [],
  bookedDates = [],
  blockedTimeSlots = new Set(),
  className
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Add padding days to start on Sunday
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDateStr => {
      try {
        const blockedDate = parseISO(blockedDateStr);
        return isSameDay(date, blockedDate);
      } catch {
        return false;
      }
    });
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDateStr => {
      try {
        const bookedDate = parseISO(bookedDateStr);
        return isSameDay(date, bookedDate);
      } catch {
        return false;
      }
    });
  };

  const hasBlockedTimeSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Check if any time slot for this date is blocked
    for (let hour = 0; hour < 24; hour++) {
      if (blockedTimeSlots.has(`${dateStr}-${hour}`)) {
        return true;
      }
    }
    return false;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateBlocked(date) || isDateBooked(date);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  // Helper function to format time from HH:MM to 12-hour format
  const formatTime = (time: string) => {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (hour === 0) {
      return `12:${minuteStr} AM`;
    } else if (hour < 12) {
      return `${hour}:${minuteStr} AM`;
    } else if (hour === 12) {
      return `12:${minuteStr} PM`;
    } else {
      return `${hour - 12}:${minuteStr} PM`;
    }
  };

  // Helper function to calculate hours difference including half hours
  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return (endMinutes - startMinutes) / 60;
  };



  return (
    <div className={cn("relative", className)} ref={calendarRef}>
      {/* Date Selection Display */}
      <div 
        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <div className="text-lg font-medium text-gray-700">
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select date"}
          </div>
          {selectedDate && startTime && endTime && (
            <div className="text-sm text-gray-600 mt-1">
              {formatTime(startTime)} - {formatTime(endTime)} ({hours} {hours === 1 ? 'hour' : 'hours'})
            </div>
          )}
        </div>
        <div>
          {isOpen ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
          {/* Helper Text */}
          <div className="mb-4 text-sm text-gray-600">
            Select a date and time for your booking
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {/* Day headers */}
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="p-2" />
            ))}
            
            {/* Calendar days */}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isBlocked = isDateBlocked(day);
              const isBooked = isDateBooked(day);
              const isDisabled = isDateDisabled(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={cn(
                    "p-2 text-center rounded-md transition-colors relative",
                    isSelected && "border-2 border-black font-semibold",
                    isDisabled && "text-gray-300 cursor-not-allowed",
                    !isDisabled && !isSelected && "hover:bg-gray-100",
                    (isBlocked || isBooked) && "bg-gray-100"
                  )}
                >
                  {format(day, "d")}
                  {(isBlocked || isBooked) && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full" />
                  )}
                  {hasBlockedTimeSlots(day) && !isBlocked && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Selection */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Select Time</h4>
            
            {/* Time Slots Grid - Only show if there are blocked time slots */}
            {selectedDate && hasBlockedTimeSlots(selectedDate) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Some time slots are unavailable on {format(selectedDate, 'MMM dd')}:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i;
                    const isBlocked = blockedTimeSlots.has(`${format(selectedDate, 'yyyy-MM-dd')}-${hour}`);
                    
                    if (!isBlocked) return null;
                    
                    return (
                      <span
                        key={hour}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium"
                      >
                        {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
                      </span>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Start Time */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    onStartTimeChange(newStartTime);
                    // Calculate new duration using half-hour support
                    if (endTime) {
                      const newHours = calculateHours(newStartTime, endTime);
                      if (newHours > 0) {
                        onHoursChange(newHours);
                      }
                    }
                  }}
                  className="w-full p-2 border rounded-md text-sm"
                  disabled={!selectedDate}
                >
                  {!selectedDate && <option value="">Select a date first</option>}
                  {selectedDate && Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = (i % 2) * 30;
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const isPast = isToday(selectedDate) && (hour < new Date().getHours() || (hour === new Date().getHours() && minute <= new Date().getMinutes()));
                    const isBlocked = blockedTimeSlots.has(`${format(selectedDate, 'yyyy-MM-dd')}-${hour}`);
                    
                    return (
                      <option key={i} value={time} disabled={isPast || isBlocked}>
                        {formatTime(time)}
                        {(isPast || isBlocked) && ' (Unavailable)'}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* End Time */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => {
                    const newEndTime = e.target.value;
                    onEndTimeChange(newEndTime);
                    // Calculate new duration using half-hour support
                    if (startTime) {
                      const newHours = calculateHours(startTime, newEndTime);
                      if (newHours > 0) {
                        onHoursChange(newHours);
                      }
                    }
                  }}
                  className="w-full p-2 border rounded-md text-sm"
                  disabled={!selectedDate || !startTime}
                >
                  {(!selectedDate || !startTime) && <option value="">Select start time first</option>}
                  {selectedDate && startTime && Array.from({ length: 48 }, (_, i) => {
                    const [startHour, startMin] = startTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    
                    const hour = Math.floor(i / 2);
                    const minute = (i % 2) * 30;
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const endMinutes = hour * 60 + minute;
                    
                    const isBeforeStart = endMinutes <= startMinutes;
                    
                    // Check if any hour between start and end is blocked
                    let hasBlockedHour = false;
                    if (selectedDate && !isBeforeStart) {
                      for (let h = startHour; h <= hour; h++) {
                        if (blockedTimeSlots.has(`${format(selectedDate, 'yyyy-MM-dd')}-${h}`)) {
                          hasBlockedHour = true;
                          break;
                        }
                      }
                    }
                    
                    return (
                      <option key={i} value={time} disabled={isBeforeStart || hasBlockedHour}>
                        {formatTime(time)}
                        {isBeforeStart && ' (Invalid)'}
                        {hasBlockedHour && ' (Blocked hours in range)'}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Duration Display */}
              {startTime && endTime && (
                <div className="text-sm text-gray-600 mt-2">
                  Duration: {hours % 1 === 0 ? hours : hours.toFixed(1)} {hours === 1 ? 'hour' : 'hours'}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Partial availability</span>
            </div>
          </div>
          
          {/* Confirm Button */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setIsOpen(false)}
              disabled={!selectedDate || !startTime || !endTime}
              className={cn(
                "w-full py-2 px-4 rounded-md transition-colors font-medium",
                selectedDate && startTime && endTime
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}