// filepath: c:\Users\Nitro\Desktop\Ivanov-group-portfolio\script\slideshow.js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gallery-photos').forEach(initGallery);

    // create a single fullscreen overlay used by all galleries
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;cursor:zoom-out;';
    const overlayImg = document.createElement('img');
    overlayImg.style.cssText = 'max-width:90%;max-height:90vh;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:8px;box-shadow:0 0 30px rgba(0,0,0,0.5);';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-button';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:fixed;top:18px;right:18px;z-index:10001;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:44px;height:44px;font-size:28px;cursor:pointer;';
    overlay.appendChild(overlayImg);
    document.body.appendChild(overlay);
    document.body.appendChild(closeBtn);

    function openOverlay(src, currentGalleryState) {
        overlayImg.src = src;
        overlay.style.display = 'block';
        closeBtn.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        overlay._state = currentGalleryState || null; // store state to allow navigation
    }
    function closeOverlay() {
        overlay.style.display = 'none';
        closeBtn.style.display = 'none';
        overlayImg.src = '';
        document.body.style.overflow = '';
        overlay._state = null;
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
    closeBtn.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
        // if overlay open and gallery state present, allow left/right keys
        if (overlay.style.display === 'block' && overlay._state) {
            if (e.key === 'ArrowRight') overlay._state.next();
            if (e.key === 'ArrowLeft') overlay._state.prev();
        }
    });

    function initGallery(gallery) {
        const slides = Array.from(gallery.querySelectorAll('.photo'));
        if (!slides.length) return;

        const prevBtn = gallery.querySelector('.prev-btn');
        const nextBtn = gallery.querySelector('.next-btn');
        const dotsContainer = gallery.querySelector('.dots-container');

        let current = slides.findIndex(s => s.classList.contains('active'));
        if (current < 0) current = 0;
        const slideCount = slides.length;
        let intervalMs = 5000;
        let timer = null;

        // helper: update visible slide and dots
        function showSlide(index) {
            index = (index + slideCount) % slideCount;
            slides.forEach((s, i) => {
                if (i === index) s.classList.add('active'); else s.classList.remove('active');
            });
            updateDots(index);
            current = index;
        }

        // create dots
        dotsContainer.innerHTML = '';
        const dots = slides.map((_, i) => {
            const d = document.createElement('div');
            d.className = 'dot';
            d.style.cssText = 'width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.5);cursor:pointer;margin:0 6px;display:inline-block;';
            d.addEventListener('click', () => {
                goTo(i);
                restartAuto();
            });
            dotsContainer.appendChild(d);
            return d;
        });
        function updateDots(activeIndex) {
            dots.forEach((d, i) => d.style.background = (i === activeIndex) ? '#ffffff' : 'rgba(255,255,255,0.5)');
        }

        function next() { showSlide(current + 1); }
        function prev() { showSlide(current - 1); }
        function goTo(i) { showSlide(i); }

        // button handlers
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAuto(); });

        // click image to open fullscreen (uses current slide's img src)
        gallery.addEventListener('click', (e) => {
            const photoEl = e.target.closest('.photo');
            if (!photoEl) return;
            const idx = slides.indexOf(photoEl);
            if (idx < 0) return;
            const img = photoEl.querySelector('img');
            if (!img) return;
            // provide state to overlay so arrow keys can navigate and overlay shows current slide
            const state = {
                next: () => { next(); updateOverlayImage(); },
                prev: () => { prev(); updateOverlayImage(); },
                goTo: (i) => { goTo(i); updateOverlayImage(); }
            };
            openOverlay(img.src, state);
            function updateOverlayImage() {
                const activeImg = slides[current].querySelector('img');
                overlayImg.src = activeImg ? activeImg.src : '';
            }
        });

        // autoplay
        function startAuto() {
            if (timer) return;
            timer = setInterval(() => { next(); }, intervalMs);
        }
        function stopAuto() {
            if (!timer) return;
            clearInterval(timer);
            timer = null;
        }
        function restartAuto() {
            stopAuto();
            startAuto();
        }

        // pause on hover/focus
        gallery.addEventListener('mouseenter', stopAuto);
        gallery.addEventListener('mouseleave', startAuto);
        gallery.addEventListener('focusin', stopAuto);
        gallery.addEventListener('focusout', startAuto);

        // keyboard when gallery focused
        gallery.tabIndex = gallery.tabIndex || 0;
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { next(); restartAuto(); }
            if (e.key === 'ArrowLeft') { prev(); restartAuto(); }
        });

        // init
        showSlide(current);
        startAuto();

        // expose small API on gallery element for overlay navigation
        gallery._slideshowState = {
            next: () => { next(); },
            prev: () => { prev(); },
            goTo: (i) => { goTo(i); }
        };
    }
});