import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { Component, createRef } from 'react';
import './IDCardRenderer.css';

// =============================================================================
// SCHOOL CONFIGURATION - Change these details for your school
// =============================================================================
const SCHOOL_INFO = {
  name: "Bison Higher Secondary School",
  address: "123 Education Street, Knowledge City",
  phone: "+91 98765 43210",
  email: "info@bisonschool.edu",
  website: "www.bisonschool.edu"
};

// =============================================================================
// PDF GENERATION SETTINGS
// =============================================================================
const PDF_CONFIG = {
  sessionId: Date.now().toString(), // Unique session ID
  generationDelay: 500, // Reduced delay for faster processing (ms)
  standardCardSize: {
    vertical: { width: 85, height: 130 }, // mm
    horizontal: { width: 130, height: 85 } // mm
  }
};

// =============================================================================
// TEMPLATE POSITIONS - Where each element appears on different templates
// =============================================================================
const TEMPLATE_POSITIONS = {
  // Template V1 - Red and Orange Vertical (Circular photo)
  'v1': {
    schoolName: { top: "20%", left: "50.3125%", transform: "translateX(-50%)", fontSize: "19px", textAlign: "center" },
    photo: { top: "29.9%", left: "26.1%", width: "166px", height: "166px", borderRadius: "50%" },
    studentName: { top: "64%", left: "50%", transform: "translateX(-50%)", fontSize: "18px", textAlign: "center" },
    classSection: { top: "69%", left: "15%", fontSize: "14px", display: "flex", alignItems: "center" },
    parentName: { top: "73%", left: "15%", fontSize: "14px", display: "flex", alignItems: "center" },
    contact: { top: "77%", left: "15%", fontSize: "14px", display: "flex", alignItems: "center" },
    address: { top: "81%", left: "15%", fontSize: "14px", display: "flex", alignItems: "center" }
  },
  
  // Template V2 - Red Classic (Rounded rectangle photo)
  'v2': {
    schoolName: { top: '7%', left: '60%', transform: 'translateX(-50%)', fontSize: '17px', textAlign: 'center' },
    photo: { top: '18.8%', left: '21.1%',  width: '198px', height: '198px', borderRadius: '50%' },
    studentName: { top: '58%', left: '50%', transform: 'translateX(-50%)', fontSize: '21px', textAlign: 'center' },
    classSection: { top: '66%', left: '15%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    parentName: { top: '71%', left: '15%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    contact: { top: '76%', left: '15%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    address: { top: '81%', left: '15%', fontSize: '15px', display: 'flex', alignItems: 'center' }
  },
  
  // Template V3 - Blue and White Classic
  'v3': {
    schoolName: { top: '14%', left: '50%', transform: 'translateX(-50%)', fontSize: '19px', textAlign: 'center' },
    photo: { top: '23.1%', left: '25.4%', width: '173px', height: '176px', borderRadius: '25px' },
    studentName: { top: '59%', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', textAlign: 'center' },
    classSection: { top: '68%', left: '14%', fontSize: '14px', display: 'flex', alignItems: 'center' },
    parentName: { top: '73%', left: '14%', fontSize: '14px', display: 'flex', alignItems: 'center' },
    contact: { top: '78%', left: '14%', fontSize: '14px', display: 'flex', alignItems: 'center' },
    address: { top: '83%', left: '14%', fontSize: '14px', display: 'flex', alignItems: 'center' }
  },
  
  // Template H1 - Blue and Orange Horizontal (Circular photo)
  'h1': {
    schoolName: { top: '14%', left: '10%', fontSize: '16px', textAlign: 'left' },
    photo: { top: '30%', left: '2.7%', width: '111px', height: '111px', borderRadius: '15px' },
    studentName: { top: '30%', left: '43%', fontSize: '22px', textAlign: 'center' },
    classSection: { top: '43%', left: '30%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    parentName: { top: '51%', left: '30%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    contact: { top: '59%', left: '30%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    address: { top: '67%', left: '30%', fontSize: '15px', display: 'flex', alignItems: 'center' }
  },
  
  // Template H2 - Blue and White Horizontal
  'h2': {
    schoolName: { top: '9%', left: '10%', fontSize: '20px', textAlign: 'left' },
    photo: { top: '32.2%', right: '7.2%', width: '172px', height: '177px', borderRadius: '23px' },
    studentName: { top: '28%', left: '8%', fontSize: '17px', textAlign: 'left' },
    classSection: { top: '42%', left: '8%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    parentName: { top: '50%', left: '8%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    contact: { top: '58%', left: '8%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    address: { top: '66%', left: '8%', fontSize: '15px', display: 'flex', alignItems: 'center' }
  },
  
  // Template H3 - White and Green Horizontal
  'h3': {
    schoolName: { top: '7%', left: '12.5%', fontSize: '14px', textAlign: 'left' },
    photo: { top: '25.5%', left: '8%', width: '137px', height: '183px', borderRadius: '10px' },
    studentName: { top: '28%', left: '38%', fontSize: '21px', textAlign: 'left' },
    classSection: { top: '38%', left: '38%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    parentName: { top: '47%', left: '38%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    contact: { top: '56%', left: '38%', fontSize: '15px', display: 'flex', alignItems: 'center' },
    address: { top: '65%', left: '38%', fontSize: '15px', display: 'flex', alignItems: 'center' }
  }
};

// =============================================================================
// PDF TRACKING UTILITIES - Prevent duplicate PDF generation
// =============================================================================
let lastGenerationTime = 0;
// Track PDF generation requests to prevent duplicates within same render cycle
let pdfGenerationRequests = {};

const trackStudent = {
  // Mark a student as processed
  setProcessed: (studentId) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`idcard_${PDF_CONFIG.sessionId}_${studentId}`, 'true');
      }
    } catch (e) {
      console.error("Failed to track student:", e);
    }
  },

  // Check if student was already processed
  isProcessed: (studentId) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(`idcard_${PDF_CONFIG.sessionId}_${studentId}`) === 'true';
      }
    } catch (e) {
      console.error("Failed to check student status:", e);
    }
    return false;
  },

  // Clear all tracking (for new batch)
  clearAll: () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        Object.keys(window.sessionStorage)
          .filter(key => key.startsWith(`idcard_${PDF_CONFIG.sessionId}`))
          .forEach(key => window.sessionStorage.removeItem(key));
      }
    } catch (e) {
      console.error("Failed to clear tracking:", e);
    }
  }
};

