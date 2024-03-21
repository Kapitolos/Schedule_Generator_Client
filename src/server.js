const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

console.log('Test');

// Check if the server can read staff_availability.json when it starts up
fs.readFile('staff_availability.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Startup check: Error reading staff_availability.json:', err);
        return;
    }
    console.log('Startup check: Successfully read staff_availability.json');
    console.log('Startup check: First 100 characters of data:', data.substring(0, 100));  // Just a snippet to confirm
});

app.get('/staff-availability', (req, res) => {
    fs.readFile('staff_availability.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading staff_availability.json:', err);
            res.status(500).send('Error reading file');
            return;
        }
        console.log('Successfully read staff_availability.json during a GET request');
        res.send(data);
    });
});

app.post('/update-booked-dates', (req, res) => {
    const updatedData = req.body;
    fs.writeFile('staff_availability.json', JSON.stringify(updatedData), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to staff_availability.json:', err);
            res.status(500).send('Error writing to file');
            return;
        }
        console.log('Successfully updated staff_availability.json');
        res.send({ success: true });
    });
});

app.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});
