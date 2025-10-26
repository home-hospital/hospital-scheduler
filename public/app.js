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
    
    // Setup availability event listeners
    setupAvailabilityEventListeners();
    setupStaffSelectorListener();
    
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

// PROFESSIONAL DASHBOARD - Availability Management
function updateProfessionalDashboardWithAvailability(staffId) {
    try {
        // Fetch from API instead of localStorage
        fetch(`${API_BASE}/availability/${staffId}`)
            .then(response => response.json())
            .then(data => {
                const submittedDiv = document.getElementById('submitted-availability');
                const availabilityList = data.availability;

                if (!availabilityList || availabilityList.length === 0) {
                    submittedDiv.innerHTML = '<p class="placeholder">No availability submitted yet</p>';
                    return;
                }

                // Display all submitted availabilities
                let html = '';
                availabilityList.forEach(availability => {
                    html += `
                        <div class="availability-card">
                            <div class="availability-header">
                                <h4>Week Availability</h4>
                                <span class="availability-badge">✅ Submitted</span>
                                <span class="availability-date">${availability.submittedAt}</span>
                            </div>
                            <div class="availability-details">
                                <div class="availability-item">
                                    <span class="availability-label">Days Available:</span>
                                    <span class="availability-value">${availability.days.join(', ')}</span>
                                </div>
                                <div class="availability-item">
                                    <span class="availability-label">Working Hours:</span>
                                    <span class="availability-value">${availability.startTime} - ${availability.endTime}</span>
                                </div>
                                <div class="availability-item">
                                    <span class="availability-label">Max Hours/Day:</span>
                                    <span class="availability-value">${availability.maxHours} hours</span>
                                </div>
                                <div class="availability-item">
                                    <span class="availability-label">Coverage Areas:</span>
                                    <span class="availability-value">${availability.coverageAreas.join(', ')}</span>
                                </div>
                                ${availability.notes ? `
                                <div class="availability-item">
                                    <span class="availability-label">Notes:</span>
                                    <span class="availability-value">${availability.notes}</span>
                                </div>
                                ` : ''}
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="deleteAvailability(${staffId}, ${availability.id})">Delete</button>
                        </div>
                    `;
                });

                submittedDiv.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading availability:', error);
                document.getElementById('submitted-availability').innerHTML = '<p class="placeholder">Error loading availability</p>';
            });
    } catch (error) {
        console.error('Error updating availability display:', error);
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

    // Render booking form
    renderBookingForm(data.patient);
}

// PATIENT BOOKING FORM
function renderBookingForm(patient) {
    const bookingContainer = document.getElementById('booking-form-container');
    bookingContainer.innerHTML = '';

    if (!patient) {
        bookingContainer.innerHTML = '<p class="placeholder">Select a patient to book an appointment</p>';
        return;
    }

    const html = `
        <form id="booking-form" class="booking-form">
            <!-- Patient Info (Read-only) -->
            <div class="form-group">
                <label>Patient Name:</label>
                <input type="text" value="${patient.name}" disabled class="form-input-disabled">
            </div>

            <!-- Professional Selection -->
            <div class="form-group">
                <label for="booking-professional">Select Healthcare Professional:</label>
                <select id="booking-professional" class="form-input" required>
                    <option value="">-- Choose professional --</option>
                </select>
            </div>

            <!-- Service Type -->
            <div class="form-group">
                <label for="booking-service">Service Type:</label>
                <select id="booking-service" class="form-input" required>
                    <option value="">-- Choose service --</option>
                    <option value="Acute">Acute Care</option>
                    <option value="Palliative">Palliative Care</option>
                    <option value="Infection">Infection Management</option>
                    <option value="Geriatrics">Geriatric Care</option>
                </select>
            </div>

            <!-- Appointment Date -->
            <div class="form-group">
                <label for="booking-date">Preferred Date:</label>
                <input type="date" id="booking-date" class="form-input" required>
            </div>

            <!-- Appointment Time -->
            <div class="form-group">
                <label for="booking-time">Preferred Time:</label>
                <select id="booking-time" class="form-input" required>
                    <option value="">-- Choose time --</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                </select>
            </div>

            <!-- Duration -->
            <div class="form-group">
                <label for="booking-duration">Duration:</label>
                <select id="booking-duration" class="form-input">
                    <option value="30">30 minutes</option>
                    <option value="45" selected>45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                </select>
            </div>

            <!-- Priority -->
            <div class="form-group">
                <label for="booking-priority">Priority:</label>
                <select id="booking-priority" class="form-input">
                    <option value="normal" selected>Normal</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label for="booking-notes">Additional Notes:</label>
                <textarea id="booking-notes" class="form-input" placeholder="Any special requirements..." rows="3"></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">📅 Book Appointment</button>
                <button type="reset" class="btn btn-secondary">Clear Form</button>
            </div>
        </form>
    `;

    bookingContainer.innerHTML = html;

    // Populate professional dropdown
    populateProfessionalDropdown();

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('booking-date').setAttribute('min', minDate);

    // Setup form submission
    document.getElementById('booking-form').addEventListener('submit', submitBooking);
}

// Populate professional dropdown with staff
function populateProfessionalDropdown() {
    const select = document.getElementById('booking-professional');
    if (!select || appState.staff.length === 0) return;

    select.innerHTML = '<option value="">-- Choose professional --</option>';

    appState.staff.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.id;
        option.textContent = `${staff.name} (${staff.role})`;
        select.appendChild(option);
    });
}

