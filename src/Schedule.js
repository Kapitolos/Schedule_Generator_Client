import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; // Assuming you're using react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Don't forget the CSS for the DatePicker
import { startOfWeek, endOfWeek, format, addDays, isWithinInterval } from 'date-fns';
import StaffShiftSummary from './StaffShiftSummary';  // Adjust path accordingly
import SaveScheduleButton from './SaveScheduleButton';  // Adjust path accordingly
import RestrictedSlotsEditor from './RestrictedSlotsEditor';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Function to reorder the staff in the schedule
const reorder = (schedule, source, destination) => {
    const current = [...(schedule[source.droppableId][source.index] || [])];
    const next = [...(schedule[destination.droppableId][destination.index] || [])];
    const target = current[source.index];
  
    // Move the staff member from the source slot to the destination slot
    schedule[source.droppableId].splice(source.index, 1);
    schedule[destination.droppableId].splice(destination.index, 0, target);
  
    return schedule;
  };


function Schedule({ currentSchedule, setCurrentSchedule, startDate, setStartDate, staffData, setStaffData }) {
    const [selectedStaff, setSelectedStaff] = useState(null);
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const slots = ["Lunch1", "Lunch2","Lunch3", "Bothams1", "Bothams2", "Bothams3", "Bothams4", "Hole1", "Hole2","Runner 1", "Runner 2", "Runner 3"];

    // At the beginning of the Schedule component, add a new state for restrictedSlots
const [restrictedSlots, setRestrictedSlots] = useState({});

    // State to manage the visibility of the RestrictedSlotsEditor
    const [showRestrictedSlotsEditor, setShowRestrictedSlotsEditor] = useState(false);

    // Toggle function
    const toggleRestrictedSlotsEditor = () => {
        setShowRestrictedSlotsEditor(prevState => !prevState);
    };



    const areEnoughShiftsAvailable = () => {
        const totalShifts = slots.length * daysOfWeek.length;
        const totalMaxShifts = Object.values(staffData).reduce((acc, staff) => acc + staff.max_shifts, 0);
        return totalMaxShifts <= totalShifts;
    };
      const onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const updatedSchedule = reorder(
      currentSchedule,
      source,
      destination
    );

    setCurrentSchedule(updatedSchedule);
  };

    // Function to determine if a cell should be highlighted
