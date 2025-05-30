import React, { Component } from 'react';
import IDCardRenderer from './IDCardRenderer';
import './IDCardTemplateModal.css';
import TemplateGrid from './TemplateGrid';

// Import template images
import blueOrangeTemplate from './templates/Blue And Orange Highschool ID Card.png';
import blueWhiteTemplate from './templates/Blue and White Highschool Id Card.png';
import blueWhiteClassicTemplate from './templates/Blue and White Highschool ID Cardpng.png';
import redOrangeTemplate from './templates/Red and Orange Highschool ID Card.png';
import redClassicTemplate from './templates/Red Highschool ID Card.png';
import whiteGreenTemplate from './templates/White And Green Highschool ID Card.png';

// Template data
const templateData = {
  vertical: [
    {
      id: 'v1',
      name: 'Red and Orange',
      image: redOrangeTemplate,
      orientation: 'vertical'
    },
    {
      id: 'v2',
      name: 'Red Classic',
      image: redClassicTemplate,
      orientation: 'vertical'
    },
    {
      id: 'v3',
      name: 'Blue and White Classic',
      image: blueWhiteClassicTemplate,
      orientation: 'vertical'
    }
  ],
  horizontal: [
    {
      id: 'h1',
      name: 'Blue And Orange',
      image: blueOrangeTemplate,
      orientation: 'horizontal'
    },
    {
      id: 'h2',
      name: 'Blue and White',
      image: blueWhiteTemplate,
      orientation: 'horizontal'
    },
    {
      id: 'h3',
      name: 'White And Green',
      image: whiteGreenTemplate,
      orientation: 'horizontal'
    }
  ]
};

// Generate a unique session ID for this component instance
const MODAL_SESSION_ID = Date.now().toString();

class IDCardTemplateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'vertical',
      selectedTemplate: null,
      generatingCards: false,
      completedCount: 0,
      totalCount: 0,
      errorMessage: '',
      showProgressOverlay: false,
      processedStudentIds: new Set() // To prevent duplicate generation
    };
    this.completionTimer = null;
  }

  componentDidUpdate(prevProps) {
    // Reset selection when modal opens
    if (!prevProps.isOpen && this.props.isOpen) {
      this.resetState();
    }

    // Handle completion of all cards
    if (
      this.state.generatingCards && 
      this.state.completedCount > 0 && 
      this.state.completedCount >= this.state.totalCount &&
      prevProps.isOpen === this.props.isOpen // Ensure we don't trigger close when props change
    ) {
      // All cards have been generated, close the modal after a delay
      if (this.completionTimer) clearTimeout(this.completionTimer);
      
      this.completionTimer = setTimeout(() => {
        this.setState({
          generatingCards: false,
          showProgressOverlay: false
        });
        this.props.onClose();
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.completionTimer) {
      clearTimeout(this.completionTimer);
    }
  }

  resetState = () => {
    this.setState({
      selectedTemplate: null,
      generatingCards: false,
      completedCount: 0,
      totalCount: 0,
      errorMessage: '',
      showProgressOverlay: false,
      processedStudentIds: new Set()
    });
    
    // Also reset the session storage if used by IDCardRenderer
    if (typeof window !== 'undefined') {
      window.resetIDCardTrackers = true;
      setTimeout(() => {
        window.resetIDCardTrackers = false;
      }, 100);
    }
  }

  handleTabChange = (tab) => {
    this.setState({
      activeTab: tab,
      selectedTemplate: null
    });
  }

  handleTemplateSelect = (template) => {
    this.setState({
      selectedTemplate: template,
      errorMessage: ''
    });
  }

  handleGenerationComplete = (studentId) => {
    // Prevent duplicate counting - only increment if not already processed
    if (!this.state.processedStudentIds.has(studentId)) {
      const updatedProcessedIds = new Set(this.state.processedStudentIds);
      updatedProcessedIds.add(studentId);
      
      this.setState(prevState => ({
        completedCount: prevState.completedCount + 1,
        processedStudentIds: updatedProcessedIds
      }));
      
      console.log(`PDF generated for student ID ${studentId}. Count: ${this.state.completedCount + 1} of ${this.state.totalCount}`);
    } else {
      console.log(`Already counted student ID ${studentId}`);
    }
  }

  handleGenerate = () => {
    const { selectedStudents } = this.props;
    
    // Clear console to make debugging easier
    console.clear();
    console.log(`Starting generation for ${selectedStudents.length} students`);
    
    // Reset global tracking state if it exists on the IDCardRenderer
    if (typeof window !== 'undefined') {
      // This will reset the global tracker in IDCardRenderer
      window.resetIDCardTrackers = true;
      
      // Give it time to reset before starting new generation
      setTimeout(() => {
        window.resetIDCardTrackers = false;
        
        // Continue with validation and generation after reset
        this.continueGeneration();
      }, 200);
    } else {
      // If window is not available, just continue
      this.continueGeneration();
    }
  }
  
  continueGeneration = () => {
    const { selectedStudents } = this.props;
    
    // Validate that we have selected students
    if (!selectedStudents || selectedStudents.length === 0) {
      this.setState({ errorMessage: 'Please select at least one student.' });
      return;
    }

    // Validate that all selected students have photos
    const studentsWithoutPhotos = selectedStudents.filter(student => !student.photo);
    if (studentsWithoutPhotos.length > 0) {
      this.setState({ errorMessage: 'Please provide images for all selected students.' });
      return;
    }

    if (this.state.selectedTemplate) {
      this.setState({
        totalCount: selectedStudents.length,
        completedCount: 0,
        showProgressOverlay: true,
        generatingCards: true,
        processedStudentIds: new Set() // Reset processed IDs
      });
    }
  }

  render() {
    const { isOpen, onClose, selectedStudents } = this.props;
    const { 
      activeTab, 
      selectedTemplate, 
      generatingCards, 
      completedCount, 
      totalCount, 
      errorMessage, 
      showProgressOverlay 
    } = this.state;

    if (!isOpen) return null;

    return (
      <div className="template-modal-overlay">
        <div className="template-modal">
          <div className="template-modal-header">
            <h2>Choose ID Card Template</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="template-tabs">
            <button 
              className={`tab-button ${activeTab === 'vertical' ? 'active' : ''}`}
              onClick={() => this.handleTabChange('vertical')}
            >
              Vertical
            </button>
            <button 
              className={`tab-button ${activeTab === 'horizontal' ? 'active' : ''}`}
              onClick={() => this.handleTabChange('horizontal')}
            >
              Horizontal
            </button>
          </div>
          
          <div className="template-content">
            {activeTab === 'vertical' && (
              <TemplateGrid 
                templates={templateData.vertical}
                selectedTemplate={selectedTemplate}
                onSelect={this.handleTemplateSelect}
              />
            )}
            
            {activeTab === 'horizontal' && (
              <TemplateGrid 
                templates={templateData.horizontal}
                selectedTemplate={selectedTemplate}
                onSelect={this.handleTemplateSelect}
              />
            )}
          </div>

          {errorMessage && (
            <div className="template-error-message">
              {errorMessage}
            </div>
          )}
          
          <div className="template-modal-footer">
            <button 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="generate-button" 
              onClick={this.handleGenerate}
              disabled={!selectedTemplate || generatingCards}
            >
              Generate ID Card
            </button>
          </div>

          {/* Progress overlay */}
          {showProgressOverlay && (
            <div className="progress-overlay">
              <div className="progress-container">
                <h3>Generating ID Cards</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${Math.min((completedCount / totalCount) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Math.min(completedCount, totalCount)} of {totalCount} ID Cards generated
                </div>
              </div>
            </div>
          )}

          {/* Hidden container for rendering ID cards */}
          <div style={{ position: 'absolute', left: '-9999px' }}>
            {generatingCards && selectedStudents.map((student, index) => (
              <IDCardRenderer 
                key={`${student.id}-${MODAL_SESSION_ID}`}
                student={student}
                template={selectedTemplate}
                onGenerate={() => this.handleGenerationComplete(student.id)}
                // Render with a small delay between each to prevent browser PDF conflicts
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default IDCardTemplateModal;
