
let photoSession = {
    isActive: false,
    photoCount: 0,
    photoData: [],
    stream: null,
    isCompleted: false
};
document.getElementById('container3').style.display = 'none';
document.getElementById('container2').style.display = 'none';
document.getElementById('custom').style.display = 'none';  
document.getElementById('container').style.display = 'flex';  


function enterStudio() {
    document.getElementById('container1').style.display = 'none';
    document.getElementById('container2').style.display = 'flex';
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('camera');
        video.srcObject = stream;
        photoSession.stream = stream;
        setupDragAndDrop();
    })
    .catch(err => {
        alert("Error accessing camera: " + err.message);
    });
}

function setupDragAndDrop() {
    setTimeout(() => {
        const coinInContainer = document.querySelector('.coincontainer .coinimg');
        const slot = document.querySelector('.slot');
        
        if (!coinInContainer || !slot) {
            console.error('Could not find coin or slot elements');
            return;
        }
        
        console.log('Setting up drag and drop for:', coinInContainer, slot);
        
        coinInContainer.draggable = true;
        coinInContainer.style.cursor = 'grab';
        
        coinInContainer.addEventListener('dragstart', (e) => {
            console.log('Drag started');
            e.dataTransfer.setData('text/plain', 'coin');
            e.dataTransfer.effectAllowed = 'move';
            coinInContainer.style.cursor = 'grabbing';
            coinInContainer.style.opacity = '0.5';
        });
        
        coinInContainer.addEventListener('dragend', (e) => {
            console.log('Drag ended');
            coinInContainer.style.cursor = 'grab';
            coinInContainer.style.opacity = '1';
        });
        
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            slot.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
            slot.style.border = '2px dashed #FFD700';
        });
        
        slot.addEventListener('dragenter', (e) => {
            e.preventDefault();
        });
        
        slot.addEventListener('dragleave', (e) => {
            if (!slot.contains(e.relatedTarget)) {
                slot.style.backgroundColor = '';
                slot.style.border = '';
            }
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('Dropped on slot');
            slot.style.backgroundColor = '';
            slot.style.border = '';
            
            if (e.dataTransfer.getData('text/plain') === 'coin' && !photoSession.isActive && !photoSession.isCompleted) {
                startPhotoSession();
            }
        });
        
        let isDragging = false;
        
        coinInContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            coinInContainer.style.cursor = 'grabbing';
            coinInContainer.style.opacity = '0.5';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = slot.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right && 
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    slot.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                    slot.style.border = '2px dashed #FFD700';
                } else {
                    slot.style.backgroundColor = '';
                    slot.style.border = '';
                }
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                coinInContainer.style.cursor = 'grab';
                coinInContainer.style.opacity = '1';
                
                const rect = slot.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right && 
                    e.clientY >= rect.top && e.clientY <= rect.bottom && !photoSession.isActive && !photoSession.isCompleted) {
                    console.log('Mouse drop on slot detected');
                    startPhotoSession();
                }
                
                slot.style.backgroundColor = '';
                slot.style.border = '';
            }
        });
        
        let isTouchDragging = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let coinStartX = 0;
        let coinStartY = 0;
        
        coinInContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouchDragging = true;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            
            const coinRect = coinInContainer.getBoundingClientRect();
            coinStartX = coinRect.left;
            coinStartY = coinRect.top;
            
            coinInContainer.style.cursor = 'grabbing';
            coinInContainer.style.opacity = '0.5';
            coinInContainer.style.zIndex = '1000';
            coinInContainer.style.position = 'fixed';
            coinInContainer.style.pointerEvents = 'none';
            
            console.log('Touch drag started');
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isTouchDragging) {
                e.preventDefault();
                
                const touch = e.touches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                
                coinInContainer.style.left = (coinStartX + deltaX) + 'px';
                coinInContainer.style.top = (coinStartY + deltaY) + 'px';
                
                const rect = slot.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right && 
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    slot.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                    slot.style.border = '2px dashed #FFD700';
                } else {
                    slot.style.backgroundColor = '';
                    slot.style.border = '';
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (isTouchDragging) {
                e.preventDefault();
                isTouchDragging = false;
                
                coinInContainer.style.cursor = 'grab';
                coinInContainer.style.opacity = '1';
                coinInContainer.style.zIndex = '';
                coinInContainer.style.position = '';
                coinInContainer.style.pointerEvents = '';
                coinInContainer.style.left = '';
                coinInContainer.style.top = '';
                
                const touch = e.changedTouches[0];
                const rect = slot.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right && 
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom && !photoSession.isActive && !photoSession.isCompleted) {
                    console.log('Touch drop on slot detected');
                    startPhotoSession();
                }
                
                slot.style.backgroundColor = '';
                slot.style.border = '';
            }
        });
        
    }, 100);
}