// Submit booking
async function submitBooking(e) {
    e.preventDefault();

    try {
        // Get patient ID from selector
        const patientSelect = document.getElementById('patient-select');
        const patientId = patientSelect.value;
        const patientName = patientSelect.options[patientSelect.selectedIndex].text;

        // Get form values
        const professionalId = document.getElementById('booking-professional').value;
        const professionalSelect = document.getElementById('booking-professional');
        const professionalName = professionalSelect.options[professionalSelect.selectedIndex].text;

        const serviceType = document.getElementById('booking-service').value;
        const bookingDate = document.getElementById('booking-date').value;
        const bookingTime = document.getElementById('booking-time').value;
        const duration = document.getElementById('booking-duration').value;
        const priority = document.getElementById('booking-priority').value;
        const notes = document.getElementById('booking-notes').value;

        // Validation
        if (!patientId || !professionalId || !serviceType || !bookingDate || !bookingTime) {
            alert('❌ Please fill in all required fields');
            return;
        }

        // Get patient contact info (from appState)
        const patient = appState.patients.find(p => p.id === parseInt(patientId));
        if (!patient) {
            alert('❌ Patient not found');
            return;
        }

        // Prepare booking data
        const bookingData = {
            patientId: parseInt(patientId),
            patientName: patientName,
            patientPhone: patient.phone || 'N/A',
            patientEmail: patient.email || 'N/A',
            professionalId: parseInt(professionalId),
            professionalName: professionalName,
            serviceType: serviceType,
            bookingDate: bookingDate,
            bookingTime: bookingTime,
            duration: duration + ' minutes',
            location: patient.address,
            notes: notes,
            preferredLanguage: 'English',
            priority: priority
        };

        // Send to backend
        const response = await fetch(`${API_BASE}/bookings/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Appointment booked successfully!\n\nBooking ID: ${result.booking.id}\nDate: ${bookingDate}\nTime: ${bookingTime}`);
            document.getElementById('booking-form').reset();
            
            // Reload patient data to refresh
            loadPatientData(patientId);
        } else {
            alert('❌ Error: ' + (result.error || 'Failed to book appointment'));
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('❌ Error booking appointment');
    }
}

// ===== NAVIGATION =====

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Switch view
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Hide all views
    const views = document.querySelectorAll('.dashboard-view');
    views.forEach(view => view.classList.remove('active'));
    
    // Show selected view
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.classList.add('active');
        appState.currentView = viewName;
        
        // Load data for the view
        if (viewName === 'supervisor') {
            loadSupervisorData();
        } else if (viewName === 'coordinator') {
            loadCoordinatorData();
        }
    }
}

// ===== POPULATE SELECTORS =====

function populateStaffSelector() {
    const select = document.getElementById('staff-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choose staff --</option>';
    
    appState.staff.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.id;
        option.textContent = staff.name;
        select.appendChild(option);
    });
}

function populatePatientSelector() {
    const select = document.getElementById('patient-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choose patient --</option>';
    
    appState.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.name;
        select.appendChild(option);
    });
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Coordinator buttons
    const runSchedulerBtn = document.getElementById('run-scheduler');
    if (runSchedulerBtn) {
        runSchedulerBtn.addEventListener('click', runScheduler);
    }

    const exportCsvBtn = document.getElementById('export-csv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportSchedule);
    }

    const refreshScheduleBtn = document.getElementById('refresh-schedule');
    if (refreshScheduleBtn) {
        refreshScheduleBtn.addEventListener('click', () => loadCoordinatorData());
    }

    // Professional staff selector
    const staffSelect = document.getElementById('staff-select');
    if (staffSelect) {
        staffSelect.addEventListener('change', (e) => {
            const staffId = e.target.value;
            if (staffId) {
                loadProfessionalData(staffId);
            }
        });
    }

    // Patient selector
    const patientSelect = document.getElementById('patient-select');
    if (patientSelect) {
        patientSelect.addEventListener('change', (e) => {
            const patientId = e.target.value;
            if (patientId) {
                loadPatientData(patientId);
            }
        });
    }

    // Manual Adjustments
    const manualAdjustBtn = document.getElementById('manual-adjust');
    if (manualAdjustBtn) {
        manualAdjustBtn.addEventListener('click', () => {
            alert('Manual adjustments feature coming soon!');
        });
    }
}

