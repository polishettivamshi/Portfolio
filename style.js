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
    
    // Home section typing - Smooth Professional
    var typed = new Typed(".typing", {
        strings: [
            "Python Developer",
            "Python Software Engineer",
            "Backend Developer",
            "Python API Developer",
            "Automation Engineer",
            "Application Developer"
        ],
        typeSpeed: 55,
        backSpeed: 45,        // Smooth ratio: 0.82
        backDelay: 600,       // Quick but smooth
        startDelay: 300,
        loop: true,
        cursorChar: "│",      // Pipe cursor
        smartBackspace: true,
        showCursor: true,
        // Simulate human typing rhythm
        onTypingPaused: function(arrayPos, self) {
            // Optional pause for natural rhythm
        },
        onTypingResumed: function(arrayPos, self) {
            // Resume typing
        }
    });

    // About typing - Different rhythm
    if(document.querySelector('.typing-2')) {
        var typed2 = new Typed(".typing-2", {
            strings: [
                "Python Developer",
                "Python Software Engineer",
                "Backend Developer",
                "Python API Developer",
                "Python Automation Engineer",
                "Application Developer"
            ],
            typeSpeed: 52,
            backSpeed: 42,
            backDelay: 650,
            startDelay: 350,
            loop: true,
            cursorChar: "│",
            smartBackspace: true,
            showCursor: true
        });
    }

    // Add smooth scrolling effect to cursor
    setInterval(() => {
        const cursors = document.querySelectorAll('.typed-cursor');
        cursors.forEach(cursor => {
            cursor.style.transition = 'all 0.1s ease';
        });
    }, 100);
    
    // Form submission
    $('#contact-form').submit(function(e){
        e.preventDefault();
        var submitBtn = $(this).find('button[type="submit"]');
        var originalText = submitBtn.html();
        
        // Show loading state
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Sending...');
        submitBtn.prop('disabled', true);
        
        // Simulate sending (replace with actual backend)
        setTimeout(function(){
            // alert('Message sent successfully! (Note: This is a demo. For actual functionality, connect to a backend service)');
            $('#contact-form')[0].reset();
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        }, 2000);
    });
    
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