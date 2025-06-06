import React, { Component } from 'react';
import './IDCardBatchGenerator.css';
import IDCardRenderer from './IDCardRenderer';

class IDCardBatchGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generatingCards: false,
      generatedCount: 0,
      totalCount: 0,
      error: null,
      currentBatch: 0,
      batchSize: 10 // Generate more cards at a time - increased limit
    };
  }

  componentDidMount() {
    const { students, template } = this.props;
    if (students && students.length > 0 && template) {
      this.setState({
        totalCount: students.length
      });
    }
  }

  handleGenerationComplete = (studentId) => {
    console.log(`PDF generated for student: ${studentId}`);
    
    this.setState(prevState => ({
      generatedCount: prevState.generatedCount + 1
    }), () => {
      this.checkCompletion();
      this.processNextBatch();
    });
  };

  checkCompletion = () => {
    const { generatedCount, totalCount } = this.state;
    
    // If all cards have been generated, notify parent component
    if (generatedCount >= totalCount) {
      console.log(`All ${totalCount} ID cards generated successfully!`);
      setTimeout(() => {
        this.setState({ 
          generatingCards: false,
          currentBatch: 0,
          generatedCount: 0 
        });
        if (this.props.onComplete) {
          this.props.onComplete();
        }
      }, 2000); // Give time for final PDFs to download
    }
  };

  processNextBatch = () => {
    const { currentBatch, batchSize, generatedCount } = this.state;
    const { students } = this.props;
    
    // Check if we need to start the next batch
    const currentBatchEnd = (currentBatch + 1) * batchSize;
    const nextBatchStart = currentBatchEnd;
    
    if (nextBatchStart < students.length && generatedCount >= currentBatchEnd) {
      // Reduced delay for faster processing
      setTimeout(() => {
        this.setState(prevState => ({
          currentBatch: prevState.currentBatch + 1
        }));
        console.log(`Starting batch ${currentBatch + 2} - processing students ${nextBatchStart + 1} to ${Math.min(nextBatchStart + batchSize, students.length)}`);
      }, 800); // Reduced delay for faster processing
    }
  };

  generateCards = () => {
    const { students, template } = this.props;
    
    if (!students || students.length === 0 || !template) {
      this.setState({ error: 'No students or template provided' });
      return;
    }

    // COMPLETE CLEANUP - Clear ALL tracking to allow unlimited re-downloads
    if (typeof window !== 'undefined') {
      try {
        // Clear ALL session storage
        sessionStorage.clear();
        
        // Clear any window-based tracking
        window.resetIDCardTrackers = true;
        
        // Clear any existing timeouts
        for (let i = 1; i < 99999; i++) window.clearTimeout(i);
        
        console.log('COMPLETE CLEANUP: All tracking cleared - unlimited re-downloads enabled');
      } catch {
        console.log('Cleanup attempted');
      }
    }
    
    // Reset all state for fresh generation
    this.setState({
      generatingCards: true,
      generatedCount: 0,
      totalCount: students.length,
      currentBatch: 0,
      error: null
    });

    console.log(`Starting generation of ${students.length} ID cards in batches of ${this.state.batchSize} - NO RESTRICTIONS`);
  };

  // Get students for current batch
  getCurrentBatchStudents = () => {
    const { students } = this.props;
    const { currentBatch, batchSize } = this.state;
    
    const startIndex = currentBatch * batchSize;
    const endIndex = Math.min(startIndex + batchSize, students.length);
    
    return students.slice(startIndex, endIndex);
  };

  render() {
    const { students, template } = this.props;
    const { generatingCards, generatedCount, totalCount, error, currentBatch, batchSize } = this.state;

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    const currentBatchStudents = generatingCards ? this.getCurrentBatchStudents() : [];
    const currentBatchNumber = currentBatch + 1;
    const totalBatches = Math.ceil(totalCount / batchSize);

    return (
      <div className="id-card-generator-container">
        {!generatingCards ? (
          <div className="generation-controls">
            <button 
              className="generate-cards-button" 
              onClick={this.generateCards}
              disabled={!students || students.length === 0 || !template}
            >
              Generate {students?.length || 0} ID Card{students?.length !== 1 ? 's' : ''}
            </button>
            <p className="generation-info">
              Click the button above to generate ID cards for {students?.length || 0} selected student{students?.length !== 1 ? 's' : ''}.
              <br />
              <small>Cards will be generated in batches of {batchSize} to ensure optimal performance.</small>
            </p>
          </div>
        ) : (
          <div className="generation-progress">
            <div className="progress-indicator">
              <div 
                className="progress-bar" 
                style={{ width: `${(generatedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Generating ID Cards: {generatedCount} of {totalCount} completed
              <br />
              <small>Processing Batch {currentBatchNumber} of {totalBatches}</small>
            </div>
          </div>
        )}

        {/* Render the ID cards for current batch (hidden but properly positioned) */}
        {generatingCards && currentBatchStudents.length > 0 && (
          <div className="id-cards-batch-container">
            {currentBatchStudents.map((student, index) => (
              <IDCardRenderer 
                key={`${student.id}-${currentBatch}`}
                student={student}
                template={template}
                onGenerate={this.handleGenerationComplete}
                style={{
                  animationDelay: `${index * 200}ms` // Reduced stagger for faster processing
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default IDCardBatchGenerator; 