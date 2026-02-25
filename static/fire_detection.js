// ============================================
// STATE MANAGEMENT
// ============================================

let currentFile = null;
let selectedModel = 'model1';

// ============================================
// DOM ELEMENTS
// ============================================

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadContent = document.getElementById('uploadContent');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const scannerOverlay = document.getElementById('scannerOverlay');
const processingOverlay = document.getElementById('processingOverlay');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultDisplay = document.getElementById('resultDisplay');
const fireDetected = document.getElementById('fireDetected');
const noFire = document.getElementById('noFire');
const modelCards = document.querySelectorAll('.model-card');

// ============================================
// ANIMATED PARTICLES BACKGROUND
// ============================================

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 3 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(0, 212, 255, ${Math.random() * 0.5 + 0.2})`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.animationDelay = `${Math.random() * 5}s`;

        particlesContainer.appendChild(particle);
    }
}

// Create keyframe animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: translate(0, 0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, -100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// FILE UPLOAD HANDLERS
// ============================================

// Click to upload
uploadZone.addEventListener('click', () => {
    if (!currentFile) {
        fileInput.click();
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileUpload(file);
    } else {
        alert('Please upload a valid image file (JPG, PNG, JPEG)');
    }
});

// Drag and drop handlers
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileUpload(file);
    } else {
        alert('Please upload a valid image file (JPG, PNG, JPEG)');
    }
});

// ============================================
// FILE UPLOAD PROCESSING
// ============================================

function handleFileUpload(file) {
    currentFile = file;

    // Hide upload content, show preview
    uploadContent.classList.add('hidden');
    imagePreview.classList.remove('hidden');

    // Load image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Enable analyze button
    analyzeBtn.disabled = false;

    // Reset results
    hideAllResults();

    // Play scanner animation briefly
    setTimeout(() => {
        // Scanner continues until analysis
    }, 2000);
}

// ============================================
// MODEL SELECTION
// ============================================

modelCards.forEach(card => {
    card.addEventListener('click',  () => {
        modelCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        selectedModel = card.dataset.model;

        showModelSwitchPopup(selectedModel); // ✅ POP-UP ADDED

        console.log(`Model switched to: ${selectedModel}`);
    });
});


// ============================================
// ANALYZE IMAGE (FLASK API CALL)
// ============================================

analyzeBtn.addEventListener('click', async () => {
    if (!currentFile) {
        alert('Please upload an image first');
        return;
    }

    // Show processing overlay
    processingOverlay.classList.remove('hidden');

    // Hide previous results
    hideAllResults();

    // Disable button during processing
    analyzeBtn.disabled = true;
    analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';

    // Prepare form data
    const formData = new FormData();
    formData.append('image', currentFile);
    formData.append('model', selectedModel);

    try {
        // Send to Flask backend
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        // Simulate processing time for smooth UX
        setTimeout(() => {
            displayResult(result);
        }, 1500);

    } catch (error) {
        console.error('Error during analysis:', error);

        // Hide processing overlay
        processingOverlay.classList.add('hidden');

        // Show error message
        alert(`Analysis failed: ${error.message}\n\nMake sure Flask backend is running on /predict endpoint.`);

        // For demo purposes, show sample result if backend not available
        console.warn('Backend not available. Showing demo result...');
        
    } finally {
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.querySelector('.btn-text').textContent = 'Analyze Image';
    }
});

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResult(result) {
    // Hide processing overlay
    processingOverlay.classList.add('hidden');

    // Hide placeholder
    document.querySelector('.result-placeholder')?.classList.add('hidden');

    // Show appropriate result based on prediction
    // Expected result format: { prediction: "fire" or "no_fire", confidence: 0.95 }

    if (result.prediction === 'fire' || result.prediction === 'FOREST FIRE DETECTED') {
        fireDetected.classList.remove('hidden');
        createFireParticles();
    } else {
        noFire.classList.remove('hidden');
    }

    // Scroll to result
    document.getElementById('resultPanel').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Demo result for testing without backend
function displayDemoResult() {
    processingOverlay.classList.add('hidden');
    document.querySelector('.result-placeholder')?.classList.add('hidden');

    // Randomly show fire or no fire for demo
    const isFireDetected = Math.random() > 0.5;

    if (isFireDetected) {
        fireDetected.classList.remove('hidden');
        createFireParticles();
    } else {
        noFire.classList.remove('hidden');
    }

    document.getElementById('resultPanel').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function hideAllResults() {
    fireDetected.classList.add('hidden');
    noFire.classList.add('hidden');
    document.querySelector('.result-placeholder')?.classList.remove('hidden');
}

// ============================================
// FIRE PARTICLES EFFECT
// ============================================

function createFireParticles() {
    const fireIcon = document.querySelector('.fire-icon');
    if (!fireIcon) return;

    // Create particle container if doesn't exist
    let particlesDiv = fireIcon.querySelector('.fire-particles');
    if (!particlesDiv) {
        particlesDiv = document.createElement('div');
        particlesDiv.className = 'fire-particles';
        particlesDiv.style.position = 'absolute';
        particlesDiv.style.width = '100%';
        particlesDiv.style.height = '100%';
        particlesDiv.style.top = '0';
        particlesDiv.style.left = '0';
        particlesDiv.style.pointerEvents = 'none';
        fireIcon.appendChild(particlesDiv);
    }

    // Clear existing particles
    particlesDiv.innerHTML = '';

    // Create fire particles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = `${Math.random() * 6 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.background = i % 2 === 0 ? '#ff4444' : '#ffa500';
            particle.style.borderRadius = '50%';
            particle.style.bottom = '50%';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animation = `riseUp ${Math.random() * 2 + 1}s ease-out`;
            particle.style.opacity = '0';

            particlesDiv.appendChild(particle);

            // Remove after animation
            setTimeout(() => particle.remove(), 3000);
        }, i * 100);
    }

    // Add rise animation
    if (!document.getElementById('riseUpAnimation')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'riseUpAnimation';
        animStyle.textContent = `
            @keyframes riseUp {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(animStyle);
    }
}

// ============================================
// RESET FUNCTIONALITY
// ============================================

function resetUpload() {
    currentFile = null;
    uploadContent.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    previewImage.src = '';
    analyzeBtn.disabled = true;
    processingOverlay.classList.add('hidden');
    hideAllResults();
    fileInput.value = '';
}

// Add reset button functionality (double-click on preview to reset)
imagePreview.addEventListener('dblclick', () => {
    if (confirm('Reset and upload new image?')) {
        resetUpload();
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Forest Fire Detection System Initialized');
    console.log('💻 Waiting for Flask backend at /predict endpoint...');

    // Create animated particles
    createParticles();

    // Log selected model
    console.log(`📊 Default Model: ${selectedModel}`);

    // Add keyboard shortcut (Escape to reset)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentFile) {
            resetUpload();
        }
    });
});

function showModelSwitchPopup(modelName) {
    const popup = document.createElement('div');
    popup.textContent = `Model Switched Successfully`;

    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.padding = '14px 22px';
    popup.style.background = 'linear-gradient(135deg, #00d4ff, #a855f7)';
    popup.style.color = '#ffffff';
    popup.style.fontSize = '1rem';
    popup.style.fontWeight = '600';
    popup.style.borderRadius = '14px';
    popup.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.6)';
    popup.style.zIndex = '9999';
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(-10px)';
    popup.style.transition = 'all 0.4s ease';

    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 50);

    // Remove after 2.2 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(-10px)';
        setTimeout(() => popup.remove(), 400);
    }, 2200);
}

// ============================================
// FLASK BACKEND INTEGRATION NOTES
// ============================================

/*
 * EXPECTED FLASK ENDPOINT:
 *
 * @app.route('/predict', methods=['POST'])
 * def predict():
 *     if 'image' not in request.files:
 *         return jsonify({'error': 'No image provided'}), 400
 *
 *     file = request.files['image']
 *     model_name = request.form.get('model', 'model1')
 *
 *     # Process image and make prediction
 *     # ... your model inference code ...
 *
 *     # Return JSON response
 *     return jsonify({
 *         'prediction': 'fire' or 'no_fire',
 *         'confidence': 0.95,
 *         'model': model_name
 *     })
 *
 * RESPONSE FORMAT:
 * {
 *     "prediction": "fire" | "no_fire",
 *     "confidence": 0.0 - 1.0,
 *     "model": "model1" | "model2" | etc.
 * }
 */
