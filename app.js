// SISTec Digital Gate Pass - Interactive Product Site Controller

// Force scroll to top on reload
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  initShowcaseTabs();
  initRoleTabs();
  initFaqAccordions();
  animateCounters();
  setupMobileNav();
  startWorkflowAnimationLoop();
  initFeaturesHighlight();
  initScrollReveal();
  initCardSpotlight();
  initScrollToTop();
});

// --- 1. MOBILE NAVIGATION ---
function setupMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Toggle active state on click
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Navbar scroll background change
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
  });
}

// --- 2. INTERACTIVE SCREEN SHOWCASE (TAB ENGINE) ---
function initShowcaseTabs() {
  const buttons = document.querySelectorAll('.showcase-item-btn');
  if (buttons.length === 0) return;
  
  let currentIndex = 0;
  let cycleInterval = null;
  let isHovered = false;
  let isUserClicked = false; // State to track manual selection pause

  function selectTab(index) {
    currentIndex = index;
    const btn = buttons[currentIndex];
    
    // Toggle button states
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Get target screen
    const screenId = btn.getAttribute('data-screen');
    showPhoneScreen(screenId);
  }

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      isUserClicked = true; // Stop loop permanently on direct tab click
      clearInterval(cycleInterval);
      selectTab(index);
    });
    
    // Pause cycle on hover
    btn.addEventListener('mouseenter', () => {
      isHovered = true;
      clearInterval(cycleInterval);
    });
    
    // Resume cycle on mouse leave only if not manually clicked
    btn.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!isUserClicked) {
        startShowcaseCycle();
      }
    });
  });

  // Pause when hovering over the mockup phone itself
  const mockup = document.querySelector('.mockup-container');
  if (mockup) {
    mockup.addEventListener('mouseenter', () => {
      isHovered = true;
      clearInterval(cycleInterval);
    });
    mockup.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!isUserClicked) {
        startShowcaseCycle();
      }
    });
  }

  function startShowcaseCycle() {
    clearInterval(cycleInterval);
    // Don't auto-cycle on mobile to prevent the page from looking like it's refreshing
    if (window.innerWidth <= 992) return;
    
    cycleInterval = setInterval(() => {
      if (!isHovered && !isUserClicked) {
        currentIndex = (currentIndex + 1) % buttons.length;
        selectTab(currentIndex);
      }
    }, 3000);
  }

  // Resume cycle if user clicks anywhere outside the App Tour buttons and mockup container
  document.addEventListener('click', (e) => {
    const isButtonClick = Array.from(buttons).some(b => b.contains(e.target));
    const isMockupClick = mockup && mockup.contains(e.target);
    
    if (!isButtonClick && !isMockupClick) {
      if (isUserClicked) {
        isUserClicked = false;
        startShowcaseCycle();
      }
    }
  });

  // Resume cycle if user scrolls even a little bit
  window.addEventListener('scroll', () => {
    if (isUserClicked) {
      isUserClicked = false;
      startShowcaseCycle();
    }
  }, { passive: true });

  startShowcaseCycle();
}

// Helper to switch active screen inside the phone mockup
function showPhoneScreen(screenId) {
  const screens = document.querySelectorAll('.phone-screen .screen-content');
  screens.forEach(scr => {
    if (scr.id === screenId) {
      scr.style.display = 'flex';
      scr.classList.add('active');
    } else {
      scr.style.display = 'none';
      scr.classList.remove('active');
    }
  });
}

// --- 3. TIMELINE FLOW DATA INITIALIZED ---
// Static workflow cards grid rendered directly in HTML.

// --- 4. DATA ENGINE INITIALIZED ---
// Static features grid rendered directly in HTML.

// --- 5. FAQ ACCORDION ---
function initFaqAccordions() {
  const cards = document.querySelectorAll('.faq-card');
  cards.forEach(card => {
    const header = card.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = card.classList.contains('active');
      cards.forEach(c => c.classList.remove('active'));
      if (!isActive) {
        card.classList.add('active');
      }
    });
  });
}

// --- 6. STATS COUNTER ANIMATION ---
function animateCounters() {
  const stats = [
    { id: 'metric-users', target: 1000, suffix: '+' },
    { id: 'metric-queue', target: 92, suffix: '%' },
    { id: 'metric-paper', target: 30, suffix: '+ kg' },
    { id: 'metric-sync', target: 1.8, suffix: 's' }
  ];

  stats.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;

    let current = 0;
    const duration = 2000; // 2 seconds
    const intervalTime = 30; // 30ms step
    const steps = duration / intervalTime;
    
    // Scale increments
    const increment = s.target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= s.target) {
        clearInterval(timer);
        el.innerText = formatNumber(s.target) + s.suffix;
      } else {
        if (Number.isInteger(s.target)) {
          el.innerText = formatNumber(Math.floor(current)) + s.suffix;
        } else {
          el.innerText = current.toFixed(1) + s.suffix;
        }
      }
    }, intervalTime);
  });
}

