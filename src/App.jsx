import React, { Component } from 'react';
import './App.css';
import Dashboard from './components/Dashboard.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="content-container">
            <Dashboard />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