function startPhotoSession() {
    if (photoSession.isActive) return;
    
    photoSession.isActive = true;
    photoSession.photoCount = 0;
    photoSession.photoData = [];

    const coinInContainer = document.querySelector('.coincontainer .coinimg');
    coinInContainer.style.display = 'none';
    
    takePhotoWithCountdown();
}

function takePhotoWithCountdown() {
    startCountdown(() => {
        takePhoto();
        if (photoSession.photoCount < 4) {
            setTimeout(() => {
                takePhotoWithCountdown();
            }, 2000);
        } else {
            completePhotoSession();
        }
    });
}

function startCountdown(callback) {
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    
    let count = 4;
    countdownOverlay.style.display = 'flex';
    countdownNumber.textContent = count;
    
    const photoNum = photoSession.photoCount + 1;
    countdownNumber.textContent = `Photo ${photoNum}`;
    
    const countdownInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownNumber.textContent = `${count}`;
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
            }, 10);
        } else {
            countdownNumber.textContent = '📸';
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
            }, 10);
            
            clearInterval(countdownInterval);
            
            setTimeout(() => {
                countdownOverlay.style.display = 'none';
                callback();
            }, 1000);
        }
    }, 1000);
}

function takePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    const photoDataURL = canvas.toDataURL('image/jpeg');
    photoSession.photoData.push(photoDataURL);
    photoSession.photoCount++;
    
    const photoElement = document.getElementById(`photo${photoSession.photoCount}`);
    if (photoElement) {
        photoElement.src = photoDataURL;
        photoElement.alt = `photo${photoSession.photoCount}`;
    }
    
    console.log(`Photo ${photoSession.photoCount} taken`);
    
    flashEffect();
}

function flashEffect() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0.8';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        document.body.removeChild(flash);
    }, 150);
}

function completePhotoSession() {
    if (photoSession.stream) {
        const tracks = photoSession.stream.getTracks();
        tracks.forEach(track => track.stop());
    }

    const video = document.getElementById('camera');
    video.style.display = 'none';
    const photoDataURL = photoSession.photoData[photoSession.photoCount - 1];
    video.src = photoDataURL;

    const customButton = document.getElementById('custom');
    customButton.style.display = 'block';
    
    photoSession.isActive = false;
    photoSession.isCompleted = true;
}

function customisePhotostrip() {
    document.getElementById('container1').style.display = 'none';
    document.getElementById('container2').style.display = 'none';
    document.getElementById('container3').style.display = 'flex';
    
    generatePhotostrip();
}

function generatePhotostrip() {
    const photostripDiv = document.querySelector('.photostrip');
    
    photostripDiv.innerHTML = '';
    
    const stripContainer = document.createElement('div');
    stripContainer.className = 'strip-container';
    stripContainer.style.cssText = `
        width: 100%;
        height: 100%;
        background: white;
        border: 3px solid #000;
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        box-sizing: border-box;
    `;
    
    const photosContainer = document.createElement('div');
    photosContainer.className = 'strip-photos';
    photosContainer.style.cssText = `
        flex: 0.7;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        justify-content: space-between;
    `;
    
    for (let i = 1; i <= 4; i++) {
        const photoDiv = document.createElement('div');
        photoDiv.style.cssText = `
            flex: 1;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0.1rem;
        `;
        
        const img = document.createElement('img');
        img.id = `strip-photo${i}`;
        img.className = 'strip-photo';
        img.style.cssText = `
            width: 85%;
            height: auto;
            object-fit: cover;
            object-position: center;
            aspect-ratio: 4/3;
        `;
        
        if (photoSession.photoData[i - 1]) {
            img.src = photoSession.photoData[i - 1];
        } else {
            img.src = 'pics.png';
        }
        
        photoDiv.appendChild(img);
        photosContainer.appendChild(photoDiv);
    }
    
    const frameArea = document.createElement('div');
    frameArea.className = 'strip-frame-area';
    frameArea.style.cssText = `
        flex: 0.25;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        position: relative;
        margin: 0.2rem 0;
    `;
    
    const footer = document.createElement('div');
    footer.className = 'strip-footer';
    footer.style.cssText = `
        flex: 0.05;
        text-align: center;
        border-top: 1px solid #000;
        padding-top: 0.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 20;
        background: transparent;
    `;
    
    const message = document.createElement('p');
    message.id = 'strip-message';
    message.textContent = 'Powered by PhotoBlooth :D';
    message.style.cssText = `
        font-family: roboto;
        font-size: 0.7rem;
        color: #000;
        margin: 0;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.9), -1px -1px 2px rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.8);
        padding: 2px 4px;
        border-radius: 2px;
    `;
    
    footer.appendChild(message);
    
    stripContainer.appendChild(photosContainer);
    stripContainer.appendChild(frameArea);
    stripContainer.appendChild(footer);
    photostripDiv.appendChild(stripContainer);
}

