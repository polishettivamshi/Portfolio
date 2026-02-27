$(document).ready(function(){
    
    // Sticky navbar
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }
        
        // Scroll up button
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }
    });
    
    // Scroll to top
    $('.scroll-up-btn').click(function(){
        $('html, body').animate({scrollTop: 0});
    });
    
    // Mobile menu toggle
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });
    
    // Smooth scrolling for menu links
    $('.menu a').click(function(e){
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 70
        }, 300);
        
        // Close mobile menu after click
        $('.navbar .menu').removeClass("active");
        $('.menu-btn i').removeClass("active");
    });
    
    // NEW: Custom Typing Animation (Better performance and smoother)
    function createTypingAnimation(selector, strings, options = {}) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const defaultOptions = {
            typeSpeed: 60,
            deleteSpeed: 40,
            delayBetweenWords: 1500,
            loop: true,
            // cursor: '|',
            // cursorBlinkSpeed: 500
        };
        
        const config = { ...defaultOptions, ...options };
        
        let currentStringIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let isWaiting = false;
        
        function type() {
            const currentString = strings[currentStringIndex];
            
            if (isDeleting) {
                // Deleting text
                element.textContent = currentString.substring(0, currentCharIndex - 1);
                currentCharIndex--;
            } else {
                // Typing text
                element.textContent = currentString.substring(0, currentCharIndex + 1);
                currentCharIndex++;
            }
            
            // Calculate typing speed
            let typeSpeed = config.typeSpeed;
            
            if (isDeleting) {
                typeSpeed = config.deleteSpeed;
            }
            
            // When word is complete
            if (!isDeleting && currentCharIndex === currentString.length) {
                // Wait before deleting
                isWaiting = true;
                setTimeout(() => {
                    isWaiting = false;
                    isDeleting = true;
                    type();
                }, config.delayBetweenWords);
                return;
            }
            
            // When word is deleted
            if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentStringIndex = (currentStringIndex + 1) % strings.length;
            }
            
            if (!isWaiting) {
                setTimeout(type, typeSpeed);
            }
        }
        
        // Add blinking cursor
        function addCursor() {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = config.cursor;
            cursor.style.opacity = '1';
            
            // Insert cursor after the typing element
            element.parentNode.insertBefore(cursor, element.nextSibling);
            
            // Blink cursor
            let cursorVisible = true;
            setInterval(() => {
                cursorVisible = !cursorVisible;
                cursor.style.opacity = cursorVisible ? '1' : '0';
            }, config.cursorBlinkSpeed);
        }
        
        // Start typing
        setTimeout(type, 1000);
        addCursor();
    }
    
    // Initialize typing animations
    const jobTitles = [
        "Python Developer",
        "Python Software Engineer",
        "Backend Developer",
        "Python API Developer",
        "Automation Engineer",
        "Application Developer"
    ];
    
    // Home typing
    createTypingAnimation('.typing', jobTitles, {
        typeSpeed: 70,
        deleteSpeed: 50,
        delayBetweenWords: 1800
    });
    
    // About typing (slightly different rhythm)
    createTypingAnimation('.typing-2', jobTitles, {
        typeSpeed: 65,
        deleteSpeed: 45,
        delayBetweenWords: 2000,
        delayStart: 1500
    });
    
    // Add cursor styles
    const style = document.createElement('style');
    style.textContent = `
        .typing-cursor {
            color: #00D1D1;
            font-weight: normal;
            margin-left: 2px;
            transition: opacity 0.3s ease;
        }
        .typing, .typing-2 {
            display: inline-block;
            min-height: 1.2em; /* Prevent layout shift */
        }
    `;
    document.head.appendChild(style);
    
    
    // Back to top in footer
    $('.back-to-top').click(function(e){
        e.preventDefault();
        $('html, body').animate({scrollTop: 0});
    });
    
    // Close mobile menu when clicking outside
    $(document).click(function(e){
        if(!$(e.target).closest('.navbar').length){
            $('.navbar .menu').removeClass("active");
            $('.menu-btn i').removeClass("active");
        }
    });
    
});


// style.js (Optimized Code)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');

    if (!form) return; 

    // --- NEW: Function to manage the status display ---
    const updateStatus = (message, isSuccess = true) => {
        // 1. CLEAR AND RESET
        clearTimeout(statusDiv.timer); // Clear any pending hide timer
        statusDiv.classList.remove('error'); // Clear previous error state
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = ''; // Explicitly clear content before setting new content

        // 2. SET MESSAGE AND STYLE
        if (isSuccess) {
            statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        } else {
            statusDiv.classList.add('error');
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
        }

        // 3. SET HIDE TIMER
        statusDiv.timer = setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const action = form.getAttribute('action');
        
        // --- START LOADING STATE ---
        statusDiv.style.display = 'block';
        statusDiv.classList.remove('error'); 
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Clear the auto-hide timer while loading
        clearTimeout(statusDiv.timer); 
        // --- END LOADING STATE ---

        try {
            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // SUCCESS: Use the new function
                updateStatus('Message Sent Successfully!', true);
                form.reset(); 
            } else {
                // FAILURE: Use the new function
                updateStatus(result.message || 'Could not send message.', false);
            }
        } catch (error) {
            // NETWORK ERROR: Use the new function
            console.error('Submission Error:', error);
            updateStatus('Network Error. Please try again.', false);
        }
        
        // Note: The hide timer is now managed inside updateStatus
    });
});


/**
 * Stable Visitor Counter for Vamshi's GitHub Portfolio
 */
async function initCounter() {
    const display = document.getElementById('visit-count');
    const namespace = "vamshi-polishetti-portfolio-2026"; // Unique name
    const key = "main-page";

    try {
        // 1. Check if user already visited in this session
        let url = `https://api.counterapi.dev/v1/${namespace}/${key}`;
        
        if (!sessionStorage.getItem('has_counted')) {
            // Hit the API to increment +1
            url += `/increment`;
            sessionStorage.setItem('has_counted', 'true');
        }

        // 2. Fetch the data
        const response = await fetch(url);
        const data = await response.json();

        // 3. Update the HTML with the new count
        if (data && data.count) {
            display.innerText = data.count.toLocaleString();
        }
    } catch (error) {
        console.error("Counter Error:", error);
        display.innerText = "Live"; // Fallback text
    }
}

// Run when page is ready
document.addEventListener('DOMContentLoaded', initCounter);