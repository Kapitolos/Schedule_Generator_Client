import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import RestrictedSlotsEditor from './RestrictedSlotsEditor';



const Navbar = ({ onToggleStaffList, schedule, startDate, restrictedSlots, setRestrictedSlots, staffData, setStaffData } ) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const [activeButton, setActiveButton] = useState(null);

    // Restricted Slots editor code
       // State to manage the visibility of the RestrictedSlotsEditor
       const [showRestrictedSlotsEditor, setShowRestrictedSlotsEditor] = useState(false);
   
       // Toggle function
       const toggleRestrictedSlotsEditor = () => {
           setShowRestrictedSlotsEditor(prevState => !prevState);
       };

    const [localRestrictedSlots, setLocalRestrictedSlots] = useState({});

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
    
    
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/restricted-slots`)
            .then(response => {
                setLocalRestrictedSlots(response.data);
            })
            .catch(error => {
                console.error("Error fetching restricted slots:", error);
            });
    }, []);

    const handleToggleDay = (slot, day) => {
        const updatedSlots = { ...localRestrictedSlots };
        if (updatedSlots[slot] && updatedSlots[slot].includes(day)) {
            updatedSlots[slot] = updatedSlots[slot].filter(d => d !== day);
        } else {
            updatedSlots[slot] = [...(updatedSlots[slot] || []), day];
        }
        setLocalRestrictedSlots(updatedSlots);

        // Send update to server immediately
        axios.post(`${process.env.REACT_APP_API_URL}/restricted-slots`, updatedSlots)
            .then(response => {
                if (response.data.success) {
                    console.log('Restricted slots updated successfully!');
                }
            })
            .catch(error => {
                console.error("Error updating restricted slots:", error);
            }
            );
        };




    // Start of save Schedule Button Code
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

        // Function to handle button click
        const handleButtonClick = (buttonName) => {
      // Toggle active state off if the same button is clicked again
      if (activeButton === buttonName) {
        setActiveButton(null);
    } else {
        setActiveButton(buttonName);
    }


            // Additional logic based on the button clicked
            if (buttonName === 'toggleStaffList') {
                onToggleStaffList();
            } else if (buttonName === 'saveSchedule') {
                saveSchedule();
            } else if (buttonName === 'toggleRestrictedSlotsEditor') {
                toggleRestrictedSlotsEditor();
            }
        };


    return (
        <div className="navbar">
        <button className={`navbarButton ${activeButton === 'toggleStaffList' ? 'active' : ''}`} onClick={() => handleButtonClick('toggleStaffList')}>Staff List</button>
        <button className={`navbarButton ${activeButton === 'saveSchedule' ? 'active' : ''}`} onClick={() => handleButtonClick('saveSchedule')}>Save Schedule</button>
        <button className={`navbarButton ${activeButton === 'toggleRestrictedSlotsEditor' ? 'active' : ''}`} onClick={() => handleButtonClick('toggleRestrictedSlotsEditor')}>
            {showRestrictedSlotsEditor ? 'Venue Days' : 'Venue Days'}
        </button>

            {/* Conditionally render the RestrictedSlotsEditor */}
            {showRestrictedSlotsEditor && (
                <RestrictedSlotsEditor
                    restrictedSlots={restrictedSlots}
                    onUpdateRestrictedSlots={updateRestrictedSlots}
                />
            )}
        </div>
    );
            
};

export default Navbar;
