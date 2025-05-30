import React, { Component } from 'react';
import './TemplateGrid.css';

class TemplateGrid extends Component {
  render() {
    const { templates, selectedTemplate, onSelect } = this.props;
    
    return (
      <div className="template-grid">
        {templates.map(template => (
          <div 
            key={template.id}
            className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => onSelect(template)}
          >
            <div className="template-image-container">
              <img 
                src={template.image} 
                alt={template.name} 
                className="template-image"
              />
            </div>
            <div className="template-name">{template.name}</div>
          </div>
        ))}
      </div>
    );
  }
}

export default TemplateGrid;
