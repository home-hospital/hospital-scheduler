// Global State
let appState = {
    currentView: 'coordinator',
    staff: [],
    patients: [],
    schedule: [],
    selectedStaff: null,
    selectedPatient: null
};

// API Base
const API_BASE = 'http://localhost:3000/api';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Initializing Hospital Scheduler Demo...');
    
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    await loadCoordinatorData();
    
    // Populate selectors
    populateStaffSelector();
    populatePatientSelector();
    
    // Setup event listeners
    setupEventListeners();
    setupAvailabilityListeners();
    setupPatientViewListeners();
    
    console.log('✅ App initialized successfully');
}

// ===== DATA LOADING =====

async function loadCoordinatorData() {
    try {
        const response = await fetch(`${API_BASE}/coordinator`);
        const data = await response.json();
        appState.staff = data.staff;
        appState.patients = data.patients;
        appState.schedule = data.schedule;
        renderCoordinatorDashboard();
    } catch (error) {
        console.error('Error loading coordinator data:', error);
    }
}

async function loadSupervisorData() {
    try {
        const response = await fetch(`${API_BASE}/supervisor`);
        const data = await response.json();
        appState.schedule = data.schedule;
        renderSupervisorDashboard(data);
    } catch (error) {
        console.error('Error loading supervisor data:', error);
    }
}

async function loadProfessionalData(staffId) {
    try {
        const response = await fetch(`${API_BASE}/professional/${staffId}`);
        const data = await response.json();
        appState.selectedStaff = data.staff;
        renderProfessionalDashboard(data);
        updateProfessionalDashboardWithAvailability(staffId);
    } catch (error) {
        console.error('Error loading professional data:', error);
    }
}

async function loadPatientData(patientId) {
    try {
        const response = await fetch(`${API_BASE}/patient/${patientId}`);
        const data = await response.json();
        renderPatientView(data);
    } catch (error) {
        console.error('Error loading patient data:', error);
    }
}

// ===== RENDERING =====