// =============================================================================
// MAIN COMPONENT - ID Card Renderer
// =============================================================================
class IDCardRenderer extends Component {
  constructor(props) {
    super(props);
    this.cardRef = createRef(); // Reference to the ID card element
    this.state = {
      pdfGenerated: false,
      error: null
    };
    // Flag to track if generation has been requested for this instance
    this.generationRequested = false;
  }

  // -------------------------------------------------------------------------
  // COMPONENT LIFECYCLE
  // -------------------------------------------------------------------------
  componentDidMount() {
    // Always generate PDF when component mounts
    this.handlePDFGeneration();
  }

  componentDidUpdate(prevProps) {
    // Only re-generate if student changes AND it's not from the initial mount
    if (prevProps.student?.id !== this.props.student?.id && this.state.pdfGenerated) {
      this.handlePDFGeneration();
    }
  }

  // -------------------------------------------------------------------------
  // PDF GENERATION COORDINATOR
  // -------------------------------------------------------------------------
  handlePDFGeneration = () => {
    const { student, style } = this.props;
    
    // Prevent duplicate generation requests for the same student
    const requestId = `${student.id}-${Date.now()}`;
    if (pdfGenerationRequests[student.id]) {
      console.log(`Skipping duplicate PDF generation for student ${student.id}`);
      return;
    }
    
    // Mark this student as having a pending generation
    pdfGenerationRequests[student.id] = requestId;

    // Always clear all tracking to allow unlimited re-downloads
    if (typeof window !== 'undefined') {
      // Clear any existing session data completely
      try {
        Object.keys(sessionStorage)
          .filter(key => key.includes('current_session_') || key.includes('idcard_'))
          .forEach(key => sessionStorage.removeItem(key));
      } catch (e) {
        console.log('Session storage clear attempted');
      }
      
      if (window.resetIDCardTrackers) {
        console.log('Resetting ID card trackers for new batch');
        trackStudent.clearAll();
        lastGenerationTime = 0;
        window.resetIDCardTrackers = false;
      }
    }
    
    // NO TRACKING - Allow unlimited downloads
    console.log(`Generating PDF for student ${student.id} - no restrictions`);
    
    // Calculate delay for staggered generation
    const animDelay = style?.animationDelay ? parseInt(style.animationDelay.replace('ms', '')) : 0;
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    const neededDelay = Math.max(PDF_CONFIG.generationDelay - timeSinceLastGeneration, 0) + animDelay;
    
    console.log(`Scheduling PDF generation for student ${student.id} with delay: ${neededDelay + 300}ms`);
    
    // Schedule PDF generation
    setTimeout(() => {
      lastGenerationTime = Date.now();
      this.generatePDF();
      // Clear the request tracking after generation starts
      delete pdfGenerationRequests[student.id];
    }, neededDelay + 300);
  };

