import Compressor from 'compressorjs';
import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Select from 'react-select';
import IDCardTemplateModal from './IDCard/IDCardTemplateModal';
import './IDCardGenerator.css';
import studentsData from './students.json';

// Image Cropper Component as class component
class ImageCropper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      crop: {
        unit: '%',
        width: 80,
        height: 80 * (4/3), // Passport aspect ratio (3/4)
        x: 10,
        y: 10,
        aspect: 3/4 // Passport photo aspect ratio
      },
      completedCrop: null,
      imgWidth: 0,
      imgHeight: 0
    };
    
    this.imgRef = React.createRef();
  }
  
  onImageLoad = (img) => {
    this.imgRef.current = img;
    this.setState({
      imgWidth: img.width,
      imgHeight: img.height
    });
    return false; // Return false to prevent setting an aspect on the crop
  };

  setCrop = (crop) => {
    // Ensure crop stays within image bounds
    const { imgWidth, imgHeight } = this.state;
    
    // Convert percentage to pixels if using percentage units
    const pixelCrop = crop.unit === '%' 
      ? {
          x: (crop.x * imgWidth) / 100,
          y: (crop.y * imgHeight) / 100,
          width: (crop.width * imgWidth) / 100,
          height: (crop.height * imgHeight) / 100
        }
      : { ...crop };
    
    // Ensure x, y, width, height are within bounds
    if (pixelCrop.x < 0) pixelCrop.x = 0;
    if (pixelCrop.y < 0) pixelCrop.y = 0;
    if (pixelCrop.x + pixelCrop.width > imgWidth) {
      pixelCrop.width = imgWidth - pixelCrop.x;
    }
    if (pixelCrop.y + pixelCrop.height > imgHeight) {
      pixelCrop.height = imgHeight - pixelCrop.y;
    }
    
    // Convert back to percentage if using percentage units
    const boundedCrop = crop.unit === '%' 
      ? {
          ...crop,
          x: (pixelCrop.x * 100) / imgWidth,
          y: (pixelCrop.y * 100) / imgHeight,
          width: (pixelCrop.width * 100) / imgWidth,
          height: (pixelCrop.height * 100) / imgHeight
        }
      : pixelCrop;
    
    this.setState({ crop: boundedCrop });
  };

  setCompletedCrop = (completedCrop) => {
    this.setState({ completedCrop });
  };

  getCroppedImg = async () => {
    const { completedCrop } = this.state;
    if (!completedCrop || !this.imgRef.current) return;

    const image = this.imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Passport size dimensions (35mm x 45mm at 300 DPI)
    const targetWidth = 413;
    const targetHeight = 531;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        
        // Compress the blob
        new Compressor(blob, {
          quality: 0.8,
          success: (compressedBlob) => {
            const reader = new FileReader();
            reader.readAsDataURL(compressedBlob);
            reader.onloadend = () => {
              resolve(reader.result);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
          },
          error: (err) => reject(err)
        });
      }, 'image/jpeg', 0.95);
    });
  };
  
  handleSave = async () => {
    try {
      const croppedImage = await this.getCroppedImg();
      if (croppedImage) {
        this.props.onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error('Error creating crop:', e);
      alert('Failed to crop image. Please try again.');
    }
  };

  render() {
    const { src, onCancel } = this.props;
    const { crop, completedCrop } = this.state;

    return (
      <div className="crop-modal-overlay">
        <div className="crop-modal">
          <div className="crop-modal-header">
            <h2>Crop Image</h2>
            <p>Select and crop the image to fit the passport size properly</p>
          </div>
          
          <div className="crop-container">
            <ReactCrop
              crop={crop}
              onChange={this.setCrop}
              onComplete={this.setCompletedCrop}
              aspect={3/4}
              ruleOfThirds
            >
              <img 
                src={src} 
                onLoad={(e) => this.onImageLoad(e.currentTarget)}
                alt="Crop me"
                className="crop-image"
              />
            </ReactCrop>
          </div>
          
          <div className="crop-modal-footer">
            <button className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className="save-button"
              onClick={this.handleSave}
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// Photo Upload Component as class component
class PhotoUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCropModal: false,
      selectedImageSrc: null
    };
    
    this.fileInputRef = React.createRef();
  }
  
  handleClick = () => {
    this.fileInputRef.current.click();
  };
  
  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select only JPG, JPEG, or PNG images');
      return;
    }
    
    // Read the file
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        selectedImageSrc: reader.result,
        showCropModal: true
      });
    };
    reader.readAsDataURL(file);
  };

  handleCropComplete = (croppedImageUrl) => {
    this.props.onPhotoChange(this.props.studentId, croppedImageUrl);
    this.setState({
      showCropModal: false,
      selectedImageSrc: null
    });
    // Reset file input so the same file can be selected again
    this.fileInputRef.current.value = '';
  };

  handleCropCancel = () => {
    this.setState({
      showCropModal: false,
      selectedImageSrc: null
    });
    // Reset file input so the same file can be selected again
    this.fileInputRef.current.value = '';
  };
  
  render() {
    const { photo } = this.props;
    const { showCropModal, selectedImageSrc } = this.state;
    
    return (
      <>
        <div className="photo-upload" onClick={this.handleClick}>
          {photo ? (
            <img src={photo} alt="Student" className="student-photo" />
          ) : (
            <div className="photo-placeholder">
              <span className="plus-icon">+</span>
            </div>
          )}
          <input
            type="file"
            ref={this.fileInputRef}
            onChange={this.handleFileChange}
            style={{ display: 'none' }}
            accept=".jpg,.jpeg,.png"
          />
        </div>
        
        {showCropModal && selectedImageSrc && (
          <ImageCropper
            src={selectedImageSrc}
            onCropComplete={this.handleCropComplete}
            onCancel={this.handleCropCancel}
          />
        )}
      </>
    );
  }
}

