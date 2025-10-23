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