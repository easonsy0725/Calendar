// DOM Elements
const currentDateElement = document.getElementById('current-date');
const todayBtn = document.getElementById('today-btn');
const refreshBtn = document.getElementById('refresh-btn');
const importBtn = document.getElementById('import-btn');
const importIcsBtn = document.getElementById('import-ics-btn');
const connectCaldavBtn = document.getElementById('connect-caldav-btn');
const eventsContainer = document.getElementById('events-container');
const calendarList = document.getElementById('calendar-list');
const viewButtons = document.querySelectorAll('.view-options button');
const eventsCountElement = document.getElementById('events-count');
const calendarsCountElement = document.getElementById('calendars-count');
const upcomingCountElement = document.getElementById('upcoming-count');

// Calendar data
let eventsData = [];
let calendarsData = [];
let selectedCalendar = null;

// Set today's date
function updateCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Initialize the calendar
function initCalendar() {
    updateCurrentDate();
    setupEventListeners();
    updateStats();
}

// Render events to the DOM
function renderEvents() {
    eventsContainer.innerHTML = '';
    
    // Group events by day
    const eventsByDay = {};
    
    eventsData.forEach(event => {
        // Skip events from other calendars if one is selected
        if (selectedCalendar && event.calendar !== selectedCalendar) return;
        
        const eventDate = new Date(event.start);
        const dateKey = eventDate.toDateString();
        
        if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = [];
        }
        
        eventsByDay[dateKey].push(event);
    });
    
    // Sort days
    const sortedDays = Object.keys(eventsByDay).sort((a, b) => 
        new Date(a) - new Date(b)
    );
    
    // Render each day
    sortedDays.forEach(day => {
        const dayDate = new Date(day);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dayHeader;
        if (dayDate.toDateString() === today.toDateString()) {
            dayHeader = "Today";
        } else if (dayDate.toDateString() === tomorrow.toDateString()) {
            dayHeader = "Tomorrow";
        } else {
            dayHeader = dayDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        const dayElement = document.createElement('div');
        dayElement.className = 'event-day';
        
        const dayHeaderElement = document.createElement('div');
        dayHeaderElement.className = 'day-header';
        dayHeaderElement.textContent = dayHeader;
        dayElement.appendChild(dayHeaderElement);
        
        // Sort events by time
        eventsByDay[day].sort((a, b) => 
            new Date(a.start) - new Date(b.start)
        );
        
        // Render each event
        eventsByDay[day].forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = `event-card ${event.type}`;
            
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            
            const startTime = new Date(event.start);
            const endTime = new Date(event.end);
            
            // Format time
            const timeOptions = { hour: 'numeric', minute: '2-digit' };
            eventTime.textContent = `${startTime.toLocaleTimeString([], timeOptions)} - ${endTime.toLocaleTimeString([], timeOptions)}`;
            
            eventCard.appendChild(eventTime);
            
            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-title';
            eventTitle.textContent = event.title;
            eventCard.appendChild(eventTitle);
            
            if (event.location || event.description) {
                const eventDetails = document.createElement('div');
                eventDetails.className = 'event-details';
                
                if (event.location) {
                    const locationElement = document.createElement('div');
                    locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
                    eventDetails.appendChild(locationElement);
                }
                
                if (event.description) {
                    const descriptionElement = document.createElement('div');
                    descriptionElement.innerHTML = `<i class="fas fa-align-left"></i> ${event.description.substring(0, 50)}${event.description.length > 50 ? '...' : ''}`;
                    eventDetails.appendChild(descriptionElement);
                }
                
                eventCard.appendChild(eventDetails);
            }
            
            dayElement.appendChild(eventCard);
        });
        
        eventsContainer.appendChild(dayElement);
    });
    
    // If no events found
    if (Object.keys(eventsByDay).length === 0) {
        const noEvents = document.createElement('div');
        noEvents.className = 'no-events';
        noEvents.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-calendar-plus" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3>No events found</h3>
                <p>Import your calendar using one of the methods above</p>
            </div>
        `;
        eventsContainer.appendChild(noEvents);
    }
}

// Render calendar list
function renderCalendars() {
    calendarList.innerHTML = '';
    
    calendarsData.forEach(calendar => {
        const calendarItem = document.createElement('li');
        calendarItem.className = 'calendar-item';
        calendarItem.dataset.calendar = calendar.name;
        
        calendarItem.innerHTML = `
            <div class="calendar-color" style="background-color: ${calendar.color};"></div>
            <div class="calendar-name">${calendar.name}</div>
            <div class="calendar-events-count">${calendar.eventCount}</div>
        `;
        
        calendarItem.addEventListener('click', () => {
            selectedCalendar = calendar.name;
            document.querySelectorAll('.calendar-item').forEach(item => {
                item.style.backgroundColor = '';
            });
            calendarItem.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
            renderEvents();
        });
        
        calendarList.appendChild(calendarItem);
    });
}

// Update statistics
function updateStats() {
    eventsCountElement.textContent = eventsData.length;
    calendarsCountElement.textContent = calendarsData.length;
    
    // Count upcoming events (within next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingEvents = eventsData.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= today && eventDate <= nextWeek;
    });
    
    upcomingCountElement.textContent = upcomingEvents.length;
}

// Parse ICS file data
function parseICSData(icsData) {
    try {
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        
        // Reset data
        eventsData = [];
        calendarsData = [];
        const calendarMap = {};
        
        vevents.forEach(vevent => {
            const event = new ICAL.Event(vevent);
            
            // Extract calendar name
            let calendarName = 'Default';
            const calendarProp = vevent.getFirstProperty('x-wr-calname');
            if (calendarProp) {
                calendarName = calendarProp.getFirstValue();
            }
            
            // Create calendar if it doesn't exist
            if (!calendarMap[calendarName]) {
                calendarMap[calendarName] = {
                    name: calendarName,
                    color: getRandomColor(),
                    eventCount: 0
                };
            }
            calendarMap[calendarName].eventCount++;
            
            // Add event
            eventsData.push({
                title: event.summary,
                start: event.startDate.toJSDate().toISOString(),
                end: event.endDate.toJSDate().toISOString(),
                location: event.location,
                description: event.description,
                calendar: calendarName,
                type: getEventType(calendarName)
            });
        });
        
        // Convert calendar map to array
        calendarsData = Object.values(calendarMap);
        
        renderEvents();
        renderCalendars();
        updateStats();
        
        return true;
    } catch (error) {
        console.error('Error parsing ICS file:', error);
        alert('Failed to parse ICS file. Please make sure you uploaded a valid Apple Calendar export.');
        return false;
    }
}

// Helper function to get event type based on calendar name
function getEventType(calendarName) {
    const lowerName = calendarName.toLowerCase();
    
    if (lowerName.includes('work') || lowerName.includes('business')) return 'work';
    if (lowerName.includes('personal') || lowerName.includes('me')) return 'personal';
    if (lowerName.includes('health') || lowerName.includes('fitness')) return 'health';
    if (lowerName.includes('learn') || lowerName.includes('study')) return 'learning';
    if (lowerName.includes('family') || lowerName.includes('kids')) return 'family';
    
    return '';
}

// Helper function to generate random color
function getRandomColor() {
    const colors = ['#007aff', '#34c759', '#ff2d55', '#ff9500', '#af52de', '#ffcc00', '#5856d6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Simulate CalDAV connection (in a real app, this would connect to iCloud)
function connectToCalDAV(appleId, appPassword) {
    // In a real implementation, you would connect to:
    // Server: caldav.icloud.com
    // Username: Apple ID
    // Password: App-specific password
    
    // For this demo, we'll simulate with sample data
    if (!appleId || !appPassword) {
        alert('Please enter both Apple ID and App Password');
        return;
    }
    
    alert(`Connecting to iCloud with Apple ID: ${appleId}\n\nIn a real application, this would securely connect to Apple's CalDAV server using your credentials. For this demo, we'll load sample events.`);
    
    // Load sample events
    eventsData = [
        {
            title: "Team Meeting",
            start: new Date(2025, 5, 26, 9, 0).toISOString(),
            end: new Date(2025, 5, 26, 10, 30).toISOString(),
            location: "Conference Room A",
            description: "Quarterly planning meeting",
            calendar: "Work",
            type: "work"
        },
        {
            title: "Lunch with Alex",
            start: new Date(2025, 5, 26, 12, 0).toISOString(),
            end: new Date(2025, 5, 26, 13, 0).toISOString(),
            location: "Downtown Cafe",
            description: "",
            calendar: "Personal",
            type: "personal"
        },
        {
            title: "Gym Session",
            start: new Date(2025, 5, 27, 7, 0).toISOString(),
            end: new Date(2025, 5, 27, 8, 0).toISOString(),
            location: "Fitness Center",
            description: "Personal training session",
            calendar: "Health",
            type: "health"
        }
    ];
    
    calendarsData = [
        { name: "Work", color: "#34c759", eventCount: 1 },
        { name: "Personal", color: "#af52de", eventCount: 1 },
        { name: "Health", color: "#ff2d55", eventCount: 1 }
    ];
    
    renderEvents();
    renderCalendars();
    updateStats();
}

// Set up event listeners
function setupEventListeners() {
    // Today button
    todayBtn.addEventListener('click', () => {
        updateCurrentDate();
        alert('Navigating to today\'s date');
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', () => {
        alert('Refreshing calendar data...');
        // In a real app, this would reload events from the server
    });
    
    // View option buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // ICS Import button
    importIcsBtn.addEventListener('click', () => {
        document.getElementById('ics-file').click();
    });
    
    // ICS File input change
    document.getElementById('ics-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const icsData = e.target.result;
            parseICSData(icsData);
        };
        reader.readAsText(file);
    });
    
    // CalDAV Connect button
    connectCaldavBtn.addEventListener('click', () => {
        const appleId = document.getElementById('apple-id').value;
        const appPassword = document.getElementById('app-password').value;
        connectToCalDAV(appleId, appPassword);
    });
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', initCalendar);