const shouldHighlight = (staffName) => selectedStaff === staffName;
    


    const handleDateChange = (date) => {
        // Check if selected date is within the current week
        const start = startOfWeek(startDate, { weekStartsOn: 1 });
        const end = endOfWeek(startDate, { weekStartsOn: 1 });
        
        if (!isWithinInterval(date, { start, end })) {
            setStartDate(startOfWeek(date, { weekStartsOn: 1 }));
        }
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/staff-availability`)
            .then(response => response.json())
            .then(data => {
                setStaffData(data);
                // console.log('Fetched staff data:', data);
            })
            .catch(error => {
                console.error("Error fetching staff availability data:", error);
            });

        axios.get(`${process.env.REACT_APP_API_URL}/restricted-slots`)
            .then(response => {
                // Set the restricted slots state with the fetched data
                // Adjust your state structure accordingly
                setRestrictedSlots(response.data);
            })
            .catch(error => {
                console.error("Error fetching restricted slots:", error);
            });
    }, []);
    
    // Function to update restricted slots on the server
const updateRestrictedSlots = (updatedSlots) => {
    axios.post(`${process.env.REACT_APP_API_URL}/restricted-slots`, updatedSlots)
      .then(response => {
        if (response.data.success) {
          setRestrictedSlots(updatedSlots); // Update state with new slots
        }
      })
      .catch(error => {
        console.error("Error updating restricted slots:", error);
      });
  };

const isStaffAvailable = (staff, venue, shift, day) => {
    // Initial check for staff data existence
    if (!staffData[staff]) {
        console.log(`Staff data for ${staff} does not exist.`);
        return false;
    }
    
    // Check for venue existence in staff data
    if (!staffData[staff][venue]) {
        console.log(`Venue data for ${staff} at ${venue} does not exist.`);
        return false;
    }
    
    // Check for shift existence in staff data at the venue
    if (!staffData[staff][venue][shift]) {
        console.log(`Shift data for ${staff} at ${venue} during ${shift} does not exist.`);
        return false;
    }

    // Check if the staff is available on the specified day
    const available = staffData[staff][venue][shift].includes(day);
    if (!available) {
        // console.log(`Staff ${staff} is not available for ${venue} during ${shift} on ${day}.`);
    } else {
        // console.log(`Staff ${staff} is available for ${venue} during ${shift} on ${day}.`);
    }
    
    return staffData[staff][venue][shift].includes(day);
};




const isStaffBookedOff = (staffName, date) => {
    // Ensure date is a valid Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        console.error(`Invalid date passed for ${staffName}:`, date);
        return false; // Consider the staff not booked off if the date is invalid
    }
    
    const formattedDate = format(dateObj, 'yyyy-MM-dd');
    if (staffData[staffName] && staffData[staffName].booked_off_dates) {
        return staffData[staffName].booked_off_dates.includes(formattedDate);
    }
    return false;
};

    // Function to find the next occurrence of a day of the week (e.g., "Saturday") from a reference date
const getNextDayOfWeek = (dayName, referenceDate = new Date()) => {
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
    const resultDate = new Date(referenceDate.getTime());
    resultDate.setDate(referenceDate.getDate() + ((7 + dayOfWeek - referenceDate.getDay()) % 7));
    return resultDate;
};
    

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        // console.log("ARRAY " + array);
        return array;
    }
  

    const isScheduleFull = (schedule, restrictedSlots) => {
        for (let slot in schedule) {
            for (let day of daysOfWeek) {
                // Check if the day for the slot is listed in the restrictedSlots JSON (indicating it's available for scheduling)
                const isAvailableForScheduling = restrictedSlots[slot] ? restrictedSlots[slot].includes(day) : false;
                
                // If the slot for this day is not filled, but the day is available for scheduling, then the schedule is not full
                if (!schedule[slot][day] && isAvailableForScheduling) {
                    console.log(`Slot ${slot} on ${day} is empty but available for scheduling.`);
                    return false;
                }
            }
        }
        // console.log("Schedule is considered full.");
        return true;
    };

    useEffect(() => {
        if (isScheduleFull(currentSchedule, restrictedSlots)) {
            // console.log('Schedule is full');
        } else {
            const updatedSchedule = BenFill({...currentSchedule}, slots, daysOfWeek); // Clone currentSchedule to ensure immutability
            setCurrentSchedule(updatedSchedule); // Set the updated schedule to trigger a re-render
            // console.log('Schedule is not full, BEN applied');
        }
    }, [currentSchedule]); // React will re-run this effect if currentSchedule changes
    


function isRestricted(slot, day, restrictedSlots) {
    if (!restrictedSlots || !restrictedSlots[slot]) return false; // Not restricted if data is missing
    return restrictedSlots[slot].includes(day);
}


        

        const isSlotActiveOnDay = (slot, day) => {
    if (restrictedSlots[slot]) {
        return restrictedSlots[slot].includes(day);
    }
    return true;  // For non-restricted slots
};


const processPreferences = (currentSchedule, staffData, slots) => {
    // console.log('Processing preferences...');
    // console.log("Current sched before pref push ",currentSchedule)
    let filledSlots = new Set(); // Track filled slots

    Object.entries(staffData).forEach(([staffName, staffDetails]) => {
        staffDetails.preferences.forEach(({ venue, shift, day }) => {
            // console.log(`${staffName} has a preference for ${venue} on ${day} during ${shift}`);

            // Determine the slot prefix based on the shift preference
            let slotPrefix;
            if (shift === 'lunch') {
                slotPrefix = 'Lunch'; // Assuming lunch slots are prefixed with "Lunch"
                // console.log("lunch? " + slotPrefix);
            } else {
                slotPrefix = venue; // For evening shifts, use the venue name as the prefix
                // console.log("No lunch? " + slotPrefix);
            }

            // Filter slots to find those that match the staff's preference for the venue and shift
            const matchingSlots = slots.filter(slot => slot.startsWith(slotPrefix));
            // console.log("Matching Slots: ", matchingSlots);

            // Attempt to assign the staff to one of the matching slots if available
            let assigned = false;
            for (let matchingSlot of matchingSlots) {
                // Check if slot for the day is empty and staff is available and not booked off
                const currentDayDate = addDays(startDate, daysOfWeek.indexOf(day));
                if (currentSchedule[matchingSlot][day] === "" && isStaffAvailable(staffName, venue, shift, day) && !isStaffBookedOff(staffName, currentDayDate)) {
                    currentSchedule[matchingSlot][day] = staffName;
                    // This is not exactly it
                    // staffData[staffName].max_shifts += 1;
                    // console.log(`Assigned ${staffName} to matching slot: ${matchingSlot} on ${day}`);
                    filledSlots.add(`${matchingSlot}_${day}`);
                    // console.log("FILLED");
                    assigned = true;
                    break; // Stop searching once a match is found and assigned
                }
            }

            if (!assigned) {
                console.log(`Unable to assign ${staffName} to preferred slot at ${venue} for ${shift} on ${day}.`);
            }
        });
    });
    // console.log("Filled slots through preferences:", filledSlots);
    // console.log("current sched in function: ", currentSchedule)

    return { filledSlots, currentSchedule };
};





function initializeDays() {
    // Initialize days of the week with empty strings or appropriate structure
    return {
        "Monday": "",
        "Tuesday": "",
        "Wednesday": "",
        "Thursday": "",
        "Friday": "",
        "Saturday": "",
        "Sunday": ""
    };
}


function isBookedOff(staffName, day, staffDetails) {
    // Assuming `day` is in 'YYYY-MM-DD' format and `staffDetails.booked_off_dates` is an array of dates in the same format
    const bookedOffDates = staffDetails.booked_off_dates || [];

    // Check if the day is within the staff's booked-off dates
    return bookedOffDates.includes(day);
}

// THIS IS IN USE AND NOT FINISHED AT ALL
function validateAndCorrectMaxShifts(staffData, currentSchedule, filledSlots) {
    Object.keys(staffData).forEach(staff => {
        const assignedShifts = countAssignedShifts(staff, currentSchedule); // Implement this based on your schedule structure
        const maxShifts = staffData[staff].max_shifts;

        if (assignedShifts > maxShifts) {
            // Logic to reallocate excess shifts
        } else if (assignedShifts < maxShifts) {
            // Logic to fill missing shifts, respecting filledSlots
        }
    });
}

// Assuming a simple count function based on your schedule's structure
function countAssignedShifts(staff, schedule) {
    let count = 0;
    Object.keys(schedule).forEach(slot => {
        Object.values(schedule[slot]).forEach(day => {
            if (day === staff) count++;
        });
    });
    return count;
}


// Initialize scheduled shifts count based on preferences
const scheduledShiftsCount = initializeScheduledShiftsCount(staffData, currentSchedule);

function initializeScheduledShiftsCount(staffData, schedule) {
    let count = {};
    Object.keys(staffData).forEach(staff => {
        count[staff] = 0; // Initialize count
    });

    // Count preferenced shifts as scheduled
    Object.values(schedule).forEach(daySlots => {
        Object.values(daySlots).forEach(assignment => {
            if (assignment && count.hasOwnProperty(assignment)) {
                count[assignment]++;
            }
        });
    });

    return count;
}


// PASTE
const buildSchedule = () => {
    let currentSchedule = {};
    let filledSlots = new Set(); // Initialize filled slots
    let attempts = 10;
    const MAX_ATTEMPTS = 100;

    do {
        const scheduled = {};

        // Initialize all slot-day combinations
        slots.forEach(slot => {
            currentSchedule[slot] = {};
            daysOfWeek.forEach(day => {
                currentSchedule[slot][day] = "";
            });
        });

        // validateAndCorrectMaxShifts(staffData, currentSchedule, filledSlots);

        // Process staff preferences first
        ({ filledSlots, currentSchedule } = processPreferences(currentSchedule, staffData, slots));
        // console.log("Filled Slots after preferences:", filledSlots);
        // Ensure scheduled reflects preferences assignments
Object.keys(currentSchedule).forEach(slot => {
    daysOfWeek.forEach(day => {
        const staffName = currentSchedule[slot][day];
        if (staffName) {
            scheduled[staffName] = [...(scheduled[staffName] || []), day]; // Update scheduled with preference assignments
        }
    });
});
// console.log("Scheduled after preferences processed:", scheduled);


       // Process restricted slots
for (let slot in restrictedSlots) {
    restrictedSlots[slot].forEach(day => {
        // console.log("All staff before filtering:", Object.keys(staffData));
        
        // Filter staff members based on max shifts and whether they're already scheduled for the day
    
        let staffMembers = shuffleArray(Object.keys(staffData).filter(staff => {
            const hasNotReachedMaxShifts = !scheduled[staff] || (scheduled[staff] && scheduled[staff].length < staffData[staff].max_shifts);
            const isNotScheduledToday = !scheduled[staff] || !scheduled[staff].includes(day);
            const slotDayIdentifier = `${slot}_${day}`;
            const isNotFilledBasedOnPreferences = !filledSlots.has(slotDayIdentifier);

            // Log the reasoning for inclusion or exclusion
            // console.log(`${staff} - hasNotReachedMaxShifts: ${hasNotReachedMaxShifts}, isNotScheduledToday: ${isNotScheduledToday}, isNotFilledBasedOnPreferences: ${isNotFilledBasedOnPreferences}`);

            return hasNotReachedMaxShifts && isNotScheduledToday && isNotFilledBasedOnPreferences;
        }))
        // You may keep the sorting logic here if it's crucial for your application logic
        .sort((a, b) => {
            const shiftsA = currentSchedule[a] ? currentSchedule[a].length : 0;
            const shiftsB = currentSchedule[b] ? currentSchedule[b].length : 0;
            return staffData[b].max_shifts - shiftsB - (staffData[a].max_shifts - shiftsA);
        });

        // console.log("Staff members after filtering:", staffMembers);

        for (let staff of staffMembers) {
            // Given the earlier filtering, these conditions might always be false. 
            // You may not need these checks anymore, but they are kept for safety.
            if (scheduled[staff] && scheduled[staff].length >= staffData[staff].max_shifts) {
                // console.log(`Skipping ${staff} as they have reached their max shifts.`);
                continue;
            }
            if (scheduled[staff] && scheduled[staff].includes(day)) {
                // console.log(`Skipping ${staff} as they are already scheduled for ${day}.`);
                continue;
            }

            let slotDayIdentifier = `${slot}_${day}`;
            if (filledSlots.has(slotDayIdentifier)) {
                // console.log(`Skipping ${slot} on ${day} - already filled based on preferences.`);
                continue;
            }

                    let venue, shift;

                    // Determine venue and shift based on slot
                    if (slot.includes("Lunch1")) {
                        venue = "Bothams"; 
                        shift = "lunch";
                    } else if (slot.includes("Lunch2")) {
                        venue = "Bothams";
                        shift = "lunch";
                    } else if (slot.includes("Hole")) {
                        venue = "Hole";
                        shift = "evening";
                    } else if (slot.includes("Bothams")) {
                        venue = "Bothams";
                        shift = "evening";
                    } else if (slot.includes("Runner 1")) {
                        venue = "Bothams";
                        shift = "Runner 1";
                    } else if (slot.includes("Runner 2")) {
                        venue = "Bothams";
                        shift = "Runner 2";
                    } else if (slot.includes("Runner 3")) {
                        venue = "Bothams";
                        shift = "Runner 3";
                    }
        
                    if (isStaffAvailable(staff, venue, shift, day) && !isStaffBookedOff(staff, addDays(startDate, daysOfWeek.indexOf(day)))) {
                        currentSchedule[slot][day] = staff;
                        if (!scheduled[staff]) scheduled[staff] = [];
                        scheduled[staff].push(day);
                        // console.log(`RES SLOT Assigned ${staff} to ${slot} on ${day}`);
                        break;
                    }
                }
            });
        }

        // Process non-restricted slots
        // Before starting non-restricted slot processing
// Process non-restricted slots
slots.filter(slot => !Object.keys(restrictedSlots).includes(slot)).forEach(slot => {
    daysOfWeek.forEach(day => {
        if (filledSlots.has(`${slot}_${day}`)) {
            // console.log(`Skipping ${slot} on ${day} - already filled during preferences.`);
            return;
        }

        let staffMembers = Object.keys(staffData)
            .filter(staff => {
                const hasNotReachedMaxShifts = !scheduled[staff] || scheduled[staff].length < staffData[staff].max_shifts;
                const isNotScheduledToday = !scheduled[staff] || !scheduled[staff].includes(day);
                return hasNotReachedMaxShifts && isNotScheduledToday;
            })
            .sort((a, b) => {
                const shiftsA = currentSchedule[a] ? currentSchedule[a].length : 0;
                const shiftsB = currentSchedule[b] ? currentSchedule[b].length : 0;
                return (staffData[b].max_shifts - shiftsB) - (staffData[a].max_shifts - shiftsA);
            });

        staffMembers.forEach(staff => {
            // Skip if staff member has already been assigned to their max shifts or is scheduled for the day
            if (scheduled[staff] && scheduled[staff].length >= staffData[staff].max_shifts) return;
            if (scheduled[staff] && scheduled[staff].includes(day)) return;
                    let venue, shift;

                    // Determine venue and shift based on slot
                    if (slot.includes("Lunch1")) {
                        venue = "Bothams"; 
                        shift = "lunch";
                    } else if (slot.includes("Lunch2")) {
                        venue = "Bothams";
                        shift = "lunch";
                    } else if (slot.includes("Hole")) {
                        venue = "Hole";
                        shift = "evening";
                    } else if (slot.includes("Bothams")) {
                        venue = "Bothams";
                        shift = "evening";
                    } else if (slot.includes("Runner 1")) {
                        venue = "Bothams";
                        shift = "Runner 1";
                    } else if (slot.includes("Runner 2")) {
                        venue = "Bothams";
                        shift = "Runner 2";
                    } else if (slot.includes("Runner 3")) {
                        venue = "Bothams";
                        shift = "Runner 3";
                    }

                    if (isStaffAvailable(staff, venue, shift, day) && !isStaffBookedOff(staff, addDays(startDate, daysOfWeek.indexOf(day)))) {
                        currentSchedule[slot][day] = staff;
                        scheduled[staff] = [...(scheduled[staff] || []), day];
                        // console.log(`Assigned ${staff} to ${slot} on ${day}`);
                    }
                });
            });
        });

        attempts++;
    } while (!isScheduleFull(currentSchedule, restrictedSlots) && attempts < MAX_ATTEMPTS);

    // console.log("Final schedule:", JSON.stringify(currentSchedule, null, 2));

    return currentSchedule;
};


// Fill Any empty slots with "Ben" after max attempts reached.
function BenFill(currentSchedule, slots, daysOfWeek) {
for (let slot of slots) {
    for (let day of daysOfWeek) {
        if (!currentSchedule[slot][day] && isSlotActiveOnDay(slot, day)) {
            // console.log("BEN TIME ACTUALLY WORKED")
            currentSchedule[slot][day] = "BEN";
        }
    }
}
  
    return currentSchedule;
};


    // const currentSchedule = buildSchedule();
    // buildSchedule();
        // Now we store the result of buildSchedule() in currentSchedule state
        useEffect(() => {
            setCurrentSchedule(buildSchedule());
          }, [staffData, startDate, restrictedSlots]); // Now useEffect will re-run if restrictedSlots changes
        
        
        return (
            <div>
                <div id="datepicker">
                    
                    <DatePicker 
                        selected={startDate}
                        onChange={handleDateChange}
                        inline
                    />
                </div>
                <div>
                    <StaffShiftSummary schedule={currentSchedule} onStaffClick={setSelectedStaff} />
                </div>
                
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th></th>
                            {daysOfWeek.map((day, index) => (
                                <th key={index}>
                                    {day} {format(addDays(startDate, index), 'MM/dd')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slots.map(slot => {
                            // Log to check if the slot exists in the currentSchedule
                            // console.log(`Schedule for slot ${slot}:`, currentSchedule[slot]);
                            
                            return (
                                <tr key={slot}>
                                    <td>{slot}</td>
                                    {daysOfWeek.map((day, index) => {
                                        // Log to check the day's schedule for the current slot
                                        // console.log(`Schedule for ${day} in slot ${slot}:`, currentSchedule[slot] ? currentSchedule[slot][day] : 'No schedule');
    
                                        const key = `${slot}-${day}`; // Ensuring unique key by combining slot and day
                                        return (
                                            <td key={key} className={currentSchedule[slot] && shouldHighlight(currentSchedule[slot][day]) ? "highlighted" : ""}>
                                                {currentSchedule[slot] ? currentSchedule[slot][day] || "" : ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
    
    export default Schedule;




