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
                <div class="patient-detail-name">${item.patientName}</div>
                <div class="patient-detail-info">
                    <div><strong>Care Type:</strong> ${item.careType}</div>
                    <div><strong>Location:</strong> ${item.address}</div>
                    <div><strong>Time:</strong> ${item.time}</div>
                    <div><strong>Duration:</strong> ${item.duration} minutes</div>
                </div>
            `;
            patientDetailsDiv.appendChild(detailCard);
        });
    }
}

// PATIENT VIEW
function renderPatientView(data) {
    const patientCard = document.getElementById('patient-card');
    patientCard.innerHTML = '';

    if (!data.patient) {
        patientCard.innerHTML = '<p class="placeholder">Patient not found</p>';
        return;
    }

    const patient = data.patient;
    const visit = data.upcomingVisit;

    let html = `
        <div class="patient-info">
            <div class="patient-info-header">
                <div class="patient-info-name">${patient.name}</div>
                ${patient.priority === 'Urgent' ? '<span class="patient-priority">⚠️ URGENT</span>' : ''}
            </div>
            <div class="patient-info-details">
                <div class="patient-info-item">
                    <span class="patient-info-label">Care Needs:</span>
                    <span>${patient.careNeeds.join(', ')}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">Location:</span>
                    <span>${patient.location}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">Address:</span>
                    <span>${patient.address}</span>
                </div>
                <div class="patient-info-item">
                    <span class="patient-info-label">Preferred Time:</span>
                    <span>${patient.preferredTime}</span>
                </div>
            </div>
        </div>
    `;

    if (visit) {
        html += `
            <div class="patient-visit">
                <h3>📅 Upcoming Visit Today</h3>
                <div class="patient-visit-info">
                    <div class="patient-visit-item">
                        <span class="patient-visit-label">Healthcare Professional:</span>
                        <span class="patient-visit-value">${visit.staffName}</span>
                    </div>
                    <div class="patient-visit-item">
                        <span class="patient-visit-label">Time:</span>
                        <span class="patient-visit-value">${visit.time}</span>
                    </div>
                    <div class="patient-visit-item">
                        <span class="patient-visit-label">Care Type:</span>
                        <span class="patient-visit-value">${visit.careType}</span>
                    </div>
                    <div class="patient-visit-item">
                        <span class="patient-visit-label">Duration:</span>
                        <span class="patient-visit-value">${visit.duration} minutes</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += '<div class="placeholder">No visit scheduled for today</div>';
    }

    patientCard.innerHTML = html;
}

// ===== UTILITIES =====

function populateStaffSelector() {
    const select = document.getElementById('staff-select');
    appState.staff.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.id;
        option.textContent = `${staff.name} - ${staff.role}`;
        select.appendChild(option);
    });
}

function populatePatientSelector() {
    const select = document.getElementById('patient-select');
    appState.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} - ${patient.location}`;
        select.appendChild(option);
    });
}

// ===== EVENT LISTENERS =====

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    appState.currentView = view;

    // Hide all views
    document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) btn.classList.add('active');
    });

    // Load data for view
    if (view === 'supervisor') {
        loadSupervisorData();
    }
}

function setupEventListeners() {
    // Coordinator events
    document.getElementById('run-scheduler').addEventListener('click', runScheduler);
    document.getElementById('export-csv').addEventListener('click', exportSchedule);
    document.getElementById('refresh-schedule').addEventListener('click', loadCoordinatorData);

    // Professional events
    document.getElementById('staff-select').addEventListener('change', (e) => {
        if (e.target.value) {
            loadProfessionalData(parseInt(e.target.value));
        }
    });

    // Patient events
    document.getElementById('patient-select').addEventListener('change', (e) => {
        if (e.target.value) {
            loadPatientData(parseInt(e.target.value));
        }
    });

    setupAvailabilityListeners();


}

// ===== ACTIONS =====

async function runScheduler() {
    const btn = document.getElementById('run-scheduler');
    btn.disabled = true;
    btn.textContent = '⏳ Running AI Scheduler...';

    try {
        const response = await fetch(`${API_BASE}/run-scheduler`, { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            appState.schedule = data.schedule;
            renderCoordinatorDashboard();
            
            // Show success feedback
            alert('✅ Schedule optimized successfully!\n\n' + data.message);
        }
    } catch (error) {
        console.error('Error running scheduler:', error);
        alert('❌ Error running scheduler');
    } finally {
        btn.disabled = false;
        btn.textContent = '🤖 Run AI Scheduler';
    }
}

function exportSchedule() {
    window.location.href = `${API_BASE}/export-schedule`;
}


//AVAILABILITY MANAGEMENT (WITH BACKEND)

let availabilitySubmissions = {};

// Setup availability event listeners
function setupAvailabilityListeners() {
    document.getElementById('submit-availability').addEventListener('click', submitAvailability);
    document.getElementById('clear-form').addEventListener('click', clearAvailabilityForm);
}

async function submitAvailability() {
    // Get selected staff
    const staffSelect = document.getElementById('staff-select');
    if (!staffSelect.value) {
        alert('⚠️ Please select a staff member first!');
        return;
    }

    const staffId = staffSelect.value;
    const staffName = staffSelect.options[staffSelect.selectedIndex].text;

    // Get selected days
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked'))
        .map(cb => cb.value);

    if (selectedDays.length === 0) {
        alert('⚠️ Please select at least one day!');
        return;
    }

    // Get times
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const maxHours = document.getElementById('max-hours').value;

    // Get coverage areas
    const coverageAreas = Array.from(document.querySelectorAll('.coverage-checkbox:checked'))
        .map(cb => cb.value);

    if (coverageAreas.length === 0) {
        alert('⚠️ Please select at least one coverage area!');
        return;
    }

    // Get notes
    const notes = document.getElementById('notes').value;

    // Show loading state
    const submitBtn = document.getElementById('submit-availability');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';

    try {
        // Send to backend
        const response = await fetch(`${API_BASE}/availability/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                staffId: staffId,
                staffName: staffName,
                days: selectedDays,
                startTime: startTime,
                endTime: endTime,
                maxHours: maxHours,
                coverageAreas: coverageAreas,
                notes: notes
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store locally as well
            if (!availabilitySubmissions[staffId]) {
                availabilitySubmissions[staffId] = [];
            }
            availabilitySubmissions[staffId].push(data.submission);

            // Show success message
            alert('✅ Availability submitted successfully!\n\n' +
                'Days: ' + selectedDays.join(', ') + '\n' +
                'Time: ' + startTime + ' - ' + endTime + '\n' +
                'Coverage: ' + coverageAreas.join(', '));

            // Refresh display
            await loadAvailabilityFromBackend(staffId);
            clearAvailabilityForm();
        } else {
            alert('❌ Error submitting availability: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting availability:', error);
        alert('❌ Error submitting availability. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Submit Availability';
    }
}