function formatNumber(num) {
  if (num >= 1000) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return num;
}

// --- 5. WORKFLOW SEQUENTIAL AUTO-CYCLE ANIMATION ---
function startWorkflowAnimationLoop() {
  const cards = document.querySelectorAll('#workflow .flow-card');
  if (cards.length === 0) return;

  let activeIndex = 0;
  
  // Set first card active initially
  cards[0].classList.add('active');

  // Don't auto-cycle on mobile to prevent flickering/jumping layout illusion
  if (window.innerWidth <= 992) return;

  setInterval(() => {
    // Remove active class from current card
    cards[activeIndex].classList.remove('active');
    
    // Increment index
    activeIndex = (activeIndex + 1) % cards.length;
    
    // Add active class to next card
    cards[activeIndex].classList.add('active');
  }, 2500); // Shift active state every 2.5 seconds
}

// --- 6. INTERACTIVE CAMPUS ROLES TABS ---
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab-btn');
  const panels = document.querySelectorAll('.role-panel');
  if (tabs.length === 0) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate other tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show matching panel
      const roleId = tab.getAttribute('data-role');
      panels.forEach(p => {
        if (p.id === `panel-${roleId}`) {
          p.classList.add('active');
          if (roleId === 'parent') {
            runSmsSimulator();
          }
        } else {
          p.classList.remove('active');
        }
      });
    });
  });
}

// --- 7. INTERACTIVE DEVICE HIGHLIGHT ---
function initFeaturesHighlight() {
  const cards = document.querySelectorAll('.feature-item-card');
  const webMock = document.getElementById('mock-web-browser');
  const phoneMock = document.getElementById('mock-smartphone');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Remove all active states
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const target = card.getAttribute('data-device-target');
      if (target === 'web') {
        if (webMock) webMock.classList.add('highlight');
        if (phoneMock) phoneMock.classList.remove('highlight');
      } else if (target === 'phone') {
        if (phoneMock) phoneMock.classList.add('highlight');
        if (webMock) webMock.classList.remove('highlight');
      }
    });
  });
}

// --- 8. INTERACTIVE APK DOWNLOAD ANIMATION ---
function startApkDownload(btn) {
  const progressContainer = document.getElementById('apk-progress-container');
  const progressText = document.getElementById('apk-progress-text');
  const progressFill = document.getElementById('apk-progress-fill');
  
  if (!progressContainer || !progressText || !progressFill) return;
  
  // Hide button, show progress
  btn.style.display = 'none';
  progressContainer.style.display = 'flex';
  
  let percentage = 0;
  const interval = setInterval(() => {
    percentage += Math.floor(Math.random() * 8) + 4;
    if (percentage >= 100) {
      percentage = 100;
      clearInterval(interval);
      progressText.innerHTML = '✓ Download Complete!';
      progressFill.style.width = '100%';
      
      // Trigger actual file download after 500ms
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = 'app-release.apk'; // Actual file path to trigger browser download dialog
        a.download = 'app-release.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 500);
    } else {
      progressText.innerHTML = `Downloading... ${percentage}%`;
      progressFill.style.width = `${percentage}%`;
    }
  }, 150);
}

// --- 9. INTERACTIVE SCROLL REVEAL OBSERVER ---
function initScrollReveal() {
  const elements = document.querySelectorAll(
    'section h2, .section-desc, .hero h1, .hero p, .hero-btns-wrapper, .hero-preview-col, ' +
    '.feature-item-card, .glass-card, .role-tabs-bar, .role-details-container, ' +
    '.video-wrapper-frame, .video-guide-grid > div, .download-info-side, .download-action-side, ' +
    '.faq-card, .metric-item'
  );
  if (typeof IntersectionObserver === 'undefined') return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Animate once and clean up
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px -30px 0px"
  });
  
  elements.forEach(el => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
}

// --- 10. LIVE SMS TYPING SIMULATOR ---
let smsTimer1 = null;
let smsTimer2 = null;

