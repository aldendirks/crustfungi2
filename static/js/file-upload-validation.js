// =========================================================
// =================  FILE VALIDATION  ==================
// =========================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_TOTAL_SIZE = 120 * 1024 * 1024; // 120 MB total
const MAX_FILE_SIZE_MB = 10;
const MAX_TOTAL_SIZE_MB = 120;


// Format bytes to human-readable size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


// Validate file on change event
function validateFileInput(input) {
    const errorElement = input.parentElement.querySelector('.file-error');
    
    if (!input.files || input.files.length === 0) {
        if (errorElement) errorElement.remove();
        return true;
    }

    // Check individual file size
    for (let file of input.files) {
        if (file.size > MAX_FILE_SIZE) {
            showFileError(input, `File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum file size is ${MAX_FILE_SIZE_MB} MB.`);
            input.value = ''; // Clear the input
            return false;
        }
    }

    // Clear any previous errors
    if (errorElement) errorElement.remove();
    return true;
}

// Show error message below file input
function showFileError(input, message) {
    let errorElement = input.parentElement.querySelector('.file-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'file-error error-message';
        errorElement.style.color = '#d32f2f';
        errorElement.style.marginTop = '0.5rem';
        errorElement.style.fontSize = '0.875rem';
        input.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
}


// Validate total upload size on form submission
function validateTotalUploadSize(formElement) {
    let totalSize = 0;
    const fileInputs = formElement.querySelectorAll('input[type="file"]');
    
    for (let input of fileInputs) {
        if (input.files) {
            for (let file of input.files) {
                totalSize += file.size;
            }
        }
    }

    if (totalSize > MAX_TOTAL_SIZE) {
        alert(`Total upload size (${formatFileSize(totalSize)}) exceeds the maximum limit of ${MAX_TOTAL_SIZE_MB} MB. Please remove some files and try again.`);
        return false;
    }

    return true;
}

// Initialize validation when DOM is ready
function initializeValidation() {
    console.log('Initializing file upload validation...');
    
    // Use event delegation for file inputs (handles dynamic forms)
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="file"]')) {
            console.log('File input changed:', e.target.name);
            validateFileInput(e.target);
        }
    });

    // Add validation to forms on submit
    const forms = document.querySelectorAll('form[enctype="multipart/form-data"]');
    console.log('Found forms:', forms.length);
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            console.log('Form submitting, validating total size...');
            if (!validateTotalUploadSize(this)) {
                e.preventDefault();
                return false;
            }
        });
    });
    
    console.log('Validation initialization complete');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeValidation);
} else {
    // DOM already loaded
    initializeValidation();
}
