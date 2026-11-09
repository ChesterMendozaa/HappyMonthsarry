// =========================================================
// DATES
// =========================================================
const TALK_START = new Date('2026-07-28T00:00:00');
const US_START   = new Date('2026-10-10T00:00:00');

function diffParts(from) {
  let diff = Math.max(0, Math.floor((Date.now() - from) / 1000));
  const d = Math.floor(diff / 86400); diff %= 86400;
  const h = Math.floor(diff / 3600); diff %= 3600;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return { d, h, m, s };
}

// =========================================================
// FLIP DIGIT RENDERER
// Only animates the digits that actually changed.
// Keeps the DOM light and feels like a heartbeat.
// =========================================================
function setFlipNum(id, value) {
  const el = document.querySelector(`[data-num="${id}"]`);
  if (!el) return;
  const str = String(value);
  if (el.textContent === str) return; // no change, skip animation

  el.classList.add('flipping');
  // Small delay so the fade-out is visible before swapping content
  setTimeout(() => {
    el.textContent = str;
    el.classList.remove('flipping');
  }, 180);
}

function tick() {
  const talk = diffParts(TALK_START);
  const us   = diffParts(US_START);

  setFlipNum('talk-d', talk.d);
  setFlipNum('talk-h', String(talk.h).padStart(2, '0'));
  setFlipNum('talk-m', String(talk.m).padStart(2, '0'));
  setFlipNum('talk-s', String(talk.s).padStart(2, '0'));

  setFlipNum('us-d', us.d);
  setFlipNum('us-h', String(us.h).padStart(2, '0'));
  setFlipNum('us-m', String(us.m).padStart(2, '0'));
  setFlipNum('us-s', String(us.s).padStart(2, '0'));
}

// Set initial values immediately without animation
(function initialRender() {
  const talk = diffParts(TALK_START);
  const us   = diffParts(US_START);

  document.querySelector('[data-num="talk-d"]').textContent = talk.d;
  document.querySelector('[data-num="talk-h"]').textContent = String(talk.h).padStart(2, '0');
  document.querySelector('[data-num="talk-m"]').textContent = String(talk.m).padStart(2, '0');
  document.querySelector('[data-num="talk-s"]').textContent = String(talk.s).padStart(2, '0');

  document.querySelector('[data-num="us-d"]').textContent = us.d;
  document.querySelector('[data-num="us-h"]').textContent = String(us.h).padStart(2, '0');
  document.querySelector('[data-num="us-m"]').textContent = String(us.m).padStart(2, '0');
  document.querySelector('[data-num="us-s"]').textContent = String(us.s).padStart(2, '0');
})();

setInterval(tick, 1000);

// =========================================================
// READING PROGRESS BAR
// Hairline at top that fills as she scrolls.
// =========================================================
const progressFill = document.getElementById('progressFill');
let progressTicking = false;

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  progressTicking = false;
}

window.addEventListener('scroll', () => {
  if (!progressTicking) {
    window.requestAnimationFrame(updateProgress);
    progressTicking = true;
  }
}, { passive: true });

window.addEventListener('resize', updateProgress);
updateProgress();

// =========================================================
// LETTER OPEN/CLOSE
// =========================================================
const btn = document.getElementById('letterBtn');
const letter = document.getElementById('letter');
btn.addEventListener('click', () => {
  const open = letter.classList.toggle('open');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
  btn.querySelector('span:last-child').textContent = open ? 'Close' : 'Read it';
});

// =========================================================
// LETTER LANGUAGE TOGGLE
// =========================================================
const translateBtn = document.getElementById('translateBtn');
const translateLabel = document.getElementById('translateLabel');
const letterEn = document.querySelector('.letter-content[data-lang="en"]');
const letterTl = document.querySelector('.letter-content[data-lang="tl"]');
let letterLang = 'en';

translateBtn.addEventListener('click', () => {
  letterLang = letterLang === 'en' ? 'tl' : 'en';
  const showingTagalog = letterLang === 'tl';

  letterEn.hidden = showingTagalog;
  letterTl.hidden = !showingTagalog;

  const active = showingTagalog ? letterTl : letterEn;
  active.style.animation = 'none';
  void active.offsetWidth;
  active.style.animation = '';

  translateBtn.classList.toggle('active', showingTagalog);
  translateBtn.setAttribute('aria-pressed', showingTagalog);
  translateLabel.textContent = showingTagalog
    ? 'Translate to English'
    : 'Translate to Tagalog';
});

