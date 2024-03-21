import React from 'react';

function StaffShiftSummary({ schedule, onStaffClick }) {
    const calculateShifts = () => {
        const shiftCounts = {};

        for (let slot in schedule) {
            for (let day in schedule[slot]) {
                const staffName = schedule[slot][day];
                if (staffName) { // Make sure we have a name, not an empty string
                    if (!shiftCounts[staffName]) {
                        shiftCounts[staffName] = 0;
                    }
                    shiftCounts[staffName]++;
                }
            }
        }

        return shiftCounts;
    };

    const shifts = calculateShifts();
    const sortedStaffNames = Object.keys(shifts).sort();

    // Determine the number of staff names per column
    const numColumns = 5; // As per your grid setup
    const numRowsPerColumn = Math.ceil(sortedStaffNames.length / numColumns);

    // Split the sorted staff names into columns
    const columns = new Array(numColumns).fill().map((_, i) => (
        sortedStaffNames.slice(i * numRowsPerColumn, (i + 1) * numRowsPerColumn)
    ));

    return (
        <div id="staffshiftsummary">
            {/* ... */}
            {columns.map((column, i) => (
                <div key={i} className="staff-shift-column">
                    {column.map(staffName => (
                        <div key={staffName} onClick={() => onStaffClick(staffName)}>
                            {staffName}: {shifts[staffName]} shifts
                        </div>
                    ))}
                    </div>
            ))}
        </div>
    );
}

export default StaffShiftSummary;
