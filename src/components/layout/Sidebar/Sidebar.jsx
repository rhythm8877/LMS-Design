import React, { Component } from 'react';
import dummyLogo from '../../../assets/tuition-logo.svg';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    
    // Get the current page from localStorage or default to Dashboard
    const savedPage = localStorage.getItem('currentPage') || 'Dashboard';
    
    this.state = {
      activeItem: savedPage,
      isOpen: false,
      navItems: [
        { id: 1, name: 'Dashboard', icon: '⊞' },
        { id: 2, name: 'ID Card', icon: '🪪' },
        { id: 3, name: 'Courses', icon: '📚' },
        { id: 4, name: 'Chapter', icon: '📄' },
        { id: 5, name: 'Help', icon: '❓' },
        { id: 6, name: 'Setting', icon: '⚙️' },
        { id: 7, name: 'FAQ', icon: '💬' },
        { id: 8, name: 'Logout', icon: '↩️' },
      ]
    };
  }

  componentDidUpdate(prevProps) {
    // If the App's currentPage changes, update the sidebar's activeItem
    if (this.props.currentPage && this.props.currentPage !== this.state.activeItem) {
      this.setState({ activeItem: this.props.currentPage });
    }
  }

  handleNavClick = (name) => {
    this.setState({ activeItem: name });
    
    // Call the onNavigate prop if provided
    if (this.props.onNavigate) {
      this.props.onNavigate(name);
    }
  }

  toggleSidebar = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  render() {
    const { activeItem, isOpen, navItems } = this.state;

    return (
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={dummyLogo} alt="Tuition Logo" className="logo" />
        </div>
        
        <button className="hamburger" onClick={this.toggleSidebar}>
          <span className="hamburger-icon">☰</span>
        </button>
        
        <div className="nav-items">
          {navItems.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${activeItem === item.name ? 'active' : ''}`}
              onClick={() => this.handleNavClick(item.name)}
            >
              <span className="icon">{item.icon}</span>
              <span className="name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Sidebar; 