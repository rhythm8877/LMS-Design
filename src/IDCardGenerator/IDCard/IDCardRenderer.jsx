import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component, createRef } from 'react';
import './IDCardRenderer.css';

// School information
const SCHOOL_NAME = "Bison Higher Secondary School";
const SCHOOL_ADDRESS = "123 Education Street, Knowledge City";
const SCHOOL_PHONE = "+91 98765 43210";
const SCHOOL_EMAIL = "info@bisonschool.edu";
const SCHOOL_WEBSITE = "www.bisonschool.edu";

// Create a static ID for this session to prevent duplicates across page refreshes
const SESSION_ID = Date.now().toString();

// Keep track of the last time a PDF was generated to stagger downloads
let lastGenerationTime = 0;
const GENERATION_DELAY = 1000; // Milliseconds between PDF generations

// Create a more reliable tracking system using sessionStorage
const setStudentProcessed = (studentId) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`idcard_${SESSION_ID}_${studentId}`, 'true');
    }
  } catch (e) {
    console.error("Failed to use sessionStorage:", e);
  }
};

const isStudentProcessed = (studentId) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(`idcard_${SESSION_ID}_${studentId}`) === 'true';
    }
  } catch (e) {
    console.error("Failed to use sessionStorage:", e);
  }
  return false;
};

const clearAllProcessed = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Only clear items for this session
      Object.keys(window.sessionStorage)
        .filter(key => key.startsWith(`idcard_${SESSION_ID}`))
        .forEach(key => window.sessionStorage.removeItem(key));
    }
  } catch (e) {
    console.error("Failed to clear sessionStorage:", e);
  }
};