class IDCardGenerator extends Component {
  constructor(props) {
    super(props);
    
    // Generate all grade options with Class prefix
    const gradeOptions = [];
    for (let i = 1; i <= 12; i++) {
      gradeOptions.push({ value: i, label: `Class ${i}` });
    }
    
    const allStudents = studentsData.students;
    
    // Add photo property to each student if it doesn't exist
    const studentsWithPhoto = allStudents.map(student => ({
      ...student,
      photo: student.photo || null
    }));
    
    // Set default selections directly (no localStorage)
    const defaultGrade = { value: 1, label: 'Class 1' };
    const defaultSection = { value: 'A', label: 'A' };
    
    // Check if we should show section or stream dropdowns based on grade
    const showStreamDropdown = defaultGrade.value === 11 || defaultGrade.value === 12;
    const showSectionDropdown = !showStreamDropdown;
    
    // Filter students based on default selections
    const defaultStudents = studentsWithPhoto.filter(student => {
      // Match class
      if (student.class !== defaultGrade.value) return false;
      
      // For classes 1-10, match section
      if (defaultGrade.value <= 10 && defaultSection && student.section !== defaultSection.value) return false;
      
      return true;
    });
    
    this.state = {
      students: studentsWithPhoto,
      filteredStudents: defaultStudents,
      displayedStudents: defaultStudents, 
      selectedGrade: defaultGrade,
      selectedSection: defaultSection,
      selectedStream: null,
      gradeOptions: gradeOptions,
      sectionOptions: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' }
      ],
      streamOptions: [
        { value: 'Commerce', label: 'Commerce' },
        { value: 'Arts', label: 'Arts' },
        { value: 'Science', label: 'Science' }
      ],
      showSectionDropdown: showSectionDropdown,
      showStreamDropdown: showStreamDropdown,
      hasSearched: true,
      selectedStudents: {}, // Object to track selected students, key is student ID
      allSelected: false,   // Track if all students are selected
      errorMessage: '',     // For validation messages
      showTemplateModal: false // Control visibility of template modal
    };
  }
  
  // Helper method to toggle a student's selection state
  toggleStudentSelection = (studentId) => {
    this.setState(prevState => {
      const newSelectedStudents = {
        ...prevState.selectedStudents,
        [studentId]: !prevState.selectedStudents[studentId]
      };
      
      // Check if all students are now selected
      const allSelected = this.areAllStudentsSelected(newSelectedStudents);
      
      return {
        selectedStudents: newSelectedStudents,
        allSelected: allSelected,
        errorMessage: '' // Clear error when selection changes
      };
    });
  };
  
  // Helper to check if all displayed students are selected
  areAllStudentsSelected = (selectedStudents = this.state.selectedStudents) => {
    return this.state.displayedStudents.every(student => selectedStudents[student.id]);
  };
  
  // Toggle selection of all displayed students
  toggleSelectAll = () => {
    const { displayedStudents, allSelected } = this.state;
    
    // If all are currently selected, deselect all; otherwise select all
    const newSelectedState = !allSelected;
    
    const newSelectedStudents = { ...this.state.selectedStudents };
    
    // Update selection state for all displayed students
    displayedStudents.forEach(student => {
      newSelectedStudents[student.id] = newSelectedState;
    });
    
    this.setState({
      selectedStudents: newSelectedStudents,
      allSelected: newSelectedState,
      errorMessage: '' // Clear error when selection changes
    });
  };

  handleGradeChange = (selectedOption) => {
    const showStreamDropdown = selectedOption && (selectedOption.value === 11 || selectedOption.value === 12);
    const newSection = showStreamDropdown ? null : { value: 'A', label: 'A' };
    const newStream = showStreamDropdown ? { value: 'Commerce', label: 'Commerce' } : null;
    
    this.setState({
      selectedGrade: selectedOption,
      selectedSection: newSection,
      selectedStream: newStream,
      showSectionDropdown: !showStreamDropdown,
      showStreamDropdown: showStreamDropdown
    });
  };

  handleSectionChange = (selectedOption) => {
    this.setState({
      selectedSection: selectedOption
    });
  };

  handleStreamChange = (selectedOption) => {
    this.setState({
      selectedStream: selectedOption
    });
  };

  handleSearch = () => {
    const { students, selectedGrade, selectedSection, selectedStream } = this.state;
    
    if (!selectedGrade) {
      alert("Please select a class");
      return;
    }
    
    // For classes 11-12, require stream selection
    if ((selectedGrade.value === 11 || selectedGrade.value === 12) && !selectedStream) {
      alert("Please select a stream");
      return;
    }
    
    // For classes 1-10, require section selection
    if (selectedGrade.value <= 10 && !selectedSection) {
      alert("Please select a section");
      return;
    }
    
    let filtered = students.filter(student => student.class === selectedGrade.value);
    
    if (selectedGrade.value <= 10 && selectedSection) {
      filtered = filtered.filter(student => student.section === selectedSection.value);
    }
    
    if ((selectedGrade.value === 11 || selectedGrade.value === 12) && selectedStream) {
      filtered = filtered.filter(student => student.stream === selectedStream.value);
    }
    
    // Reset selected students when search criteria changes
    this.setState({
      filteredStudents: filtered,
      displayedStudents: filtered,
      hasSearched: true,
      selectedStudents: {},
      allSelected: false,
      errorMessage: ''
    });
  };

  handlePhotoChange = (studentId, photoData) => {
    // Update the student's photo in state
    const updatedStudents = this.state.students.map(student => {
      if (student.id === studentId) {
        return { ...student, photo: photoData };
      }
      return student;
    });
    
    // Update filtered students too if needed
    const updatedFiltered = this.state.filteredStudents.map(student => {
      if (student.id === studentId) {
        return { ...student, photo: photoData };
      }
      return student;
    });
    
    // Update displayed students too
    const updatedDisplayed = this.state.displayedStudents.map(student => {
      if (student.id === studentId) {
        return { ...student, photo: photoData };
      }
      return student;
    });
    
    this.setState({
      students: updatedStudents,
      filteredStudents: updatedFiltered,
      displayedStudents: updatedDisplayed,
      errorMessage: '' // Clear error when photo changes
    });
  };
  
  // Validate if selected students have photos
  validateSelectedStudents = () => {
    const { displayedStudents, selectedStudents } = this.state;
    
    // Check if any students are selected
    const selectedStudentIds = Object.keys(selectedStudents).filter(id => selectedStudents[id]);
    const hasSelectedStudents = selectedStudentIds.length > 0;
    
    if (!hasSelectedStudents) {
      this.setState({ errorMessage: "Please select at least one student." });
      return false;
    }
    
    // Check if all selected students have photos
    const selectedStudentsWithoutPhotos = displayedStudents
      .filter(student => selectedStudents[student.id] && !student.photo)
      .length > 0;
    
    if (selectedStudentsWithoutPhotos) {
      this.setState({ errorMessage: "Provide image of the selected students" });
      return false;
    }
    
    this.setState({ errorMessage: '' });
    return true;
  };
  
  // Handler for opening the template modal
  handleChooseTemplate = () => {
    if (this.validateSelectedStudents()) {
      this.setState({ showTemplateModal: true });
    }
  };
  
  // Handler for closing the template modal
  handleCloseTemplateModal = () => {
    this.setState({ showTemplateModal: false });
  };
  
  // Handler for generating ID cards with the selected template
  handleGenerateIDCards = (template, students) => {
    console.log('Generate ID cards with template:', template, 'for students:', students);
    // Close the template modal - it will handle the generation itself
    this.setState({ showTemplateModal: false });
  };

  render() {
    const {
      displayedStudents,
      gradeOptions,
      sectionOptions,
      streamOptions,
      selectedGrade,
      selectedSection,
      selectedStream,
      showSectionDropdown,
      showStreamDropdown,
      hasSearched,
      selectedStudents,
      allSelected,
      errorMessage,
      showTemplateModal
    } = this.state;
    
    // Get the selected students' data
    const selectedStudentsData = displayedStudents.filter(student => selectedStudents[student.id]);

    return (
      <div className="id-card-generator">
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-item">
              <Select
                value={selectedGrade}
                onChange={this.handleGradeChange}
                options={gradeOptions}
                placeholder="Select Class"
                className="select-dropdown"
                classNamePrefix="select"
              />
            </div>
            
            {showSectionDropdown && (
              <div className="filter-item">
                <Select
                  value={selectedSection}
                  onChange={this.handleSectionChange}
                  options={sectionOptions}
                  placeholder="Select Section"
                  className="select-dropdown"
                  classNamePrefix="select"
                  isSearchable={false}
                />
              </div>
            )}
            
            {showStreamDropdown && (
              <div className="filter-item">
                <Select
                  value={selectedStream}
                  onChange={this.handleStreamChange}
                  options={streamOptions}
                  placeholder="Select Stream"
                  className="select-dropdown"
                  classNamePrefix="select"
                  isSearchable={false}
                />
              </div>
            )}
            
            <div className="filter-item search-container">
              <button className="search-button" onClick={this.handleSearch}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {hasSearched && (
          <>
            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>
                      <div 
                        className={`student-checkbox ${allSelected ? 'checked' : ''}`}
                        onClick={this.toggleSelectAll}
                      >
                        <span className="checkbox-icon">
                          {allSelected ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" fill="#6c5ce7" />
                              <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9.5" stroke="#6c5ce7" strokeWidth="1"/>
                            </svg>
                          )}
                        </span>
                        <span className="row-number">Sl No.</span>
                      </div>
                    </th>
                    <th>Photo</th>
                    <th>Full Name</th>
                    <th>Parents Name</th>
                    <th>Parent's Phone No.</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        <div 
                          className={`student-checkbox ${selectedStudents[student.id] ? 'checked' : ''}`}
                          onClick={() => this.toggleStudentSelection(student.id)}
                        >
                          <span className="checkbox-icon">
                            {selectedStudents[student.id] ? (
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#6c5ce7" />
                                <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9.5" stroke="#6c5ce7" strokeWidth="1"/>
                              </svg>
                            )}
                          </span>
                          <span className="row-number">{index + 1}</span>
                        </div>
                      </td>
                      <td>
                        <PhotoUpload 
                          photo={student.photo}
                          studentId={student.id}
                          onPhotoChange={this.handlePhotoChange}
                        />
                      </td>
                      <td>{student.fullName}</td>
                      <td>{student.parentName}</td>
                      <td>{student.parentPhoneNumber}</td>
                      <td>{student.address}</td>
                    </tr>
                  ))}
                  {displayedStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-results">No students found with the selected criteria</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            
              <button 
                className="template-button" 
                onClick={this.handleChooseTemplate}
              >
                Choose ID Card Template
              </button>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
            
          </>
        )}
        
        {/* Template Selection Modal */}
        <IDCardTemplateModal 
          isOpen={showTemplateModal}
          onClose={this.handleCloseTemplateModal}
          onGenerate={this.handleGenerateIDCards}
          selectedStudents={selectedStudentsData}
        />
      </div>
    );
  }
}

export default IDCardGenerator; 