// =========================================================
// QUESTION FORM
// =========================================================
const questionForm = document.getElementById('questionForm');
const questionInput = document.getElementById('questionInput');
const questionResponse = document.getElementById('questionResponse');

questionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const answer = questionInput.value.trim();
  if (!answer) return;
  questionForm.style.display = 'none';
  questionResponse.hidden = false;
});

// =========================================================
// SCROLL REVEAL
// =========================================================
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// =========================================================
// PHOTO REVEAL (staggered within each row)
// =========================================================
const photoIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      photoIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.photo-row').forEach(row => {
  row.querySelectorAll('.photo').forEach((photo, i) => {
    photo.style.transitionDelay = (i * 0.12) + 's';
    photoIO.observe(photo);
  });
});

// =========================================================
// STAGGER REASONS
// =========================================================
const reasonItems = document.querySelectorAll('#reasons li');
const reasonIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      reasonItems.forEach((li, i) => {
        setTimeout(() => li.classList.add('in'), i * 120);
      });
      reasonIO.disconnect();
    }
  });
}, { threshold: 0.2 });
if (reasonItems.length) reasonIO.observe(reasonItems[0]);

// =========================================================
// CINEMATIC LIGHTBOX — mobile swipe + desktop arrows
// =========================================================
const lightboxImages = Array.from(document.querySelectorAll('img[data-lightbox]'));
let lightboxIndex = 0;

// Build the lightbox DOM once
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.innerHTML = `
  <div class="lightbox-index" id="lightboxIndex"></div>
  <button class="lightbox-close" aria-label="Close">×</button>
  <button class="lightbox-nav prev" aria-label="Previous">
    <svg viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
  </button>
  <button class="lightbox-nav next" aria-label="Next">
    <svg viewBox="0 0 24 24"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
  </button>
  <div class="lightbox-stage">
    <img class="lightbox-img" alt="">
  </div>
  <div class="lightbox-caption"></div>
`;
document.body.appendChild(lightbox);

const lbImg       = lightbox.querySelector('.lightbox-img');
const lbCaption   = lightbox.querySelector('.lightbox-caption');
const lbIndex     = lightbox.querySelector('.lightbox-index');
const lbClose     = lightbox.querySelector('.lightbox-close');
const lbPrev      = lightbox.querySelector('.lightbox-nav.prev');
const lbNext      = lightbox.querySelector('.lightbox-nav.next');
const lbStage     = lightbox.querySelector('.lightbox-stage');

function openLightbox(index) {
  lightboxIndex = index;
  const img = lightboxImages[index];
  lbImg.src = img.src;
  lbImg.alt = img.alt || '';
  lbCaption.textContent = img.dataset.caption || '';
  lbIndex.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(lightboxImages.length).padStart(2, '0');
  lightbox.classList.add('open');
  document.body.classList.add('lightbox-open');

  // Reset the fade-in animation
  lbImg.style.transition = 'none';
  lbImg.style.opacity = '0';
  lbImg.style.transform = 'scale(0.96)';
  void lbImg.offsetWidth; // reflow
  lbImg.style.transition = '';
  lbImg.style.opacity = '';
  lbImg.style.transform = '';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
}

function showPrev() {
  if (lightboxImages.length < 2) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  openLightbox(lightboxIndex);
}

function showNext() {
  if (lightboxImages.length < 2) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  openLightbox(lightboxIndex);
}

// Open on photo tap
lightboxImages.forEach((img, i) => {
  img.addEventListener('click', () => openLightbox(i));
});

// Close events
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  // Close if tap is on the backdrop, not on the image or controls
  if (e.target === lightbox || e.target === lbStage) closeLightbox();
});
lbPrev.addEventListener('click', showPrev);
lbNext.addEventListener('click', showNext);

// Keyboard (desktop)
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// Swipe gestures (mobile)
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

lbStage.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchMoved = false;
}, { passive: true });

lbStage.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 1) return;
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > 10 || dy > 10) touchMoved = true;
  if (dx > dy && dx > 40) {
    // Horizontal drag — prevent page scroll underneath
    e.preventDefault();
  }
}, { passive: false });

lbStage.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  // Swipe detection: horizontal & > 50px
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    if (dx < 0) showNext();
    else showPrev();
  } else if (!touchMoved && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    // Tap on empty backdrop → close (but only if not on the image itself)
    if (e.target === lbStage) closeLightbox();
  }
}, { passive: true });

