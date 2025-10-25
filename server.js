import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// Mock Data
const mockStaff = [
  { id: 1, name: 'Dr. Pekka', role: 'Doctor', expertise: ['Palliative', 'Infection'], coverage: ['Oulu', 'Kempale'], availableHours: '09:00-17:00', maxHours: 8 },
  { id: 2, name: 'Dr. Teemu', role: 'Doctor', expertise: ['Acute', 'Geriatrics'], coverage: ['Oulu', 'Kiiminki'], availableHours: '08:00-16:00', maxHours: 8 },
  { id: 3, name: 'Nurse Nuura', role: 'Nurse', expertise: ['Infection', 'Palliative'], coverage: ['Oulu'], availableHours: '09:00-17:00', maxHours: 8 },
  { id: 4, name: 'Nurse Anne', role: 'Nurse', expertise: ['Palliative', 'Geriatrics'], coverage: ['Kempale', 'Kiiminki'], availableHours: '10:00-18:00', maxHours: 8 },
  { id: 5, name: 'Nurse Sanna', role: 'Nurse', expertise: ['Acute'], coverage: ['Oulu'], availableHours: '08:00-16:00', maxHours: 8 },
];

const mockPatients = [
  { id: 101, name: 'A. Marika', careNeeds: ['Palliative'], location: 'Oulu', address: 'Isokatu 1', preferredTime: 'Morning', priority: 'Urgent' },
  { id: 102, name: 'T. Vikke', careNeeds: ['Infection'], location: 'Oulu', address: 'Kalervantie 2', preferredTime: 'Afternoon', priority: 'Normal' },
  { id: 103, name: 'T. Mäki', careNeeds: ['Acute'], location: 'Kiiminki', address: 'Kivitie 5', preferredTime: 'Morning', priority: 'Normal' },
  { id: 104, name: 'Laouri', careNeeds: ['Palliative'], location: 'Kempale', address: 'Kauppakuja 8', preferredTime: 'Afternoon', priority: 'Normal' },
  { id: 105, name: 'P. Laine', careNeeds: ['Geriatrics', 'Palliative'], location: 'Oulu', address: 'Puistokatu 3', preferredTime: 'Morning', priority: 'Urgent' },
];

const mockSchedule = generateOptimizedSchedule();

// Generate optimized schedule using AI-like logic
function generateOptimizedSchedule() {
  const schedule = [];
  const today = new Date();
  
  mockPatients.forEach(patient => {
    // Find best matching staff
    const bestStaff = mockStaff.filter(staff => {
      const hasExpertise = staff.expertise.some(exp => patient.careNeeds.includes(exp));
      const canCover = staff.coverage.includes(patient.location);
      return hasExpertise && canCover;
    });

    if (bestStaff.length > 0) {
      const assignedStaff = bestStaff[Math.floor(Math.random() * bestStaff.length)];
      const timeSlot = patient.preferredTime === 'Morning' ? '09:00' : '14:00';
      
      schedule.push({
        staffId: assignedStaff.id,
        staffName: assignedStaff.name,
        patientId: patient.id,
        patientName: patient.name,
        careType: patient.careNeeds[0],
        time: timeSlot,
        location: patient.location,
        address: patient.address,
        duration: 45,
        travelTime: Math.floor(Math.random() * 30) + 10,
        status: 'Scheduled'
      });
    }
  });

  return schedule;
}

// API Endpoints

// Get all data for coordinator
app.get('/api/coordinator', (req, res) => {
  res.json({
    staff: mockStaff,
    patients: mockPatients,
    schedule: mockSchedule,
    todayCapacity: { current: mockPatients.length, max: 30 }
  });
});

// Get supervisor overview
app.get('/api/supervisor', (req, res) => {
  const workloadByStaff = {};
  
  mockStaff.forEach(staff => {
    const assignedTasks = mockSchedule.filter(s => s.staffId === staff.id).length;
    workloadByStaff[staff.name] = assignedTasks;
  });

  res.json({
    schedule: mockSchedule,
    workload: workloadByStaff,
    rules: {
      maxTravelTime: 30,
      coverage: ['Oulu', 'Kempale', 'Kiiminki'],
      maxWorkload: 8
    }
  });
});

// Get professional dashboard
app.get('/api/professional/:staffId', (req, res) => {
  const staffId = parseInt(req.params.staffId);
  const staff = mockStaff.find(s => s.id === staffId);
  const personalSchedule = mockSchedule.filter(s => s.staffId === staffId);

  res.json({
    staff: staff,
    schedule: personalSchedule,
    route: personalSchedule.map(s => ({ location: s.address, time: s.time, patient: s.patientName }))
  });
});

//Availability end points
let staffAvailability = {};

app.post('/api/availability/submit', (req, res) => {
    const { staffId, staffName, days, startTime, endTime, maxHours, coverageAreas, notes } = req.body;

    if (!staffId) {
        return res.status(400).json({ error: 'Staff ID required' });
    }

    const submission = {
        staffId: staffId,
        staffName: staffName,
        days: days,
        startTime: startTime,
        endTime: endTime,
        maxHours: maxHours,
        coverageAreas: coverageAreas,
        notes: notes,
        submittedAt: new Date().toLocaleString(),
        id: Date.now()
    };

    if (!staffAvailability[staffId]) {
        staffAvailability[staffId] = [];
    }

    staffAvailability[staffId].push(submission);

    res.json({
        success: true,
        message: 'Availability submitted successfully',
        submission: submission
    });
});

app.get('/api/availability/:staffId', (req, res) => {
    const staffId = req.params.staffId;
    const availability = staffAvailability[staffId] || [];

    res.json({
        staffId: staffId,
        availability: availability
    });
});