function runSmsSimulator() {
  const smsBody = document.getElementById('sms-simulator-body');
  if (!smsBody) return;
  
  // Clear container
  smsBody.innerHTML = '';
  clearTimeout(smsTimer1);
  clearTimeout(smsTimer2);
  
  // 1. Show Typing Bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'sms-bubble-typing';
  typingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  smsBody.appendChild(typingBubble);
  
  // 2. Load SMS 1
  smsTimer1 = setTimeout(() => {
    if (typingBubble.parentNode) smsBody.removeChild(typingBubble);
    
    const sms1 = document.createElement('div');
    sms1.className = 'sms-bubble fade-in';
    sms1.style.cssText = 'background: #e2e8f0; border-radius: 12px; padding: 10px; font-size: 10px; line-height: 1.4; color: #332F3A; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-top: 8px;';
    sms1.innerHTML = `
      <strong style="font-size: 9px; display: block; margin-bottom: 2px;">SISTec Gate Pass Info</strong>
      <p style="margin: 0; font-size: 9.5px; color: #475569;">Dear Parent, Sandeep Kumar's hostel outing request has been approved by HOD.</p>
      <span class="sms-time" style="font-size: 7px; color: #94a3b8; display: block; text-align: right; margin-top: 4px;">10:15 AM</span>
    `;
    smsBody.appendChild(sms1);
    
    // Show typing bubble for SMS 2
    smsBody.appendChild(typingBubble);
    
    // 3. Load SMS 2
    smsTimer2 = setTimeout(() => {
      if (typingBubble.parentNode) smsBody.removeChild(typingBubble);
      
      const sms2 = document.createElement('div');
      sms2.className = 'sms-bubble fade-in';
      sms2.style.cssText = 'background: #e2e8f0; border-radius: 12px; padding: 10px; font-size: 10px; line-height: 1.4; color: #332F3A; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
      sms2.innerHTML = `
        <strong style="font-size: 9px; display: block; margin-bottom: 2px;">SISTec Gate Pass Info</strong>
        <p style="margin: 0; font-size: 9.5px; color: #475569;">Dear Parent, your child Sandeep Kumar has safely checked out at the Main Gate at 10:42 AM.</p>
        <span class="sms-time" style="font-size: 7px; color: #94a3b8; display: block; text-align: right; margin-top: 4px;">10:43 AM</span>
      `;
      smsBody.appendChild(sms2);
      smsBody.scrollTop = smsBody.scrollHeight;
    }, 1500);
    
  }, 1000);
}

// --- 11. INTERACTIVE OUTING APPROVAL SIMULATOR ---
let simStudentName = "Sandeep Kumar";
let simOutingType = "Hostel Outing";
let simReason = "Buying essential books from market";

function runOutingSimulation() {
  const nameInput = document.getElementById('sim-student-name');
  const typeSelect = document.getElementById('sim-outing-type');
  const reasonInput = document.getElementById('sim-reason');
  
  if (nameInput) simStudentName = nameInput.value || "Sandeep Kumar";
  if (typeSelect) simOutingType = typeSelect.value;
  if (reasonInput) simReason = reasonInput.value || "Buying books";

  // Reset all steps to baseline
  const steps = ['sim-step1', 'sim-step2', 'sim-step3', 'sim-step4'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'sim-step-state';
  });

  // Update Live ID Card Preview Status
  const cardStatus = document.getElementById('sim-preview-card-status');
  if (cardStatus) {
    cardStatus.innerText = 'PENDING TG';
    cardStatus.className = 'sim-status-chip pending';
    cardStatus.style.background = '';
    cardStatus.style.color = '';
  }

  // Complete Step 1
  document.getElementById('sim-step1-desc').innerText = `Outing pass request submitted. Reason: "${simReason}".`;
  document.getElementById('sim-step1-status').innerText = 'SUBMITTED';
  document.getElementById('sim-step1-status').className = 'sim-status-chip';
  document.getElementById('sim-step1').classList.add('completed');
  
  // Unlock & Activate Step 2 (TG Approval)
  const step2 = document.getElementById('sim-step2');
  step2.classList.add('active');
  document.getElementById('sim-step2-desc').innerText = `Tutor Guardian reviewing request for ${simStudentName}.`;
  document.getElementById('sim-step2-status').innerText = 'PENDING TG';
  document.getElementById('sim-step2-status').className = 'sim-status-chip pending';
  document.getElementById('sim-action-tg').style.display = 'block';

  // Clear future steps
  document.getElementById('sim-action-hod').style.display = 'none';
  document.getElementById('sim-gate-card').style.display = 'none';
  document.getElementById('sim-step2-status').innerText = 'PENDING TG';
  document.getElementById('sim-step3-status').innerText = 'LOCKED';
  document.getElementById('sim-step3-desc').innerText = 'Awaiting HOD dashboard signoff.';
  document.getElementById('sim-step4-status').innerText = 'LOCKED';
  document.getElementById('sim-step4-desc').innerText = 'Student profile pending gate list sync.';
  
  // Disable trigger button during run
  const initBtn = document.getElementById('sim-btn-initiate');
  if (initBtn) {
    initBtn.disabled = true;
    initBtn.style.opacity = '0.5';
    initBtn.innerText = '⌛ Simulation Active';
  }
}

