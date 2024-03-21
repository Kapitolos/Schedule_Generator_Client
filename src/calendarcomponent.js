import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CalendarComponent({ selectedDate, onDateChange, name, bookedDates }) {
    // Convert string dates to Date objects
    const highlightedDates = bookedDates.map(dateString => new Date(dateString));
    
    return (
        <div id="calendar">
            <DatePicker 
                selected={selectedDate}
                onChange={date => onDateChange(date, name)} 
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                highlightDates={highlightedDates} // Highlight the booked off dates
                dayClassName={date => 
                    bookedDates.includes(date.toISOString().split('T')[0]) ? "booked-off" : undefined
                }
            />
        </div>
    );
}

export default CalendarComponent;

