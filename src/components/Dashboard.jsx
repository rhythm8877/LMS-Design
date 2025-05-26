import React, { Component } from 'react';
import '../styles/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCalendar: false,
      currentMonth: new Date(),
      selectedDate: new Date(),
      statusCards: [
        { title: 'Lessons', count: 42, completed: 73, total: 73, percentage: 59, icon: '📚' },
        { title: 'Assignments', count: 8, completed: 42, total: 42, percentage: 99, icon: '📝' },
        { title: 'Test', count: 3, completed: 15, total: 15, percentage: 99, icon: '📊' }
      ],
      upcomingTasks: [
        { id: 1, title: 'Your Practical theory', date: '29', month: 'Sept', type: 'Assignment', icon: '🔴' },
        { id: 2, title: 'Your Practical theory 1', date: '29', month: 'Oct', type: 'Test', icon: '🟢' },
        { id: 3, title: 'Your Practical theory 2', date: '29', month: 'Nov', type: 'Lesson', icon: '🟠' },
        { id: 4, title: 'Your Practical theory 3', date: '29', month: 'Dec', type: 'Assignment', icon: '🔴' },
      ],
      courses: [
        { id: 1, title: 'Web Design: Form Figma to...', icon: '⚒️', lesson: 15, assignment: 12, test: 10 },
        { id: 2, title: 'HTML Basic', icon: '⚡', lesson: 10, assignment: 9, test: 8 },
        { id: 3, title: 'Data with Python', icon: '🔮', lesson: 14, assignment: 11, test: 13 },
        { id: 4, title: 'Graphic Design with Adobe Suit', icon: '🎨', lesson: 14, assignment: 11, test: 13 },
        { id: 5, title: 'Digital Marketing', icon: '📱', lesson: 0, assignment: 0, test: 0 }
      ]
    };
  }

  toggleCalendar = () => {
    this.setState(prevState => ({
      showCalendar: !prevState.showCalendar
    }));
  }

  renderCalendarDays() {
    const { currentMonth, selectedDate } = this.state;
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const days = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Add weekday headers
    weekdays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">{day}</div>
      );
    });
    
    // Get the first day of the month
    let startDate = new Date(monthStart);
    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    let startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
    
    // Fill in days from previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`prev-${i}`} className="calendar-day empty"></div>);
    }
    
    // Fill in days of current month
    const daysInMonth = monthEnd.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = day === selectedDate.getDate() && 
                      currentMonth.getMonth() === selectedDate.getMonth() && 
                      currentMonth.getFullYear() === selectedDate.getFullYear();
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday ? 'selected' : ''}`}
          onClick={() => this.setState({ selectedDate: date })}
        >
          {day}
        </div>
      );
    }
    
    return days;
  }

  renderCircularProgress(percentage, color) {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const strokeWidth = 10;
    
    return (
      <div className="circular-progress">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color || "#4CAF50"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
            {percentage}%
          </text>
        </svg>
      </div>
    );
  }

  render() {
    const { upcomingTasks, courses, showCalendar, currentMonth } = this.state;
    
    return (
      <div className="dashboard">
        {/* Status Cards */}
        <div className="status-section-container">
          <div className="status-section">
            <h3>Status</h3>
            <div className="status-cards">
              <div className="status-card lessons">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 19C16 16.7909 14.2091 15 12 15C9.79086 15 8 16.7909 8 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-progress">
                  {this.renderCircularProgress(59, "#F39C12")}
                </div>
                <div className="status-details">
                  <h2>42</h2>
                  <h4>Lessons</h4>
                  <p>of 73 completed</p>
                </div>
              </div>
              <div className="status-card assignments">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 3.5L18 2L16.5 3.5L15 2L13.5 3.5L12 2L10.5 3.5L9 2L7.5 3.5L6 2V22L7.5 20.5L9 22L10.5 20.5L12 22L13.5 20.5L15 22L16.5 20.5L18 22L19.5 20.5L21 22V2L19.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 8H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 16H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-progress">
                  {this.renderCircularProgress(99, "#E74C3C")}
                </div>
                <div className="status-details">
                  <h2>08</h2>
                  <h4>Assignments</h4>
                  <p>of 42 completed</p>
                </div>
              </div>
              <div className="status-card test">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3V21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 9L14 13L10 9L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="status-progress">
                  {this.renderCircularProgress(99, "#2ECC71")}
                </div>
                <div className="status-details">
                  <h2>03</h2>
                  <h4>Test</h4>
                  <p>of 15 completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Upcoming Section */}
        <div className="dashboard-row">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div className="calendar-header">
              <h3>Calendar</h3>
              <div className="month-navigation">
                <button className="nav-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="current-month">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button className="nav-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="calendar-container">
              <div className="calendar-mobile-toggle" onClick={this.toggleCalendar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H21" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14H8.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14H12.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 14H16.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18H8.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18H12.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18H16.01" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Calendar
              </div>
              <div className={`calendar ${showCalendar ? 'show' : ''}`}>
                <div className="calendar-grid">
                  {this.renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Section */}
          <div className="upcoming-section">
            <h3>Upcoming</h3>
            <div className="upcoming-tasks">
              {upcomingTasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-date">
                    <span className="day">{task.date}</span>
                    <span className="month">{task.month}</span>
                  </div>
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <span className={`task-type ${task.type.toLowerCase()}`}>
                      {task.type === 'Assignment' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#E74C3C"/>
                        </svg>
                      )}
                      {task.type === 'Lesson' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#F39C12"/>
                        </svg>
                      )}
                      {task.type === 'Test' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#2ECC71"/>
                        </svg>
                      )}
                      {task.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="my-courses-section">
          <h3>My Courses</h3>
          <div className="courses-header">
            <span className="course-column">#</span>
            <span className="course-column">Course Name</span>
            <span className="course-column">Completed</span>
            <span className="course-column">Status</span>
          </div>
          <div className="courses-list">
            {courses.map((course, index) => (
              <div key={course.id} className="course-row">
                <span className="course-number">{index + 1}</span>
                <div className="course-name">
                  <span className="course-icon">{course.icon}</span>
                  <span>{course.title}</span>
                </div>
                <div className="course-completion">
                  <div className="completion-stats">
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10H16" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 14H16" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 18H12" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {course.lesson}
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 13H8" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17H8" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 9H9H8" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {course.assignment}
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {course.test}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-value" 
                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="course-status">
                  {index < 2 ? (
                    <span className="status-badge active">Active</span>
                  ) : (
                    <span className="status-badge completed">Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard; 