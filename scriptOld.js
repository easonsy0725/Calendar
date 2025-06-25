// // update button
// const currentDataElement = document.querySelector('.current-data');
// const todayBtn = document.getElementById('today-btn');
// const refreshBtn = document.getElementById('refresh-btn');

// //set today's date
// const today = new Date(2025, 0, 1); // jan = 0 , Dec = 11
// const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
// currentDataElement.textContent = today.toLocaleDateString('en-US', options);

// // Button event handlers
// todayBtn.addEventListener('click', () => {
//   alert('Navigating to today\'s data...');
//   // Logic to navigate to today's data
// });

// refreshBtn.addEventListener('click', () => {
//   alert('Refreshing data...');
//   // Logic to refresh the data
// });

// // view option buttons
// const viewButtons = document.querySelectorAll('.view-options button');
// viewButtons.forEach(button => {
//   button.addEventListener('click', () => {
//     viewButtons.forEach(btn => btn.classList.remove('active'));
//     button.classList.add('active');
//     // Logic to change the view mode
//   });
// });

// // calendar item selection
// const calendarItems = document.querySelectorAll('.calendar-item');
// calendarItems.forEach(item => {
//   item.addEventListener('click', () => {
//     calendarItems.forEach(i => i.classList.remove('selected'));
//     item.classList.add('selected');
//     // Logic to handle calendar item selection
//   });
// });

// //loading data (sim)
// const loadingElement = document.querySelector('.loading');
// function simulateLoading() {  
//   loadingElement.style.display = 'block';
//   setTimeout(() => {
//     loadingElement.style.display = 'none';
//     alert('Data loaded successfully!');
//   }, 2000); // Simulate a 2-second loading time
// } 
// simulateLoading();


// Sample event data
const eventsData = [
    {
        day: "Today",
        events: [
            {
                time: "9:00 AM - 10:30 AM",
                title: "Team Meeting",
                type: "work",
                details: [
                    { icon: "fas fa-map-marker-alt", text: "Conference Room A" },
                    { icon: "fas fa-user-friends", text: "John, Sarah, Mike" }
                ]
            },
            {
                time: "12:00 PM - 1:00 PM",
                title: "Lunch with Alex",
                type: "personal",
                details: [
                    { icon: "fas fa-map-marker-alt", text: "Downtown Cafe" }
                ]
            },
            {
                time: "3:00 PM - 4:30 PM",
                title: "Web Development Workshop",
                type: "learning",
                details: [
                    { icon: "fas fa-video", text: "Zoom Meeting" }
                ]
            }
        ]
    },
    {
        day: "Tomorrow",
        events: [
            {
                time: "7:00 AM - 8:00 AM",
                title: "Gym Session",
                type: "health",
                details: [
                    { icon: "fas fa-map-marker-alt", text: "Fitness Center" }
                ]
            },
            {
                time: "10:00 AM - 11:30 AM",
                title: "Client Presentation",
                type: "work",
                details: [
                    { icon: "fas fa-map-marker-alt", text: "Client Office" },
                    { icon: "fas fa-file-pdf", text: "Project_Final.pdf" }
                ]
            }
        ]
    },
    {
        day: "This Week",
        events: [
            {
                time: "Fri, 10:00 AM",
                title: "Doctor Appointment",
                type: "personal",
                details: []
            },
            {
                time: "Sat, 2:00 PM",
                title: "Birthday Party",
                type: "",
                details: [
                    { icon: "fas fa-map-marker-alt", text: "Central Park" }
                ]
            }
        ]
    }
];

// DOM Elements
const currentDateElement = document.querySelector('.current-date');
const todayBtn = document.getElementById('today-btn');
const refreshBtn = document.getElementById('refresh-btn');
const eventsContainer = document.querySelector('.events-container');
const viewButtons = document.querySelectorAll('.view-options button');
const calendarItems = document.querySelectorAll('.calendar-item');

// Initialize the calendar
function initCalendar() {
    // Set today's date
    const today = new Date(2025, 5, 26); // June is month 5 (0-indexed)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = today.toLocaleDateString('en-US', options);
    
    // Populate events
    renderEvents();
    
    // Set up event listeners
    setupEventListeners();
}

// Render events to the DOM
function renderEvents() {
    eventsContainer.innerHTML = '';
    
    eventsData.forEach(dayData => {
        const dayElement = document.createElement('div');
        dayElement.className = 'event-day';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayData.day;
        dayElement.appendChild(dayHeader);
        
        dayData.events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = `event-card ${event.type}`;
            
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            eventTime.textContent = event.time;
            eventCard.appendChild(eventTime);
            
            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-title';
            eventTitle.textContent = event.title;
            eventCard.appendChild(eventTitle);
            
            if (event.details.length > 0) {
                const eventDetails = document.createElement('div');
                eventDetails.className = 'event-details';
                
                event.details.forEach(detail => {
                    const detailElement = document.createElement('div');
                    detailElement.innerHTML = `<i class="${detail.icon}"></i> ${detail.text}`;
                    eventDetails.appendChild(detailElement);
                });
                
                eventCard.appendChild(eventDetails);
            }
            
            dayElement.appendChild(eventCard);
        });
        
        eventsContainer.appendChild(dayElement);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Today button
    todayBtn.addEventListener('click', () => {
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
    
    // Calendar item selection
    calendarItems.forEach(item => {
        item.addEventListener('click', () => {
            calendarItems.forEach(i => i.style.backgroundColor = '');
            item.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
        });
    });
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', initCalendar);