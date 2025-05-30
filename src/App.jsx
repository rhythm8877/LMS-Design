import React, { Component } from 'react';
import './App.css';
import Dashboard from './Dashboard/Dashboard.jsx';
import IDCardGenerator from './IDCardGenerator/IDCardGenerator.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import Sidebar from './components/layout/Sidebar/Sidebar.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    
    // Get saved page from localStorage or default to Dashboard
    const savedPage = localStorage.getItem('currentPage') || 'Dashboard';
    
    this.state = {
      currentPage: savedPage
    };
  }

  handleNavigation = (pageName) => {
    // Save to localStorage when navigation changes
    localStorage.setItem('currentPage', pageName);
    this.setState({ currentPage: pageName });
  }

  renderContent() {
    const { currentPage } = this.state;
    
    switch(currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'ID Card':
        return <IDCardGenerator />;
      default:
        return <Dashboard />;
    }
  }

  render() {
    const { currentPage } = this.state;
    
    return (
      <div className="app">
        <Sidebar 
          onNavigate={this.handleNavigation} 
          currentPage={currentPage} 
        />
        <div className="main-content">
          <Navbar title={currentPage} />
          <div className="content-container">
            {this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