app.delete('/api/availability/:staffId/:submissionId', (req, res) => {
    const staffId = req.params.staffId;
    const submissionId = parseInt(req.params.submissionId);

    if (staffAvailability[staffId]) {
        staffAvailability[staffId] = staffAvailability[staffId].filter(
            sub => sub.id !== submissionId
        );
    }

    res.json({
        success: true,
        message: 'Availability deleted successfully'
    });
});

app.get('/api/availability', (req, res) => {
    res.json(staffAvailability);
});



// Get patient view
app.get('/api/patient/:patientId', (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const patient = mockPatients.find(p => p.id === patientId);
  const visit = mockSchedule.find(s => s.patientId === patientId);

  res.json({
    patient: patient,
    upcomingVisit: visit || null
  });
});

// PATIENT BOOKING SYSTEM - API ENDPOINTS

let bookings = {};
let bookingIdCounter = 1;

// CREATE NEW BOOKING
app.post('/api/bookings/create', (req, res) => {
    const { 
        patientId, patientName, patientPhone, patientEmail,
        professionalId, professionalName, serviceType,
        bookingDate, bookingTime, duration, location,
        notes, preferredLanguage, priority
    } = req.body;

    if (!patientId || !professionalId || !bookingDate || !bookingTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = {
        id: bookingIdCounter++,
        patientId, patientName, patientPhone, patientEmail,
        professionalId, professionalName, serviceType,
        bookingDate, bookingTime, duration: duration || '1 hour',
        location, notes, preferredLanguage: preferredLanguage || 'English',
        priority: priority || 'normal',
        status: 'pending',
        createdAt: new Date().toLocaleString(),
        confirmedAt: null, completedAt: null
    };

    if (!bookings[patientId]) bookings[patientId] = [];
    bookings[patientId].push(booking);

    res.json({
        success: true,
        message: 'Booking created successfully',
        booking: booking
    });
});

// GET PATIENT BOOKINGS
app.get('/api/bookings/patient/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    const patientBookings = bookings[patientId] || [];

    res.json({
        patientId: patientId,
        bookings: patientBookings,
        total: patientBookings.length
    });
});

// GET PROFESSIONAL BOOKINGS
app.get('/api/bookings/professional/:professionalId', (req, res) => {
    const professionalId = req.params.professionalId;
    const profBookings = [];

    for (const patientId in bookings) {
        const filtered = bookings[patientId].filter(b => b.professionalId === professionalId);
        profBookings.push(...filtered);
    }

    res.json({
        professionalId: professionalId,
        bookings: profBookings,
        total: profBookings.length
    });
});

// UPDATE BOOKING STATUS
app.put('/api/bookings/:bookingId', (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    const { status, notes } = req.body;

    for (const patientId in bookings) {
        const booking = bookings[patientId].find(b => b.id === bookingId);
        if (booking) {
            booking.status = status;
            if (notes) booking.notes = notes;
            if (status === 'confirmed') booking.confirmedAt = new Date().toLocaleString();
            if (status === 'completed') booking.completedAt = new Date().toLocaleString();

            return res.json({
                success: true,
                message: 'Booking updated successfully',
                booking: booking
            });
        }
    }

    res.status(404).json({ error: 'Booking not found' });
});

// CANCEL BOOKING
app.delete('/api/bookings/:bookingId', (req, res) => {
    const bookingId = parseInt(req.params.bookingId);

    for (const patientId in bookings) {
        const index = bookings[patientId].findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[patientId].splice(index, 1);
            return res.json({
                success: true,
                message: 'Booking cancelled successfully'
            });
        }
    }

    res.status(404).json({ error: 'Booking not found' });
});

// GET ALL BOOKINGS
app.get('/api/bookings', (req, res) => {
    const allBookings = [];
    for (const patientId in bookings) {
        allBookings.push(...bookings[patientId]);
    }

    res.json({
        total: allBookings.length,
        bookings: allBookings
    });
});

// GET AVAILABLE TIME SLOTS
app.get('/api/professionals/:professionalId/availability/:date', (req, res) => {
    const professionalId = req.params.professionalId;
    const date = req.params.date;

    const dayBookings = [];
    for (const patientId in bookings) {
        const filtered = bookings[patientId].filter(
            b => b.professionalId === professionalId && b.bookingDate === date
        );
        dayBookings.push(...filtered);
    }

    const bookedTimes = dayBookings.map(b => b.bookingTime);
    const availableSlots = [];

    for (let hour = 9; hour < 17; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        if (!bookedTimes.includes(time)) {
            availableSlots.push(time);
        }
    }

    res.json({
        date: date,
        availableSlots: availableSlots,
        bookedCount: dayBookings.length
    });
});


// Run scheduling AI (simulated)
app.post('/api/run-scheduler', (req, res) => {
  // Simulate AI processing
  setTimeout(() => {
    const newSchedule = generateOptimizedSchedule();
    res.json({
      success: true,
      schedule: newSchedule,
      message: 'Schedule optimized successfully'
    });
  }, 1500);
});

// Export schedule as CSV
app.get('/api/export-schedule', (req, res) => {
  let csv = 'Staff,Patient,Time,Location,Care Type,Duration (min),Travel Time (min),Status\n';
  
  mockSchedule.forEach(item => {
    csv += `${item.staffName},${item.patientName},${item.time},${item.location},${item.careType},${item.duration},${item.travelTime},${item.status}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="schedule.csv"');
  res.send(csv);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🏥 Hospital Scheduler Demo running on http://localhost:${PORT}`);
});