// =========================================================
// MUSIC PLAYERS
// =========================================================
const ICON_PLAY  = '<path d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';

function fmt(sec) {
  if (!isFinite(sec) || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function toSeconds(v) {
  if (!v) return 0;
  if (String(v).includes(':')) {
    const [m, s] = String(v).split(':').map(Number);
    return (m * 60) + (s || 0);
  }
  return Number(v) || 0;
}

const allAudios = Array.from(document.querySelectorAll('audio[data-start]'));

allAudios.forEach(audio => {
  const id = audio.id;
  const startAt = toSeconds(audio.dataset.start);

  const playBtn = document.querySelector(`[data-play="${id}"]`);
  const icon    = document.querySelector(`[data-icon="${id}"]`);
  const bar     = document.querySelector(`[data-bar="${id}"]`);
  const wrap    = document.querySelector(`[data-track="${id}"]`);
  const timeEl  = document.querySelector(`[data-time="${id}"]`);
  const durEl   = document.querySelector(`[data-dur="${id}"]`);
  const hintEl  = document.querySelector(`[data-hint="${id}"]`);

  if (startAt > 0) {
    hintEl.textContent = 'starts at ' + fmt(startAt);
  }

  audio.addEventListener('loadedmetadata', () => {
    if (startAt > 0 && startAt < audio.duration) {
      audio.currentTime = startAt;
      timeEl.textContent = fmt(startAt);
      bar.style.width = ((startAt / audio.duration) * 100) + '%';
    }
    durEl.textContent = fmt(audio.duration);
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      allAudios.forEach(other => {
        if (other !== audio) other.pause();
      });
      if (startAt > 0) {
        audio.currentTime = startAt;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    icon.innerHTML = ICON_PAUSE;
    playBtn.setAttribute('aria-label', 'Pause');
  });

  audio.addEventListener('pause', () => {
    icon.innerHTML = ICON_PLAY;
    playBtn.setAttribute('aria-label', 'Play');
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      bar.style.width = pct + '%';
      timeEl.textContent = fmt(audio.currentTime);
    }
  });

  audio.addEventListener('ended', () => {
    bar.style.width = startAt > 0 && audio.duration
      ? ((startAt / audio.duration) * 100) + '%'
      : '0%';
    timeEl.textContent = startAt > 0 ? fmt(startAt) : '0:00';
    if (startAt > 0) audio.currentTime = startAt;
  });

  wrap.addEventListener('click', (e) => {
    const rect = wrap.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });
});

// =========================================================
// FLOATING SONG PILL
// Appears after she scrolls past the music section.
// Scrolls to track 2 and starts it on tap.
// Hides itself after 25s or after she taps the music section play button.
// =========================================================
(function () {
  const pill = document.getElementById('songPill');
  if (!pill) return;

  const musicSection = document.querySelectorAll('section')[4]; // section 05 (music)
  const track2Play   = document.querySelector('[data-play="track2"]');
  const track2Audio  = document.getElementById('track2');

  // Start hidden
  pill.classList.remove('visible');

  let userDismissed = false;
  let autoHideTimer = null;
  let shown = false;

  // Show the pill once she scrolls past the music section
  function checkVisibility() {
    if (userDismissed || !musicSection) return;

    const musicBottom = musicSection.getBoundingClientRect().bottom;
    const shouldShow = musicBottom < 0; // music section is above the viewport

    if (shouldShow && !shown) {
      shown = true;
      pill.classList.add('visible');

      // Auto-hide after 25 seconds if she hasn't tapped it
      autoHideTimer = setTimeout(() => {
        pill.classList.remove('visible');
      }, 25000);
    }
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  checkVisibility();

  // Tap the pill: scroll to the music section + start track 2
  pill.addEventListener('click', () => {
    userDismissed = true;
    pill.classList.add('hidden');
    if (autoHideTimer) clearTimeout(autoHideTimer);

    if (musicSection) {
      musicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Small delay so the scroll starts before audio plays
    setTimeout(() => {
      if (track2Play) track2Play.click();
    }, 500);
  });

  // If she manually taps track 2's play button, hide the pill
  if (track2Play) {
    track2Play.addEventListener('click', () => {
      userDismissed = true;
      pill.classList.add('hidden');
      if (autoHideTimer) clearTimeout(autoHideTimer);
    });
  }
})();