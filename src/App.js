import React, { useState } from 'react';
import './App.css';
import Navbar from './Navbar';
import StaffList from './stafflist';
import Schedule from './Schedule';
import FireTom from './firetom';
import { startOfWeek, endOfWeek, format, addDays, isWithinInterval } from 'date-fns';

function App() {
    const [showStaffList, setShowStaffList] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState({}); // Define state here
    const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
        // At the beginning of the Schedule component, add a new state for restrictedSlots
const [restrictedSlots, setRestrictedSlots] = useState({});
const [staffData, setStaffData] = useState({});



    // Placeholder functions for handling actions
    const toggleStaffList = () => setShowStaffList(!showStaffList);
    const editRestrictedSlots = () => {/* Logic to edit restricted slots */};

    

    return (
        <div className="App">
            <Navbar schedule={currentSchedule} startDate={startDate}
              onToggleStaffList={toggleStaffList}
              restrictedSlots={restrictedSlots}
              setRestrictedSlots={setRestrictedSlots}
              staffData={staffData}
              setStaffData={setStaffData}

            />
            <header className="App-header">
                {showStaffList && <StaffList />}
                <Schedule 
                currentSchedule={currentSchedule} 
                setCurrentSchedule={setCurrentSchedule}
                startDate={startDate}
                setStartDate={setStartDate}
                staffData={staffData}
                setStaffData={setStaffData}
                />
                <FireTom />
            </header>
        </div>
    );
}

export default App;