// Load availability from backend
async function loadAvailabilityFromBackend(staffId) {
    try {
        const response = await fetch(`${API_BASE}/availability/${staffId}`);
        const data = await response.json();
        
        availabilitySubmissions[staffId] = data.availability;
        renderSubmittedAvailability(staffId);
    } catch (error) {
        console.error('Error loading availability:', error);
    }
}

function renderSubmittedAvailability(staffId) {
    const container = document.getElementById('submitted-availability');
    
    if (!staffId || !availabilitySubmissions[staffId] || availabilitySubmissions[staffId].length === 0) {
        container.innerHTML = '<p class="placeholder">No availability submitted yet</p>';
        return;
    }

    container.innerHTML = '';
    const submissions = availabilitySubmissions[staffId];

    submissions.forEach((submission, index) => {
        const card = document.createElement('div');
        card.className = 'availability-card';
        
        const daysText = submission.days.join(', ');
        const coverageText = submission.coverageAreas.join(', ');
        
        card.innerHTML = `
            <div class="availability-header">
                <div class="availability-title">📅 Submission #${index + 1}</div>
                <span class="availability-badge">Submitted</span>
            </div>
            <div class="availability-details">
                <div class="availability-item">
                    <span class="availability-label">Days:</span>
                    <span class="availability-value">${daysText}</span>
                </div>
                <div class="availability-item">
                    <span class="availability-label">Time:</span>
                    <span class="availability-value">${submission.startTime} - ${submission.endTime}</span>
                </div>
                <div class="availability-item">
                    <span class="availability-label">Max Hours/Day:</span>
                    <span class="availability-value">${submission.maxHours} hours</span>
                </div>
                <div class="availability-item">
                    <span class="availability-label">Coverage:</span>
                    <span class="availability-value">${coverageText}</span>
                </div>
                <div class="availability-item">
                    <span class="availability-label">Submitted:</span>
                    <span class="availability-value">${submission.submittedAt}</span>
                </div>
                ${submission.notes ? `
                <div class="availability-item">
                    <span class="availability-label">Notes:</span>
                    <span class="availability-value">"${submission.notes}"</span>
                </div>
                ` : ''}
            </div>
            <button class="delete-availability" onclick="deleteAvailability('${staffId}', ${submission.id})">
                🗑️ Delete
            </button>
        `;
        
        container.appendChild(card);
    });
}

async function deleteAvailability(staffId, submissionId) {
    if (confirm('Are you sure you want to delete this availability submission?')) {
        try {
            const response = await fetch(`${API_BASE}/availability/${staffId}/${submissionId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                await loadAvailabilityFromBackend(staffId);
                alert('✅ Availability deleted');
            } else {
                alert('❌ Error deleting availability');
            }
        } catch (error) {
            console.error('Error deleting availability:', error);
            alert('❌ Error deleting availability');
        }
    }
}

function clearAvailabilityForm() {
    document.querySelectorAll('.day-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.coverage-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('start-time').value = '09:00';
    document.getElementById('end-time').value = '17:00';
    document.getElementById('max-hours').value = '8';
    document.getElementById('notes').value = '';
}

// Update professional dashboard to show availability
async function updateProfessionalDashboardWithAvailability(staffId) {
    if (staffId) {
        await loadAvailabilityFromBackend(staffId);
    } else {
        document.getElementById('submitted-availability').innerHTML = 
            '<p class="placeholder">No availability submitted yet</p>';
    }
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
║  • Patient View - Upcoming visits                          ║
║  • AI Scheduling - Optimized route planning                ║
║  • CSV Export - Download schedules                         ║
║                                                            ║
║  🚀 Ready to go! Start exploring the dashboards.          ║
╚════════════════════════════════════════════════════════════╝
`);