  // -------------------------------------------------------------------------
  // STYLING UTILITIES - Simple basic styles only
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // CLASS FORMATTING UTILITY
  // -------------------------------------------------------------------------
  formatClassSection = (classNum, section) => {
    if (!classNum) return '';
    
    const classNumber = parseInt(classNum, 10);
    
    if (classNumber <= 10) {
      // Classes 1-10: "1 A"
      return `${classNumber}${section ? ` ${section}` : ''}`;
    } else if (classNumber <= 12) {
      // Classes 11-12: "XI Science"
      const romanNumeral = classNumber === 11 ? 'XI' : 'XII';
      const stream = this.props.student.stream ? ` ${this.props.student.stream}` : '';
      return `${romanNumeral}${stream}`;
    } else {
      // Other classes: default format
      return `${classNumber}${section ? ` ${section}` : ''}`;
    }
  };

  // -------------------------------------------------------------------------
  // PDF GENERATION - Main function
  // -------------------------------------------------------------------------
  generatePDF = async () => {
    const { student, template } = this.props;
    
    if (!this.cardRef.current) return;
    
    try {
      // Set state to track that generation has started
      this.setState({ pdfGenerated: true, error: null });
      
      console.log(`Starting PDF generation for student ${student.id}`);
      
      // Step 1: Wait for all images to load
      await this.waitForImages(student, template);
      
      // Step 2: Prepare card for capture
      const { cardElement, originalStyles } = this.prepareCardForCapture();
      
      // Step 3: Capture card as canvas
      const canvas = await this.captureCardAsCanvas(cardElement);
      
      // Step 4: Restore original styles
      this.restoreCardStyles(cardElement, originalStyles);
      
      // Step 5: Generate and download PDF
      await this.createAndDownloadPDF(canvas, template, student);
      
      // Step 6: Notify completion
      this.notifyParent();
      
      console.log(`PDF generation completed for student ${student.id}`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      this.setState({ error: 'Failed to generate PDF', pdfGenerated: false });
    }
  };

  // -------------------------------------------------------------------------
  // PDF GENERATION HELPERS
  // -------------------------------------------------------------------------
  
  // Wait for all images to load
  waitForImages = async (student, template) => {
    const imagePromises = [];
    
    // Wait for student photo
    if (student.photo) {
      imagePromises.push(this.loadImage(student.photo));
    }
    
    // Wait for template background
    imagePromises.push(this.loadImage(template.image));
    
    await Promise.all(imagePromises);
    await new Promise(resolve => setTimeout(resolve, 800)); // Extra wait for rendering
  };

  // Load a single image
  loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Continue even if error
      img.src = src;
    });
  };

  // Prepare card element for capturing
  prepareCardForCapture = () => {
    const cardElement = this.cardRef.current;
    
    // Store original styles
    const originalStyles = {
      display: cardElement.style.display,
      position: cardElement.style.position,
      left: cardElement.style.left,
      visibility: cardElement.style.visibility,
      transform: cardElement.style.transform,
      top: cardElement.style.top
    };
    
    // Set temporary styles for capture
    cardElement.style.display = 'block';
    cardElement.style.position = 'relative';
    cardElement.style.left = '0';
    cardElement.style.top = '0';
    cardElement.style.transform = 'none';
    cardElement.style.visibility = 'visible';
    
    // Set CORS for images
    const images = cardElement.querySelectorAll('img');
    images.forEach(img => img.setAttribute('crossorigin', 'anonymous'));
    
    return { cardElement, originalStyles };
  };

  // Capture card as high-quality canvas
  captureCardAsCanvas = async (cardElement) => {
    const cardWidth = cardElement.offsetWidth;
    const cardHeight = cardElement.offsetHeight;
    
    return await html2canvas(cardElement, {
      scale: 2, // Good balance of quality and performance
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      imageTimeout: 8000,
      width: cardWidth,
      height: cardHeight,
      onclone: (clonedDoc) => this.optimizeClonedCard(clonedDoc, cardElement, cardWidth, cardHeight)
    });
  };

  // Optimize the cloned card for PDF generation
  optimizeClonedCard = (clonedDoc, originalCard, cardWidth, cardHeight) => {
    const clonedCard = clonedDoc.querySelector('.id-card');
    if (!clonedCard) return;
    
    // Set exact dimensions
    clonedCard.style.width = `${cardWidth}px`;
    clonedCard.style.height = `${cardHeight}px`;
    clonedCard.style.position = 'relative';
    clonedCard.style.display = 'block';
    clonedCard.style.backgroundImage = originalCard.style.backgroundImage;
    clonedCard.style.backgroundSize = 'cover';
    clonedCard.style.backgroundPosition = 'center';
    clonedCard.style.backgroundRepeat = 'no-repeat';
    
    // Fix photo container
    this.fixPhotoContainer(clonedCard, originalCard);
    
    // Fix all images
    this.fixImages(clonedCard);
    
    // Fix text elements
    this.fixTextElements(clonedCard);
  };

  // Fix photo container in cloned card
  fixPhotoContainer = (clonedCard, originalCard) => {
    const photoContainer = clonedCard.querySelector('.student-photo-container');
    const originalContainer = originalCard.querySelector('.student-photo-container');
    
    if (photoContainer && originalContainer) {
      // Copy all styles from original container
      const originalStyles = window.getComputedStyle(originalContainer);
      
      // Ensure positioning is preserved
      photoContainer.style.position = 'absolute';
      photoContainer.style.top = originalContainer.style.top;
      photoContainer.style.left = originalContainer.style.left;
      photoContainer.style.right = originalContainer.style.right;
      photoContainer.style.width = originalContainer.style.width;
      photoContainer.style.height = originalContainer.style.height;
      photoContainer.style.transform = originalContainer.style.transform;
      
      // Visual styling
      photoContainer.style.overflow = 'hidden';
      photoContainer.style.border = '2px solid #fff';
      photoContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
      photoContainer.style.backgroundColor = '#f0f0f0';
      photoContainer.style.borderRadius = originalContainer.style.borderRadius || '0';
      
      // Force square aspect ratio for circular photos
      if (originalContainer.style.borderRadius === '50%') {
        photoContainer.style.aspectRatio = '1/1';
      }
      
      console.log('Fixed photo container for PDF:', {
        borderRadius: photoContainer.style.borderRadius,
        width: photoContainer.style.width,
        height: photoContainer.style.height,
        position: photoContainer.style.position
      });
    }
  };

  // Fix images in cloned card
  fixImages = (clonedCard) => {
    const images = clonedCard.querySelectorAll('img');
    images.forEach(img => {
      // Ensure image fills container perfectly
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      img.style.display = 'block';
      
      // Remove any border radius from image (container handles it)
      img.style.borderRadius = '0';
      
      // Remove any spacing
      img.style.margin = '0';
      img.style.padding = '0';
      img.style.border = 'none';
      
      // Ensure proper rendering
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.minWidth = '100%';
      img.style.minHeight = '100%';
      
      // Force reload to ensure proper rendering
      if (img.src) {
        const originalSrc = img.src;
        img.src = '';
        img.src = originalSrc;
      }
      
      console.log('Fixed image for PDF:', {
        width: img.style.width,
        height: img.style.height,
        objectFit: img.style.objectFit,
        borderRadius: img.style.borderRadius
      });
    });
  };

  // Fix text elements in cloned card
  fixTextElements = (clonedCard) => {
    const textElements = clonedCard.querySelectorAll('.school-name, .student-name, .detail-row');
    textElements.forEach(elem => {
      if (elem.style.position === 'absolute') {
        elem.style.position = 'absolute';
        elem.style.whiteSpace = elem.classList.contains('address-row') ? 'normal' : 'nowrap';
      }
    });
    
    // Special handling for address
    const addressElements = clonedCard.querySelectorAll('.address-row');
    addressElements.forEach(elem => {
      elem.style.whiteSpace = 'normal';
      elem.style.overflow = 'visible';
      elem.style.wordWrap = 'break-word';
    });
  };

  // Restore original card styles
  restoreCardStyles = (cardElement, originalStyles) => {
    Object.keys(originalStyles).forEach(key => {
      cardElement.style[key] = originalStyles[key];
    });
  };

  // Create and download PDF
  createAndDownloadPDF = async (canvas, template, student) => {
    const isVertical = template.orientation === 'vertical';
    
    // Get standard card dimensions
    const cardSize = isVertical ? 
      PDF_CONFIG.standardCardSize.vertical : 
      PDF_CONFIG.standardCardSize.horizontal;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: isVertical ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate centering on A4
    const a4Width = isVertical ? 210 : 297;
    const a4Height = isVertical ? 297 : 210;
    const x = (a4Width - cardSize.width) / 2;
    const y = (a4Height - cardSize.height) / 2;
    
    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      x, y,
      cardSize.width, cardSize.height,
      undefined,
      'FAST'
    );
    
    // Generate filename: StudentName-Class-Section.pdf
    const className = student.class.toString();
    const section = student.section || '';
    const fileName = `${student.fullName.replace(/\s+/g, '')}-${className}-${section}.pdf`;
    
    // Download PDF
    pdf.save(fileName);
  };

  // Notify parent component
  notifyParent = () => {
    if (this.props.onGenerate) {
      setTimeout(() => {
        this.props.onGenerate(this.props.student.id);
      }, 200);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER METHOD - Creates the visual ID card
  // -------------------------------------------------------------------------
  render() {
    const { student, template } = this.props;
    
    // Get positioning for current template
    const positions = TEMPLATE_POSITIONS[template.id] || TEMPLATE_POSITIONS.v1;

    return (
      <div className="id-card-wrapper">
        {/* Main ID Card Container */}
        <div 
          className={`id-card ${template.orientation}`} 
          ref={this.cardRef}
          style={{ backgroundImage: `url(${template.image})` }}
        >
          
          {/* School Name */}
          <div 
            className="school-name"
            style={{ position: 'absolute', ...positions.schoolName }}
          >
            {SCHOOL_INFO.name}
          </div>
          
          {/* Student Photo */}
          <div className="student-photo-container" style={{...positions.photo}}>
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
          {this.renderStudentDetails(student, positions)}
          
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER STUDENT DETAILS - Class, Parent, Contact, Address
  // -------------------------------------------------------------------------
  renderStudentDetails = (student, positions) => {
    return (
      <>
        {/* Class & Section */}
        {positions.classSection && (
          <div className="detail-row" style={{ position: 'absolute', ...positions.classSection }}>
            <span className="detail-label">Class:&nbsp;</span>
            <span className="detail-value">{this.formatClassSection(student.class, student.section)}</span>
          </div>
        )}
        
        {/* Parent Name */}
        {positions.parentName && (
          <div className="detail-row" style={{ position: 'absolute', ...positions.parentName }}>
            <span className="detail-label">Parent:&nbsp;</span>
            <span className="detail-value">{student.parentName || 'N/A'}</span>
          </div>
        )}
        
        {/* Contact Number */}
        {positions.contact && (
          <div className="detail-row" style={{ position: 'absolute', ...positions.contact }}>
            <span className="detail-label">Contact:&nbsp;</span>
            <span className="detail-value">{student.parentPhoneNumber || 'N/A'}</span>
          </div>
        )}
        
                 {/* Address */}
         {student.address && positions.address && (
           <div 
             className="detail-row address-row" 
             style={{
               position: 'absolute',
               ...positions.address,
               whiteSpace: 'normal',
               width: '90%',
               maxWidth: '95%',
               overflow: 'visible',
               wordWrap: 'break-word',
               overflowWrap: 'break-word',
               lineHeight: '1.2'
             }}
           >
             <span className="detail-label" style={{ flexShrink: 0 }}>Address:&nbsp;</span>
             <span className="detail-value" style={{ 
               whiteSpace: 'normal',
               wordBreak: 'break-word',
               overflowWrap: 'break-word'
             }}>
               {student.address}
             </span>
           </div>
         )}
        
        {/* Optional Admission Number */}
        {student.admissionNumber && positions.admissionNumber && (
          <div className="detail-row" style={{ position: 'absolute', ...positions.admissionNumber }}>
            <span className="detail-label">Adm No:&nbsp;</span>
            <span className="detail-value">{student.admissionNumber}</span>
          </div>
        )}
      </>
    );
  };
}

export default IDCardRenderer; 