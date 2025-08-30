import { useState, useRef, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";

interface BookingDateTimeSelectorProps {
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

export function BookingDateTimeSelector({
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
}: BookingDateTimeSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
        setIsTimeOpen(false);
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
      setIsDateOpen(false);
    }
  };

  const formatTime = (time: string | number) => {
    if (typeof time === 'number') {
      // Handle legacy hour-only format
      if (time === 0) return '12:00 AM';
      if (time < 12) return `${time}:00 AM`;
      if (time === 12) return '12:00 PM';
      return `${time - 12}:00 PM`;
    }
    
    // Handle HH:MM format
    const [hourStr, minuteStr = '00'] = time.split(':');
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

  const calculateHours = (startTime: string, endTime: string) => {
    const parseTime = (time: string) => {
      const [hourStr, minuteStr = '00'] = time.split(':');
      return parseInt(hourStr) * 60 + parseInt(minuteStr);
    };
    
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    return (endMinutes - startMinutes) / 60;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Date Selector */}
      <div className="relative" ref={dateRef}>
        <label className="text-sm font-medium mb-1 block">Date</label>
        <button
          onClick={() => setIsDateOpen(!isDateOpen)}
          className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {selectedDate ? format(selectedDate, "EEE, MMM dd, yyyy") : "Pick a date"}
            </span>
          </div>
        </button>

        {/* Date Dropdown */}
        {isDateOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
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
                const hasPartialBlocks = hasBlockedTimeSlots(day) && !isBlocked;
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      "p-2 text-center rounded-md transition-colors relative",
                      isSelected && "bg-primary text-primary-foreground font-semibold",
                      isDisabled && "text-gray-300 cursor-not-allowed",
                      !isDisabled && !isSelected && "hover:bg-gray-100",
                      (isBlocked || isBooked) && "bg-red-50 text-red-900"
                    )}
                  >
                    {format(day, "d")}
                    {(isBlocked || isBooked) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full" />
                    )}
                    {hasPartialBlocks && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-600 border-t pt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Partial availability</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Selector */}
      <div className="relative" ref={timeRef}>
        <label className="text-sm font-medium mb-1 block">Time</label>
        <button
          onClick={() => setIsTimeOpen(!isTimeOpen)}
          className={cn(
            "w-full flex items-center justify-between p-3 border rounded-lg transition-colors",
            !selectedDate ? "bg-gray-50 cursor-not-allowed" : "hover:bg-gray-50"
          )}
          disabled={!selectedDate}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={cn("text-sm", !selectedDate && "text-gray-400")}>
              {selectedDate && startTime && endTime && hours > 0
                ? `${formatTime(startTime)} - ${formatTime(endTime)} (${hours}${hours === Math.floor(hours) ? '' : '.5'}h)`
                : selectedDate && startTime && endTime
                ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                : "Select start and end time"}
            </span>
          </div>
        </button>

        {/* Time Dropdown */}
        {isTimeOpen && selectedDate && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
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
                >
                  <option value="">Select start time</option>
                  {Array.from({ length: 48 }, (_, i) => {
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
                  disabled={!startTime}
                >
                  {!startTime && <option value="">Select start time first</option>}
                  {startTime && Array.from({ length: 48 }, (_, i) => {
                    const [startHour, startMin] = startTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    
                    const hour = Math.floor(i / 2);
                    const minute = (i % 2) * 30;
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const currentMinutes = hour * 60 + minute;
                    
                    const isBeforeStart = currentMinutes <= startMinutes;
                    
                    // Check if any hour between start and end is blocked
                    let hasBlockedHour = false;
                    if (!isBeforeStart) {
                      const startHourFloor = Math.floor(startMinutes / 60);
                      const endHourFloor = Math.floor(currentMinutes / 60);
                      for (let h = startHourFloor; h < endHourFloor; h++) {
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

              {/* Apply Button */}
              <Button 
                onClick={() => setIsTimeOpen(false)}
                className="w-full"
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}