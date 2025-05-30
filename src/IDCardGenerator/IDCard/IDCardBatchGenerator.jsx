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
      error: null
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
    this.setState(prevState => ({
      generatedCount: prevState.generatedCount + 1
    }), this.checkCompletion);
  };

  checkCompletion = () => {
    const { generatedCount, totalCount } = this.state;
    
    // If all cards have been generated, notify parent component
    if (generatedCount >= totalCount) {
      setTimeout(() => {
        this.setState({ generatingCards: false });
        if (this.props.onComplete) {
          this.props.onComplete();
        }
      }, 1000);
    }
  };

  generateCards = () => {
    const { students, template } = this.props;
    
    if (!students || students.length === 0 || !template) {
      this.setState({ error: 'No students or template provided' });
      return;
    }
    
    this.setState({
      generatingCards: true,
      generatedCount: 0,
      totalCount: students.length,
      error: null
    });
  };

  render() {
    const { students, template } = this.props;
    const { generatingCards, generatedCount, totalCount, error } = this.state;

    if (error) {
      return <div className="error-message">{error}</div>;
    }

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
              Generating ID Card {generatedCount} of {totalCount}...
            </div>
          </div>
        )}

        {/* Render the ID cards (hidden from view) */}
        <div className="id-cards-container" style={{ position: 'absolute', left: '-9999px' }}>
          {generatingCards && students && students.map(student => (
            <IDCardRenderer 
              key={student.id}
              student={student}
              template={template}
              onGenerate={this.handleGenerationComplete}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default IDCardBatchGenerator; 