// COORDINATOR DASHBOARD
function renderCoordinatorDashboard() {
    // Update capacity
    const capacity = appState.schedule.length;
    const maxCapacity = 30;
    document.getElementById('capacity-current').textContent = capacity;
    document.getElementById('capacity-max').textContent = maxCapacity;
    document.getElementById('capacity-fill').style.width = (capacity / maxCapacity) * 100 + '%';

    // Render schedule table
    const tbody = document.getElementById('schedule-body');
    tbody.innerHTML = '';

    if (appState.schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No schedule available. Run AI Scheduler to generate one.</td></tr>';
        return;
    }

    appState.schedule.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.staffName}</td>
            <td>${item.patientName}</td>
            <td>${item.time}</td>
            <td>${item.location}</td>
            <td>${item.careType}</td>
            <td>${item.travelTime} min</td>
            <td><span class="status-badge">${item.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// SUPERVISOR DASHBOARD
function renderSupervisorDashboard(data) {
    // Render schedule
    const tbody = document.getElementById('supervisor-schedule');
    tbody.innerHTML = '';

    appState.schedule.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.staffName}</strong></td>
            <td>Nurse</td>
            <td>${item.patientName}</td>
            <td>${item.time}</td>
            <td>${item.careType}</td>
            <td>${item.location}</td>
            <td>${item.careType === 'Palliative' ? '⭐ Urgent' : 'Normal'}</td>
        `;
        tbody.appendChild(row);
    });

    // Render workload chart
    const workloadChart = document.getElementById('workload-chart');
    workloadChart.innerHTML = '';

    appState.staff.forEach(staff => {
        const assignments = appState.schedule.filter(s => s.staffId === staff.id).length;
        const percentage = (assignments / 8) * 100;

        const barDiv = document.createElement('div');
        barDiv.className = 'workload-bar';
        barDiv.innerHTML = `
            <div class="workload-bar-name">${staff.name}</div>
            <div class="workload-bar-visual">
                <div class="workload-bar-fill" style="height: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="workload-bar-count">${assignments}/8</div>
        `;
        workloadChart.appendChild(barDiv);
    });
}

// PROFESSIONAL DASHBOARD
function renderProfessionalDashboard(data) {
    // Render personal schedule
    const scheduleDiv = document.getElementById('personal-schedule');
    scheduleDiv.innerHTML = '';

    if (!data.schedule || data.schedule.length === 0) {
        scheduleDiv.innerHTML = '<p class="placeholder">No schedule for this staff member today</p>';
    } else {
        data.schedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <div class="schedule-item-time">${item.time}</div>
                <div class="schedule-item-info">
                    <div class="schedule-item-patient">📍 ${item.patientName}</div>
                    <div class="schedule-item-location">${item.address}</div>
                </div>
                <div class="schedule-item-duration">${item.duration} min</div>
            `;
            scheduleDiv.appendChild(scheduleItem);
        });
    }

    // Render route
    const routeDiv = document.getElementById('route-order');
    routeDiv.innerHTML = '';

    if (!data.route || data.route.length === 0) {
        routeDiv.innerHTML = '<p class="placeholder">No route planned</p>';
    } else {
        data.route.forEach((stop, index) => {
            const routeItem = document.createElement('div');
            routeItem.className = 'route-item';
            routeItem.innerHTML = `
                <div class="route-number">${index + 1}</div>
                <div class="route-location">${stop.location}</div>
                <div class="route-time">${stop.time}</div>
            `;
            routeDiv.appendChild(routeItem);
        });
    }

    // Render patient details
    const patientDetailsDiv = document.getElementById('patient-details');
    patientDetailsDiv.innerHTML = '';

    if (!data.schedule || data.schedule.length === 0) {
        patientDetailsDiv.innerHTML = '<p class="placeholder">No patient details available</p>';
    } else {
        data.schedule.forEach(item => {
            const detailCard = document.createElement('div');
            detailCard.className = 'patient-detail-card';
            detailCard.innerHTML = `
                <div class="detail-card-header">
                    <div class="detail-patient-name">${item.patientName}</div>
                </div>
                <div class="detail-card-body">
                    <div class="detail-item">
                        <span class="detail-key">Care Type:</span>
                        <span class="detail-val">${item.careType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-key">Time:</span>
                        <span class="detail-val">${item.time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-key">Location:</span>
                        <span class="detail-val">${item.address}</span>
                    </div>
                </div>
            `;
            patientDetailsDiv.appendChild(detailCard);
        });
    }
}

// PATIENT VIEW - Old version (kept for compatibility)
function renderPatientView(data) {
    const container = document.getElementById('patient-card');
    
    if (!data.patient) {
        container.innerHTML = '<p class="placeholder">Patient not found</p>';
        return;
    }
    
    const patient = data.patient;
    const visit = data.upcomingVisit;
    
    if (!visit) {
        container.innerHTML = `
            <div class="patient-info">
                <h3>${patient.name}</h3>
                <p><strong>Location:</strong> ${patient.location}</p>
                <p><strong>Care Needs:</strong> ${patient.careNeeds.join(', ')}</p>
                <p style="color: #999; margin-top: 1rem;">No upcoming visit scheduled</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="visit-card">
            <h3>📅 Upcoming Visit</h3>
            <div class="visit-info">
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Professional:</strong> ${visit.staffName}</p>
                <p><strong>Time:</strong> ${visit.time}</p>
                <p><strong>Care Type:</strong> ${visit.careType}</p>
                <p><strong>Address:</strong> ${visit.address}</p>
                <p><strong>Duration:</strong> ${visit.duration} min</p>
            </div>
        </div>
    `;
}

// ===== NAVIGATION =====

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    // Update button states
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    // Hide all views
    document.querySelectorAll('.dashboard-view').forEach(v => {
        v.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');

    // Load data for view
    if (view === 'supervisor') {
        loadSupervisorData();
    }
}

function setupEventListeners() {
    // Coordinator events
    const runSchedulerBtn = document.getElementById('run-scheduler');
    if (runSchedulerBtn) {
        runSchedulerBtn.addEventListener('click', runScheduler);
    }

    const exportCsvBtn = document.getElementById('export-csv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportSchedule);
    }

    const refreshBtn = document.getElementById('refresh-schedule');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCoordinatorData);
    }

    // Professional selector
    const staffSelect = document.getElementById('staff-select');
    if (staffSelect) {
        staffSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                loadProfessionalData(parseInt(e.target.value));
            }
        });
    }
}