// Template-specific positioning information
const templatePositions = {
  'v1': { // Red and Orange Vertical
    schoolName: { top: '10%', left: '52%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '25%', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '130px', 
      height: '130px',
      borderRadius: '50%' // Circle
    },
    studentName: { top: '60%', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', textAlign: 'center' },
    details: { top: '68%', left: '15%', fontSize: '14px', lineHeight: '1.6' }
  },
  'v2': { // Red Classic
    schoolName: { top: '8%', right: '10%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '22%', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '120px', 
      height: '120px',
      borderRadius: '8px' // Slightly rounded rectangle
    },
    studentName: { top: '58%', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', textAlign: 'center' },
    details: { top: '65%', left: '15%', fontSize: '14px', lineHeight: '1.6' }
  },
  'v3': { // Blue and White Classic
    schoolName: { top: '12%', right: '10%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '25%', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '120px', 
      height: '120px',
      borderRadius: '10px' // Slightly rounded rectangle
    },
    studentName: { top: '60%', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', textAlign: 'center' },
    details: { top: '68%', left: '15%', fontSize: '14px', lineHeight: '1.6' }
  },
  'h1': { // Blue and Orange Horizontal
    schoolName: { top: '15%', right: '50%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '20%', 
      right: '10%', 
      width: '110px', 
      height: '110px',
      borderRadius: '50%' // Circle
    },
    studentName: { top: '25%', left: '10%', fontSize: '20px', textAlign: 'left' },
    details: { top: '38%', left: '10%', fontSize: '14px', lineHeight: '1.6' }
  },
  'h2': { // Blue and White Horizontal
    schoolName: { top: '15%', right: '50%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '20%', 
      right: '10%', 
      width: '110px', 
      height: '110px',
      borderRadius: '8px' // Slightly rounded rectangle
    },
    studentName: { top: '30%', left: '10%', fontSize: '20px', textAlign: 'left' },
    details: { top: '45%', left: '10%', fontSize: '14px', lineHeight: '1.6' }
  },
  'h3': { // White and Green Horizontal
    schoolName: { top: '18%', right: '50%', fontSize: '16px', textAlign: 'right' },
    photo: { 
      top: '20%', 
      right: '10%', 
      width: '110px', 
      height: '110px',
      borderRadius: '8px' // Slightly rounded rectangle
    },
    studentName: { top: '35%', left: '10%', fontSize: '20px', textAlign: 'left' },
    details: { top: '50%', left: '10%', fontSize: '14px', lineHeight: '1.6' }
  }
};

class IDCardRenderer extends Component {
  constructor(props) {
    super(props);
    this.cardRef = createRef();
    this.state = {
      pdfGenerated: false,
      error: null
    };
  }

  componentDidMount() {
    // Check if we need to reset the tracker due to a new batch
    if (typeof window !== 'undefined' && window.resetIDCardTrackers) {
      clearAllProcessed();
      console.log('Reset PDF generation tracker');
      lastGenerationTime = 0; // Reset the generation timer
    }
    
    // Generate PDF when component mounts, but only if not already generated
    const { student, style } = this.props;
    
    // Critical check: Has this student already been processed?
    if (isStudentProcessed(student.id)) {
      console.log(`PDF for student ${student.id} already processed, skipping generation`);
      
      // Still notify parent that we're "done" with this student
      setTimeout(() => {
        if (this.props.onGenerate) {
          this.props.onGenerate(student.id);
        }
      }, 100);
      
      return;
    }
    
    // Mark this student as being processed immediately to prevent race conditions
    setStudentProcessed(student.id);
    
    if (this.props.student && this.props.template && this.cardRef.current) {
      // Calculate delay based on animation delay from style or index
      const animDelay = style && style.animationDelay ? 
        parseInt(style.animationDelay.replace('ms', '')) : 0;
      
      // Ensure we have enough time since last generation
      const now = Date.now();
      const timeSinceLastGeneration = now - lastGenerationTime;
      const neededDelay = Math.max(GENERATION_DELAY - timeSinceLastGeneration, 0) + animDelay;
      
      // Schedule PDF generation with appropriate delay
      setTimeout(() => {
        lastGenerationTime = Date.now();
        this.generatePDF();
      }, neededDelay + 300); // Add base delay for rendering
    }
  }

  // Format class and section display
  formatClassSection = (classNum, section) => {
    const { student } = this.props;
    if (classNum <= 10) {
      return `Class ${classNum}-${section}`;
    } else {
      return `Class ${classNum} ${student.stream || ''}`;
    }
  };

  // Generate and download PDF
  generatePDF = async () => {
    const { student, template, onGenerate } = this.props;
    
    // Extra check to prevent duplicate generation
    if (!this.cardRef.current || this.state.pdfGenerated) return;
    
    try {
      // Mark as generated to prevent duplicate generation
      this.setState({ pdfGenerated: true });
      
      const canvas = await html2canvas(this.cardRef.current, { 
        scale: 3, // Higher quality
        useCORS: true, // For images from other domains
        allowTaint: true,
        logging: false
      });
      
      // Determine PDF dimensions based on template orientation
      const isVertical = template.orientation === 'vertical';
      const pdfWidth = isVertical ? 210 : 297; // A4 sizes in mm
      const pdfHeight = isVertical ? 297 : 210;
      
      // Calculate aspect ratio of the rendered card
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasWidth / canvasHeight;
      
      // Calculate dimensions in the PDF
      let width, height;
      if (isVertical) {
        width = pdfWidth - 40; // 20mm margin on each side
        height = width / aspectRatio;
      } else {
        width = pdfWidth - 40;
        height = width / aspectRatio;
      }
      
      // Create PDF with proper orientation
      const pdf = new jsPDF({
        orientation: isVertical ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Center the ID card in the PDF
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      
      // Add the ID card to the PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        x,
        y,
        width,
        height
      );

      // Generate filename in the format: StudentName-Class-Section.pdf
      const className = student.class.toString();
      const section = student.section || '';
      
      // Use a clean filename without the unique ID suffix
      const fileName = `${student.fullName.replace(/\s+/g, '')}-${className}-${section}.pdf`;
      
      // Generate PDF data
      const pdfOutput = pdf.output('blob');
      
      // Create a temporary link to force download with the exact filename
      const blobUrl = URL.createObjectURL(pdfOutput);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      
      // Append to body, click, and remove to trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // Notify parent component that PDF was generated
      if (onGenerate) {
        // Use a slight delay to ensure the download has started
        setTimeout(() => {
          onGenerate(student.id);
        }, 200);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      this.setState({ 
        error: 'Failed to generate PDF', 
        pdfGenerated: false 
      });
    }
  };

  render() {
    const { student, template } = this.props;
    
    // Get positions for the current template
    const positions = templatePositions[template.id] || templatePositions.v1;

    return (
      <div className="id-card-wrapper">
        <div 
          className={`id-card ${template.orientation}`} 
          ref={this.cardRef}
          style={{ backgroundImage: `url(${template.image})` }}
        >
          {/* School Name */}
          <div 
            className="school-name"
            style={{
              position: 'absolute',
              ...positions.schoolName
            }}
          >
            {SCHOOL_NAME}
          </div>
          
          {/* Student Photo */}
          <div 
            className="student-photo-container"
            style={{
              position: 'absolute',
              ...positions.photo
            }}
          >
            {student.photo ? (
              <img 
                src={student.photo} 
                alt={student.fullName}
                className="student-id-photo"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="photo-placeholder">No Photo</div>
            )}
          </div>
          
          {/* Student Name */}
          <div 
            className="student-name"
            style={{
              position: 'absolute',
              ...positions.studentName,
              fontWeight: 'bold'
            }}
          >
            {student.fullName}
          </div>
          
          {/* Student Details */}
          <div 
            className="student-details"
            style={{
              position: 'absolute',
              ...positions.details
            }}
          >
            <div className="detail-row">
              <span className="detail-label">Class:</span> 
              <span className="detail-value">{this.formatClassSection(student.class, student.section)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Parent's Name:</span> 
              <span className="detail-value">{student.parentName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Contact:</span> 
              <span className="detail-value">{student.parentPhoneNumber}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Address:</span> 
              <span className="detail-value">{student.address}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default IDCardRenderer; 