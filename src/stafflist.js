import React, { useState, useEffect } from 'react';
import CalendarComponent from './calendarcomponent';  // Adjust path accordingly
import { format } from 'date-fns';
import axios from 'axios';  // Don't forget to import axios
import StaffEditor from './StaffEditor';

function StaffList() {
    const [staffData, setStaffData] = useState({});
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [bookOffDate, setBookOffDate] = useState(new Date());
    const [newStaffName, setNewStaffName] = useState(''); // State to capture the new staff member's name

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/staff-availability`)
            .then(response => {
                setStaffData(response.data);
            })
            .catch(error => {
                console.error("Error fetching staff data:", error);
            });
    }, []);

    
const handleMaxShiftsChange = (staffName, value) => {
    let updatedData = { ...staffData };
    updatedData[staffName].max_shifts = parseInt(value, 10);
    setStaffData(updatedData);
    
    axios.post(`${process.env.REACT_APP_API_URL}/update-max-shifts`, { staffName, maxShifts: value })
        .then(response => {
            console.log('Successfully updated max shifts:', response.data);
        })
        .catch(error => {
            console.error('Error updating max shifts:', error);
        });
// You may also want to send this updated data to the server or save it elsewhere
};
const handleDateChange = (date, name) => {
        if (!staffData[name]) {
            console.error(`No data found for staff member: ${name}`);
            return;
        }
        const formattedDate = format(date, 'yyyy-MM-dd');
    
        let updatedData = { ...staffData };
    
        if (updatedData[name].booked_off_dates.includes(formattedDate)) {
            updatedData[name].booked_off_dates = updatedData[name].booked_off_dates.filter(d => d !== formattedDate);
        } else {
            updatedData[name].booked_off_dates.push(formattedDate);
        }
    
        setStaffData(updatedData);
    
        axios.post(`${process.env.REACT_APP_API_URL}/update-booked-dates`, updatedData)
            .then(response => {
                console.log('Successfully updated booked dates:', response.data);
            })
            .catch(error => {
                console.error('Error updating booked dates:', error);
            });
    };

    const handleStaffSelect = (staffName) => {
        if (selectedStaff === staffName) {
            setShowDetails(!showDetails);
        } else {
            setSelectedStaff(staffName);
            setShowDetails(true);  // When a new staff is selected, always show the details and calendar
        }
    };

    const addStaffMember = () => {
        if (newStaffName.trim() === '') {
            alert('Please enter a staff name.'); // Basic validation
            return;
        }
        // Assuming the new staff member works all venues and is available every day
        const newStaffData = {
            [newStaffName]: {
                "Bothams": {
                    "lunch": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                    ],
                    "evening": [
                        "Tuesday",
                        "Monday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                    ]
                },
                "Hole": {
                    "evening": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                    ],
                    "lunch": [
                        "Saturday",
                        "Friday"
                    ]
                },
                "booked_off_dates": [
                    "2023-03-28",
                    "2024-04-04"
                ],
                "max_shifts": 4
            },
        };

        axios.post(`${process.env.REACT_APP_API_URL}/add-staff`, newStaffData)
        .then(response => {
            if (response.data.success) {
                setStaffData({ ...staffData, ...newStaffData });
                setNewStaffName(''); // Clear the input field on successful addition
                console.log('Successfully added new staff member');
            } else {
                console.error('Failed to add new staff member:', response.data.message);
            }
        })
        .catch(error => {
            console.error('Error adding new staff member:', error);
        });
};


const handleUpdateStaffData = (staffName, updatedData) => {
    // Update local state to include the updated staff data
    setStaffData(prevData => ({
        ...prevData,
        [staffName]: updatedData // Assuming updatedData includes preferences
    }));
    
    // Send updated data to server, including preferences within updatedData
    axios.post(`${process.env.REACT_APP_API_URL}/update-staff-availability`, {
        staffName: staffName,
        updatedData: updatedData // Ensure this includes preferences
    })
    .then(response => {
        if (response.data.success) {
            console.log('Successfully updated staff availability on the server');
            // You may also want to update UI or confirm to the user that the update was successful
        } else {
            console.error('Failed to update staff availability:', response.data.message);
        }
    })
    .catch(error => {
        console.error('Error updating staff availability:', error);
    });
};


    const handleRemoveStaff = (staffName) => {
        // Send a request to the server to remove the staff member
        axios.post(`${process.env.REACT_APP_API_URL}/remove-staff`, { staffName })
            .then(response => {
                if (response.data.success) {
                    console.log(`Successfully removed staff member: ${staffName}`);
                    // Update the state to remove the staff member from the list
                    setStaffData(prevData => {
                        const updatedData = { ...prevData };
                        delete updatedData[staffName];
                        return updatedData;
                    });
                } else {
                    console.error('Failed to remove staff member:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Error removing staff member:', error);
            });
    };
    
    
    
    return (
        <div>
            <div id="stafflist">
                <h2>Staff List</h2>
                <ul>
                    {Object.keys(staffData).sort().map(staffName => (
                        <li key={staffName}>
                            <button 
                                onClick={() => handleStaffSelect(staffName)}
                                style={selectedStaff === staffName ? { backgroundColor: 'green', color: 'white' } : {}}
                            >
                                {staffName}
                            </button>
                            {selectedStaff === staffName && showDetails && (
                                <div>
                                    <div className="staff-calendar">
                                        <CalendarComponent 
                                            selectedDate={bookOffDate}
                                            onDateChange={handleDateChange}
                                            name={selectedStaff}
                                            bookedDates={staffData[selectedStaff]?.booked_off_dates || []}
                                        />
                                    </div>
                                    <div id="maxshiftstext">Max Shifts
                                    <input id="maxshiftsinput" type="number" value={staffData[staffName].max_shifts} onChange={(e) => handleMaxShiftsChange(staffName, e.target.value)} />
                                    </div>
                                    {/* Pass only the selected staff's data to the StaffEditor */}
                                    <StaffEditor 
                                        staffData={staffData[selectedStaff]} 
                                        staffName={selectedStaff}
                                        onUpdateStaffData={handleUpdateStaffData}
                                        onRemoveStaff={handleRemoveStaff}
                                    />

                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                <div id="add-staff-section">
                <input
                    type="text"
                    placeholder="Enter new staff name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                />
                <button id="addStaffButton" onClick={addStaffMember}>Add Staff Member</button>
            </div>
            </div>
        </div>
    );
    
    
                            }
    
    export default StaffList;