// ===== SCHEDULER FUNCTIONS =====

async function runScheduler() {
    const btn = document.getElementById('run-scheduler');
    btn.textContent = '⏳ Running...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/run-scheduler`, {
            method: 'POST'
        });
        const data = await response.json();
        appState.schedule = data.schedule;
        renderCoordinatorDashboard();
        alert('✅ Schedule optimized successfully!');
    } catch (error) {
        alert('❌ Error running scheduler');
    } finally {
        btn.textContent = '🤖 Run AI Scheduler';
        btn.disabled = false;
    }
}

async function exportSchedule() {
    try {
        const response = await fetch(`${API_BASE}/export-schedule`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schedule.csv';
        a.click();
    } catch (error) {
        alert('❌ Error exporting schedule');
    }
}

// ===== POPULATE SELECTORS =====

function populateStaffSelector() {
    const select = document.getElementById('staff-select');
    if (!select) return;

    fetch(`${API_BASE}/coordinator`)
        .then(res => res.json())
        .then(data => {
            data.staff.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.id;
                option.textContent = `${staff.name} - ${staff.role}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error populating staff:', error));
}

function populatePatientSelector() {
    const select = document.getElementById('patient-select');
    if (!select) return;

    fetch(`${API_BASE}/coordinator`)
        .then(res => res.json())
        .then(data => {
            data.patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.name} (ID: ${patient.id})`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error populating patients:', error));
}

// ===== AVAILABILITY FUNCTIONS =====

function setupAvailabilityListeners() {
    const submitAvailabilityBtn = document.getElementById('submit-availability');
    if (submitAvailabilityBtn) {
        submitAvailabilityBtn.addEventListener('click', submitAvailability);
    }

    const staffIdInput = document.getElementById('staff-id-input');
    if (staffIdInput) {
        staffIdInput.addEventListener('input', function() {
            loadAvailabilityHistory(this.value);
        });
    }
}

async function submitAvailability() {
    const staffId = document.getElementById('staff-id-input')?.value;
    const staffName = document.getElementById('staff-name-input')?.value;
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(el => el.value);
    const startTime = document.getElementById('start-time')?.value;
    const endTime = document.getElementById('end-time')?.value;
    const maxHours = document.getElementById('max-hours')?.value;
    const coverageAreas = Array.from(document.querySelectorAll('.area-checkbox:checked')).map(el => el.value);
    const notes = document.getElementById('availability-notes')?.value;

    if (!staffId || !staffName || selectedDays.length === 0 || !startTime || !endTime || coverageAreas.length === 0) {
        alert('⚠️ Please fill in all required fields');
        return;
    }

    const availabilityData = {
        staffId: staffId,
        staffName: staffName,
        days: selectedDays,
        startTime: startTime,
        endTime: endTime,
        maxHours: maxHours || 8,
        coverageAreas: coverageAreas,
        notes: notes
    };

    try {
        const response = await fetch(`${API_BASE}/availability/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(availabilityData)
        });

        const result = await response.json();
        if (result.success) {
            alert('✅ Availability submitted successfully!');
            clearAvailabilityForm();
            loadAvailabilityHistory(staffId);
        }
    } catch (error) {
        alert('❌ Error submitting availability');
    }
}

async function loadAvailabilityHistory(staffId) {
    if (!staffId) return;

    try {
        const response = await fetch(`${API_BASE}/availability/${staffId}`);
        const data = await response.json();
        displayAvailabilityHistory(data.availability);
    } catch (error) {
        console.error('Error loading availability:', error);
    }
}

function displayAvailabilityHistory(submissions) {
    const historyDiv = document.getElementById('availability-history');
    if (!historyDiv) return;

    if (!submissions || submissions.length === 0) {
        historyDiv.innerHTML = '<p class="placeholder">No availability submitted yet</p>';
        return;
    }

    historyDiv.innerHTML = '';

    submissions.forEach(submission => {
        const card = document.createElement('div');
        card.className = 'availability-card';
        card.innerHTML = `
            <div class="availability-header">
                <div class="availability-title">📅 ${submission.days.join(', ')}</div>
                <button class="btn-small btn-danger" onclick="deleteAvailability('${submission.staffId}', ${submission.id})">🗑️</button>
            </div>
            <div class="availability-details">
                <p><strong>Time:</strong> ${submission.startTime} - ${submission.endTime}</p>
                <p><strong>Max Hours:</strong> ${submission.maxHours} hours</p>
                <p><strong>Areas:</strong> ${submission.coverageAreas.join(', ')}</p>
                <p><strong>Submitted:</strong> ${submission.submittedAt}</p>
                ${submission.notes ? `<p><strong>Notes:</strong> "${submission.notes}"</p>` : ''}
            </div>
        `;
        historyDiv.appendChild(card);
    });
}

async function deleteAvailability(staffId, submissionId) {
    if (!confirm('Delete this availability submission?')) return;

    try {
        const response = await fetch(`${API_BASE}/availability/${staffId}/${submissionId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert('✅ Availability deleted');
            loadAvailabilityHistory(staffId);
        }
    } catch (error) {
        alert('❌ Error deleting availability');
    }
}

function clearAvailabilityForm() {
    document.getElementById('staff-id-input').value = '';
    document.getElementById('staff-name-input').value = '';
    document.getElementById('start-time').value = '09:00';
    document.getElementById('end-time').value = '17:00';
    document.getElementById('max-hours').value = '8';
    document.getElementById('availability-notes').value = '';
    document.querySelectorAll('.day-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.area-checkbox').forEach(cb => cb.checked = false);
}

// ===== ENHANCED PATIENT VIEW WITH BOOKING =====

let currentPatientData = null;
let selectedBookingDate = null;
let selectedBookingTime = null;

function setupPatientViewListeners() {
    populatePatientSelector();
    const select = document.getElementById('patient-select');
    if (select) {
        select.addEventListener('change', function(e) {
            if (this.value) {
                loadPatientAndShowBookingForm(this.value);
            }
        });
    }
}

async function loadPatientAndShowBookingForm(patientId) {
    try {
        const response = await fetch(`${API_BASE}/patient/${patientId}`);
        const data = await response.json();
        currentPatientData = data.patient;
        renderPatientUpcomingVisit(data);
        renderBookingFormForWeek(data.patient);
    } catch (error) {
        console.error('Error loading patient:', error);
    }
}

function renderPatientUpcomingVisit(data) {
    const container = document.getElementById('patient-card');
    const patient = data.patient;
    const visit = data.upcomingVisit;
    
    if (!patient) {
        container.innerHTML = '<p class="placeholder">Patient not found</p>';
        return;
    }
    
    if (!visit) {
        container.innerHTML = `
            <div class="patient-info">
                <div class="patient-info-header">
                    <div class="patient-info-name">👤 ${patient.name}</div>
                </div>
                <div class="patient-info-details">
                    <div class="patient-info-item">
                        <span class="patient-info-label">ID:</span>
                        <span class="patient-info-value">${patient.id}</span>
                    </div>
                    <div class="patient-info-item">
                        <span class="patient-info-label">📍 Location:</span>
                        <span class="patient-info-value">${patient.location}</span>
                    </div>
                    <div class="patient-info-item">
                        <span class="patient-info-label">📮 Address:</span>
                        <span class="patient-info-value">${patient.address}</span>
                    </div>
                    <div class="patient-info-item">
                        <span class="patient-info-label">💊 Care Needs:</span>
                        <span class="patient-info-value">${patient.careNeeds.join(', ')}</span>
                    </div>
                </div>
                <div class="no-visit-msg">
                    <p>ℹ️ No upcoming visit scheduled</p>
                    <p>Book an appointment using the form on the right →</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="patient-info">
            <div class="patient-info-header">
                <div class="patient-info-name">👤 ${patient.name}</div>
                <span class="patient-visit-priority">${patient.priority}</span>
            </div>
            
            <div class="patient-info-details">
                <div class="patient-info-item">
                    <span class="patient-info-label">ID:</span>
                    <span class="patient-info-value">${patient.id}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">📍 Location:</span>
                    <span class="patient-info-value">${patient.location}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">📮 Address:</span>
                    <span class="patient-info-value">${patient.address}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">💊 Care Needs:</span>
                    <span class="patient-info-value">${patient.careNeeds.join(', ')}</span>
                </div>
            </div>
        </div>
        
        <div class="patient-visit">
            <h4>📅 Upcoming Visit</h4>
            <div class="visit-details">
                <div class="visit-item">
                    <span class="visit-label">👨‍⚕️ Professional:</span>
                    <span class="visit-value">${visit.staffName}</span>
                </div>
                <div class="visit-item">
                    <span class="visit-label">📅 Time:</span>
                    <span class="visit-value">${visit.time}</span>
                </div>
                <div class="visit-item">
                    <span class="visit-label">💼 Care Type:</span>
                    <span class="visit-value">${visit.careType}</span>
                </div>
                <div class="visit-item">
                    <span class="visit-label">📍 Address:</span>
                    <span class="visit-value">${visit.address}</span>
                </div>
                <div class="visit-item">
                    <span class="visit-label">✅ Status:</span>
                    <span class="visit-value" style="background: linear-gradient(135deg, #5BA891, #7BBFA8); color: white; padding: 0.3rem 0.8rem; border-radius: 16px; font-size: 0.75rem; font-weight: 700; display: inline-block;">
                        ${visit.status}
                    </span>
                </div>
            </div>
        </div>
    `;
}

function renderBookingFormForWeek(patient) {
    const container = document.getElementById('booking-form-container');
    
    if (!patient) {
        container.innerHTML = '<p class="placeholder">Select a patient first</p>';
        return;
    }
    
    const days = [];
    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push({
            dateStr: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
    }
    
    const timeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
        timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    
    let html = `
        <div class="booking-form-content">
            <div class="booking-service-selector">
                <label>Service Type *</label>
                <select id="booking-service-type">
                    <option value="">Select service type</option>
                    <option value="consultation">Consultation</option>
                    <option value="checkup">Health Checkup</option>
                    <option value="therapy">Therapy</option>
                    <option value="medication">Medication</option>
                    <option value="wound-care">Wound Care</option>
                </select>
            </div>
            
            <div>
                <label style="font-weight: 600; color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.8rem;">Select Day *</label>
                <div class="booking-day-selector">
    `;
    
    days.forEach(day => {
        html += `
            <button class="day-btn" data-date="${day.dateStr}" onclick="selectBookingDay(this, '${day.dateStr}')">
                <div>${day.dayName}</div>
                <div style="font-size: 0.7rem;">${day.dayDate}</div>
            </button>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div id="time-slots-container" style="display: none;">
                <label style="font-weight: 600; color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.8rem;">Select Time *</label>
                <div class="time-slot-selector">
    `;
    
    timeSlots.forEach(time => {
        html += `<button class="time-slot-btn" data-time="${time}" onclick="selectBookingTime(this, '${time}')">${time}</button>`;
    });
    
    html += `
                </div>
            </div>
            
            <div class="booking-notes">
                <label>Special Requirements</label>
                <textarea id="booking-requirements" placeholder="Any special requirements?"></textarea>
            </div>
            
            <div id="booking-summary-container" style="display: none;">
                <div class="booking-summary">
                    <div class="summary-item">
                        <span class="summary-label">📅 Date:</span>
                        <span class="summary-value" id="summary-date">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">🕐 Time:</span>
                        <span class="summary-value" id="summary-time">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">👤 Patient:</span>
                        <span class="summary-value">${patient.name}</span>
                    </div>
                </div>
            </div>
            
            <div class="booking-action-buttons">
                <button class="btn btn-primary" onclick="submitPatientBooking()">
                    ✅ Confirm Booking
                </button>
                <button class="btn btn-secondary" onclick="resetBookingForm()">
                    🔄 Clear
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function selectBookingDay(btn, dateStr) {
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedBookingDate = dateStr;
    
    document.getElementById('time-slots-container').style.display = 'block';
    document.getElementById('booking-summary-container').style.display = 'block';
    
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('summary-date').textContent = formattedDate;
    
    selectedBookingTime = null;
    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
}

function selectBookingTime(btn, time) {
    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedBookingTime = time;
    document.getElementById('summary-time').textContent = time;
}

async function submitPatientBooking() {
    if (!currentPatientData) {
        alert('⚠️ Please select a patient');
        return;
    }
    
    if (!selectedBookingDate || !selectedBookingTime) {
        alert('⚠️ Please select date and time');
        return;
    }
    
    const serviceType = document.getElementById('booking-service-type').value;
    if (!serviceType) {
        alert('⚠️ Please select service type');
        return;
    }
    
    const bookingData = {
        patientId: currentPatientData.id,
        patientName: currentPatientData.name,
        professionalId: 'auto',
        professionalName: 'To be assigned',
        serviceType: serviceType,
        bookingDate: selectedBookingDate,
        bookingTime: selectedBookingTime,
        duration: '1 hour',
        location: currentPatientData.location,
        notes: document.getElementById('booking-requirements').value,
        preferredLanguage: 'English',
        priority: currentPatientData.priority
    };
    
    try {
        const response = await fetch(`${API_BASE}/bookings/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        if (result.success) {
            alert(`✅ Booking confirmed!\n📅 ${selectedBookingDate}\n🕐 ${selectedBookingTime}\n\nBooking ID: ${result.booking.id}`);
            resetBookingForm();
            loadPatientAndShowBookingForm(currentPatientData.id);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error creating booking');
    }
}

function resetBookingForm() {
    selectedBookingDate = null;
    selectedBookingTime = null;
    document.getElementById('booking-service-type').value = '';
    document.getElementById('booking-requirements').value = '';
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('time-slots-container').style.display = 'none';
    document.getElementById('booking-summary-container').style.display = 'none';
}

// Console welcome message
console.log(`
╔════════════════════════════════════════════════════════════╗
║   🏥 AI-Powered Home Hospital Scheduling System Demo 🏥   ║
║                                                            ║
║  Features:                                                 ║
║  • Coordinator Dashboard - Real-time schedule overview     ║
║  • Supervisor Dashboard - Workload management              ║
║  • Professional Dashboard - Personal schedules & routes    ║
║  • Patient View - Upcoming visits & booking                ║
║  • AI Scheduling - Optimized route planning                ║
║  • CSV Export - Download schedules                         ║
║                                                            ║
║  🚀 Ready to go! Start exploring the dashboards.          ║
╚════════════════════════════════════════════════════════════╝
`);