import React, { Component } from 'react';
import dummyLogo from '../../assets/tuition-logo.svg';
import '../../styles/Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'Dashboard',
      isOpen: false,
      navItems: [
        { id: 1, name: 'Dashboard', icon: '⊞' },
        { id: 2, name: 'Courses', icon: '📚' },
        { id: 3, name: 'Chapter', icon: '📄' },
        { id: 4, name: 'Help', icon: '❓' },
        { id: 5, name: 'Setting', icon: '⚙️' },
        { id: 6, name: 'FAQ', icon: '💬' },
        { id: 7, name: 'Logout', icon: '↩️' },
      ]
    };
  }

  handleNavClick = (name) => {
    this.setState({ activeItem: name });
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