function approveTGStep() {
  document.getElementById('sim-action-tg').style.display = 'none';
  
  const step2 = document.getElementById('sim-step2');
  step2.className = 'sim-step-state completed';
  document.getElementById('sim-step2-desc').innerText = `Approved by Tutor Guardian. Reason verified.`;
  document.getElementById('sim-step2-status').innerText = 'APPROVED';

  // Update Live ID Card Preview Status
  const cardStatus = document.getElementById('sim-preview-card-status');
  if (cardStatus) {
    cardStatus.innerText = 'PENDING HOD';
    cardStatus.className = 'sim-status-chip pending';
  }

  // Activate HOD Step
  const step3 = document.getElementById('sim-step3');
  step3.className = 'sim-step-state active';
  document.getElementById('sim-step3-desc').innerText = `HOD dashboard alert triggered. Final clearance pending.`;
  document.getElementById('sim-step3-status').innerText = 'PENDING HOD';
  document.getElementById('sim-step3-status').className = 'sim-status-chip pending';
  document.getElementById('sim-action-hod').style.display = 'block';
}

function approveHODStep() {
  document.getElementById('sim-action-hod').style.display = 'none';
  
  const step3 = document.getElementById('sim-step3');
  step3.className = 'sim-step-state completed';
  document.getElementById('sim-step3-desc').innerText = `Approved digitally by HOD. Authorization token generated.`;
  document.getElementById('sim-step3-status').innerText = 'APPROVED';

  // Update Live ID Card Preview Status
  const cardStatus = document.getElementById('sim-preview-card-status');
  if (cardStatus) {
    cardStatus.innerText = 'SYNCED';
    cardStatus.className = 'sim-status-chip';
  }

  // Activate Gate Sync Step
  const step4 = document.getElementById('sim-step4');
  step4.className = 'sim-step-state active';
  document.getElementById('sim-step4-desc').innerText = `Approved pass synced to main gate console database. Photo verification active.`;
  document.getElementById('sim-step4-status').innerText = 'SYNCED';
  document.getElementById('sim-step4-status').className = 'sim-status-chip pending';
  
  // Show gate card profile details and active laser scan
  document.getElementById('sim-gate-name').innerText = simStudentName;
  const laser = document.getElementById('sim-laser-line');
  if (laser) laser.style.display = 'block';
  
  // Trigger laser scan sound effect
  playScanBeep();
  
  setTimeout(() => {
    document.getElementById('sim-gate-card').style.display = 'flex';
    document.getElementById('sim-step4').className = 'sim-step-state completed';
    document.getElementById('sim-step4-desc').innerText = `Gate checkout verified successfully for ${simStudentName}.`;
    document.getElementById('sim-step4-status').innerText = 'COMPLETED';
    
    // Hide laser scanner line
    if (laser) laser.style.display = 'none';
    
    // Play double high-pitched success chime
    playSuccessChime();

    // Final ID Card Status
    if (cardStatus) {
      cardStatus.innerText = 'EXIT PERMITTED';
      cardStatus.className = 'sim-status-chip';
      cardStatus.style.background = 'rgba(16, 185, 129, 0.1)';
      cardStatus.style.color = '#059669';
    }

    // Enable trigger button back
    const initBtn = document.getElementById('sim-btn-initiate');
    if (initBtn) {
      initBtn.disabled = false;
      initBtn.style.opacity = '1';
      initBtn.innerText = '⚡ Initiate Outing Request';
    }
  }, 1200);
}

// --- 13. WEB AUDIO SYNTHESIZER FOR SCANNER BEEPS ---
let audioCtxInstance = null;

function getAudioContext() {
  if (!audioCtxInstance) {
    audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtxInstance;
}

function playScanBeep() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime); // Mid-pitch beep
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn("Scan Audio Context blocked or not supported:", e);
  }
}

function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5 note
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(now + 0.12);
    
    // Second higher tone (chord) played 0.08s later
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, ctx.currentTime); // C#6 note
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.16);
      } catch (err) {}
    }, 80);
    
  } catch (e) {
    console.warn("Success Audio Context blocked or not supported:", e);
  }
}

// --- 14. CARD CURSOR SPOTLIGHT EFFECT ---
function initCardSpotlight() {
  const cards = document.querySelectorAll('.glass-card, .flow-card, .simulator-card-left, .simulator-card-right, .developer-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// --- 15. SCROLL TO TOP ENGINE ---
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