// ===== AVAILABILITY FUNCTIONS =====

function setupAvailabilityEventListeners() {
    const submitBtn = document.getElementById('submit-availability');
    const clearBtn = document.getElementById('clear-form');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAvailability);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAvailabilityForm);
    }
}

function setupStaffSelectorListener() {
    const staffSelect = document.getElementById('staff-select');
    if (staffSelect) {
        staffSelect.addEventListener('change', async (e) => {
            const staffId = e.target.value;
            if (staffId) {
                updateProfessionalDashboardWithAvailability(staffId);
            } else {
                const submittedDiv = document.getElementById('submitted-availability');
                if (submittedDiv) {
                    submittedDiv.innerHTML = '<p class="placeholder">Select a staff member</p>';
                }
            }
        });
    }
}

async function submitAvailability() {
    try {
        // Get selected staff
        const staffSelect = document.getElementById('staff-select');
        const staffId = staffSelect.value;
        const staffName = staffSelect.options[staffSelect.selectedIndex].text;

        if (!staffId) {
            alert('Please select a staff member first');
            return;
        }

        // Get selected days
        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        const days = Array.from(dayCheckboxes).map(cb => cb.value);

        if (days.length === 0) {
            alert('Please select at least one day');
            return;
        }

        // Get time inputs
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const maxHours = parseInt(document.getElementById('max-hours').value);

        if (!startTime || !endTime) {
            alert('Please set working hours');
            return;
        }

        // Get coverage areas
        const areaCheckboxes = document.querySelectorAll('.coverage-checkbox:checked');
        const coverageAreas = Array.from(areaCheckboxes).map(cb => cb.value);

        if (coverageAreas.length === 0) {
            alert('Please select at least one coverage area');
            return;
        }

        // Get notes
        const notes = document.getElementById('notes').value;

        // Send to backend
        const response = await fetch(`${API_BASE}/availability/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                staffId: parseInt(staffId),
                staffName: staffName,
                days: days,
                startTime: startTime,
                endTime: endTime,
                maxHours: maxHours,
                coverageAreas: coverageAreas,
                notes: notes
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Availability submitted successfully!');
            clearAvailabilityForm();
            updateProfessionalDashboardWithAvailability(staffId);
        } else {
            alert('❌ Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error submitting availability:', error);
        alert('Error submitting availability');
    }
}

function clearAvailabilityForm() {
    // Uncheck all days
    document.querySelectorAll('.day-checkbox').forEach(cb => cb.checked = false);
    
    // Uncheck all coverage areas
    document.querySelectorAll('.coverage-checkbox').forEach(cb => cb.checked = false);
    
    // Reset times to default
    document.getElementById('start-time').value = '09:00';
    document.getElementById('end-time').value = '17:00';
    
    // Reset max hours
    document.getElementById('max-hours').value = '8';
    
    // Clear notes
    document.getElementById('notes').value = '';
}

async function deleteAvailability(staffId, submissionId) {
    if (confirm('Are you sure you want to delete this availability?')) {
        try {
            const response = await fetch(`${API_BASE}/availability/${staffId}/${submissionId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Availability deleted successfully');
                updateProfessionalDashboardWithAvailability(staffId);
            } else {
                alert('❌ Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting availability:', error);
            alert('Error deleting availability');
        }
    }
}

// ===== SCHEDULER & EXPORT =====

async function runScheduler() {
    try {
        const btn = document.getElementById('run-scheduler');
        btn.disabled = true;
        btn.textContent = '⏳ Running...';

        const response = await fetch(`${API_BASE}/run-scheduler`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            appState.schedule = data.schedule;
            renderCoordinatorDashboard();
            alert('✅ Schedule optimized successfully!');
        }

        btn.disabled = false;
        btn.textContent = '🤖 Run AI Scheduler';
    } catch (error) {
        console.error('Error running scheduler:', error);
        alert('Error running scheduler');
        document.getElementById('run-scheduler').disabled = false;
        document.getElementById('run-scheduler').textContent = '🤖 Run AI Scheduler';
    }
}

function exportSchedule() {
    try {
        window.location.href = `${API_BASE}/export-schedule`;
    } catch (error) {
        console.error('Error exporting schedule:', error);
        alert('Error exporting schedule');
    }
}
