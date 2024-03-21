import React from 'react';
import { format, addDays } from 'date-fns';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function SaveScheduleButton({ schedule, startDate }) {

    const getWeekDates = (startDate) => {
        return daysOfWeek.map((day, index) => format(addDays(new Date(startDate), index), 'EEEE MM/dd/yyyy'));
    };

    const downloadSchedule = (formattedStartDate) => {
        // Updated to include the startDate in the request
        const downloadUrl = `${process.env.REACT_APP_API_URL}/download-schedule?date=${formattedStartDate}`;
    
        window.location.href = downloadUrl; // Directly navigate to trigger the download
    };

    const postSchedule = (scheduleData) => {
        const weekDates = getWeekDates(startDate);
        const formattedData = {
            dates: weekDates,
            scheduleData: schedule
        };

        fetch(`${process.env.REACT_APP_API_URL}/save-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedStartDate = format(new Date(startDate), 'yyyy-MM-dd');
                downloadSchedule(formattedStartDate); // Pass the formatted date to downloadSchedule
            } else {
                throw new Error('Schedule was not saved successfully.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const saveSchedule = () => {
        postSchedule(schedule); // Trigger posting the schedule
    };

    return (
        <button id="saveScheduleButton"  onClick={saveSchedule}>Save Schedule</button>
    );
}

export default SaveScheduleButton;
