import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RestrictedSlotsEditor() {
    const [localRestrictedSlots, setLocalRestrictedSlots] = useState({});
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
            });
    };

    return (
        <div className="restricted-slots-editor">
            {Object.keys(localRestrictedSlots).map(slot => (
                <div key={slot}>
                    <h3>{slot}</h3>
                    {daysOfWeek.map(day => (
                        <button
                            key={day}
                            onClick={() => handleToggleDay(slot, day)}
                            className={localRestrictedSlots[slot]?.includes(day) ? 'restricted' : 'available'}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default RestrictedSlotsEditor;