function applyFilter(filterType) {
    const photos = document.querySelectorAll('.strip-photo');
    photos.forEach(photo => {
        if (filterType === 'none') {
            photo.style.filter = '';
        } else {
            photo.style.filter = filterType;
        }
    });
}

function applyFrame(frameType) {
    const stripContainer = document.querySelector('.strip-container');
    const existingFrame = stripContainer.querySelector('.frame-overlay');
    
    if (existingFrame) {
        existingFrame.remove();
    }
    
    if (frameType !== 'none') {
        const frameImg = document.createElement('img');
        frameImg.className = 'frame-overlay';
        frameImg.src = `${frameType}`;
        console.log('Applying frame:', frameImg.src);
        frameImg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
            z-index: 10;
        `;
        
        stripContainer.style.position = 'relative';
        stripContainer.appendChild(frameImg);
    }
}

function addText() {
    const text = prompt('Enter text to add to your photostrip:');
    if (text) {
        const message = document.getElementById('strip-message');
        if (message) {
            message.textContent = text;
        }
    }
}

function addDateTime() {
    const message = document.getElementById('strip-message');
    if (message) {
        const dashIndex = message.textContent.indexOf(' - ');
        
        if (dashIndex !== -1) {
            message.textContent = message.textContent.substring(0, dashIndex);
        } else {
            const now = new Date();
            const dateTimeString = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            message.textContent = `${message.textContent} - ${dateTimeString}`;
        }
    }
}

function download() {
    const stripContainer = document.querySelector('.strip-container');
    if (!stripContainer) {
        alert('Please wait for the photostrip to load!');
        return;
    }
    
    if (typeof html2canvas !== 'undefined') {
        html2canvas(stripContainer, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: stripContainer.offsetWidth,
            height: stripContainer.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            imageTimeout: 15000,
            removeContainer: false
        }).then(canvas => { 
            const link = document.createElement('a');
            link.download = `photostrip-${new Date().toISOString().slice(0, 10)}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }).catch(error => {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        });
    } else {
        alert('High quality download requires html2canvas library. Please check your internet connection.');
    }
}
    
function share() {
    if (navigator.share) {
        navigator.share({
            title: 'My PhotoBlooth Strip',
            text: 'Check out my awesome photostrip from PhotoBlooth!',
            url: window.location.href
        });
    } else {
        const text = 'Check out my awesome photostrip from PhotoBlooth!';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text + ' ' + window.location.href);
            alert('Share text copied to clipboard!');
        } else {
            alert('Sharing not supported on this browser. Take a screenshot to share!');
        }
    }
}

function restart() {
    photoSession = {
        isActive: false,
        photoCount: 0,
        photoData: [],
        stream: null,
        isCompleted: false
    };
    
    document.getElementById('container1').style.display = 'flex';
    document.getElementById('container2').style.display = 'none';
    document.getElementById('container3').style.display = 'none';
    
    for (let i = 1; i <= 4; i++) {
        const photo = document.getElementById(`photo${i}`);
        if (photo) {
            photo.src = 'pics.png';
        }
    }
    
    const coin = document.querySelector('.coincontainer .coinimg');
    if (coin) {
        coin.style.display = 'block';
    }
    
    const customButton = document.getElementById('custom');
    if (customButton) {
        customButton.style.display = 'none';
    }
}
  
