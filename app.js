/**
 * Personal Page & Live Clock Application
 * Deep Aurora Glassmorphism Theme
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const STORAGE_KEYS = {
    NAME: 'personal_space_user_name',
    TITLE: 'personal_space_user_title',
    FORMAT: 'personal_space_time_format' // '12H' or '24H'
  };

  const DEFAULT_VALUES = {
    NAME: 'Chen Jen Kai',
    TITLE: 'Creative Developer & Technologist',
    FORMAT: '12H'
  };

  // SVG Progress Ring Constants (r = 136)
  const RING_RADIUS = 136;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~854.513

  // --- DOM Elements ---
  const elements = {
    clockDigits: document.getElementById('clock-digits'),
    clockPeriod: document.getElementById('clock-period'),
    secondsValue: document.getElementById('seconds-value'),
    progressCircle: document.getElementById('progress-circle'),
    currentDateText: document.getElementById('current-date-text'),
    currentTimezoneText: document.getElementById('current-timezone-text'),
    greetingText: document.getElementById('greeting-text'),
    greetingIcon: document.getElementById('greeting-icon'),
    formatToggle: document.getElementById('format-toggle'),
    formatToggleLabel: document.getElementById('format-toggle-label'),
    userName: document.getElementById('user-name'),
    userTitle: document.getElementById('user-title'),
    editNameBtn: document.getElementById('edit-name-btn'),
    editTitleBtn: document.getElementById('edit-title-btn'),
    editHint: document.getElementById('edit-hint'),
    avatarInitials: document.getElementById('avatar-initials'),
    auroraContainer: document.querySelector('.aurora-container')
  };

  // --- State ---
  let is24Hour = localStorage.getItem(STORAGE_KEYS.FORMAT) === '24H';

  // --- Initialization ---
  function init() {
    setupRing();
    loadProfile();
    setupEventListeners();
    setupNavigation();
    updateTimezone();
    updateTime(); // Initial immediate render
    startClockLoop();
    initMouseParallax();
  }

  // --- SVG Progress Ring Setup ---
  function setupRing() {
    if (elements.progressCircle) {
      elements.progressCircle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
      elements.progressCircle.style.strokeDashoffset = `${CIRCUMFERENCE}`;
    }
  }

  function setRingProgress(percent) {
    if (!elements.progressCircle) return;
    const offset = CIRCUMFERENCE - (percent * CIRCUMFERENCE);
    elements.progressCircle.style.strokeDashoffset = offset;
  }

  // --- Time & Clock Loop ---
  function updateTime() {
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // 1. Dynamic Greeting based on hour
    updateGreeting(hours24);

    // 2. Format Hours & Period
    let displayHours = hours24;
    let period = '';

    if (!is24Hour) {
      period = hours24 >= 12 ? 'PM' : 'AM';
      displayHours = hours24 % 12 || 12;
      if (elements.clockPeriod) {
        elements.clockPeriod.textContent = period;
        elements.clockPeriod.style.display = 'inline-block';
      }
    } else {
      if (elements.clockPeriod) {
        elements.clockPeriod.textContent = '24H';
        elements.clockPeriod.style.display = 'inline-block';
      }
    }

    const formattedHours = String(displayHours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Render primary clock digits
    if (elements.clockDigits) {
      elements.clockDigits.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    // Render seconds tag
    if (elements.secondsValue) {
      elements.secondsValue.textContent = formattedSeconds;
    }

    // 3. Update Circular Progress Ring
    // Smooth transition incorporating fractional milliseconds
    const exactSeconds = seconds + (milliseconds / 1000);
    const progressFraction = exactSeconds / 60;
    setRingProgress(progressFraction);

    // 4. Update Date Display
    updateDate(now);
  }

  function startClockLoop() {
    // High-precision synchronization
    function loop() {
      updateTime();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function updateGreeting(hour) {
    if (!elements.greetingText || !elements.greetingIcon) return;

    let greeting = 'Hello & Welcome';
    let icon = '✨';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
      icon = '☀️';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good evening';
      icon = '🌆';
    } else {
      greeting = 'Good night';
      icon = '🌙';
    }

    const storedName = localStorage.getItem(STORAGE_KEYS.NAME) || DEFAULT_VALUES.NAME;
    const firstName = storedName.trim().split(' ')[0] || 'Friend';
    elements.greetingText.textContent = `${greeting}, ${firstName}`;
    elements.greetingIcon.textContent = icon;
  }

  function updateDate(dateObj) {
    if (!elements.currentDateText) return;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDateText.textContent = dateObj.toLocaleDateString(undefined, options);
  }

  function updateTimezone() {
    if (!elements.currentTimezoneText) return;
    try {
      const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -new Date().getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offsetMinutes) / 60);
      const mins = Math.abs(offsetMinutes) % 60;
      const formattedOffset = `GMT${sign}${hours}${mins ? `:${String(mins).padStart(2, '0')}` : ''}`;
      
      elements.currentTimezoneText.textContent = `${formattedOffset} (${timeZoneName})`;
    } catch (e) {
      elements.currentTimezoneText.textContent = 'Local Time';
    }
  }

  // --- Profile Name & Title Persistence ---
  function loadProfile() {
    const savedName = localStorage.getItem(STORAGE_KEYS.NAME) || DEFAULT_VALUES.NAME;
    const savedTitle = localStorage.getItem(STORAGE_KEYS.TITLE) || DEFAULT_VALUES.TITLE;

    if (elements.userName) elements.userName.textContent = savedName;
    if (elements.userTitle) elements.userTitle.textContent = savedTitle;

    updateAvatarInitials(savedName);
    updateToggleUI();
  }

  function updateAvatarInitials(name) {
    if (!elements.avatarInitials) return;
    const cleanName = name.trim();
    if (!cleanName) {
      elements.avatarInitials.textContent = 'ME';
      return;
    }
    const words = cleanName.split(/\s+/);
    if (words.length === 1) {
      elements.avatarInitials.textContent = words[0].slice(0, 2).toUpperCase();
    } else {
      elements.avatarInitials.textContent = (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
  }

  function enableEditing(element) {
    element.contentEditable = 'true';
    element.focus();
    if (elements.editHint) elements.editHint.classList.add('active');

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function finishEditing(element, storageKey, defaultValue) {
    element.contentEditable = 'false';
    if (elements.editHint) elements.editHint.classList.remove('active');

    let text = element.textContent.trim();
    if (!text) {
      text = defaultValue;
      element.textContent = text;
    }

    localStorage.setItem(storageKey, text);

    if (storageKey === STORAGE_KEYS.NAME) {
      updateAvatarInitials(text);
      updateGreeting(new Date().getHours());
    }
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // 12H / 24H Toggle
    if (elements.formatToggle) {
      elements.formatToggle.addEventListener('click', () => {
        is24Hour = !is24Hour;
        localStorage.setItem(STORAGE_KEYS.FORMAT, is24Hour ? '24H' : '12H');
        updateToggleUI();
        updateTime();
      });
    }

    // Name Editing
    if (elements.editNameBtn && elements.userName) {
      elements.editNameBtn.addEventListener('click', () => enableEditing(elements.userName));
      elements.userName.addEventListener('blur', () => {
        finishEditing(elements.userName, STORAGE_KEYS.NAME, DEFAULT_VALUES.NAME);
      });
      elements.userName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          elements.userName.blur();
        } else if (e.key === 'Escape') {
          elements.userName.textContent = localStorage.getItem(STORAGE_KEYS.NAME) || DEFAULT_VALUES.NAME;
          elements.userName.blur();
        }
      });
    }

    // Title Editing
    if (elements.editTitleBtn && elements.userTitle) {
      elements.editTitleBtn.addEventListener('click', () => enableEditing(elements.userTitle));
      elements.userTitle.addEventListener('blur', () => {
        finishEditing(elements.userTitle, STORAGE_KEYS.TITLE, DEFAULT_VALUES.TITLE);
      });
      elements.userTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          elements.userTitle.blur();
        } else if (e.key === 'Escape') {
          elements.userTitle.textContent = localStorage.getItem(STORAGE_KEYS.TITLE) || DEFAULT_VALUES.TITLE;
          elements.userTitle.blur();
        }
      });
    }
  }

  function updateToggleUI() {
    if (elements.formatToggleLabel) {
      elements.formatToggleLabel.textContent = is24Hour ? '24H' : '12H';
    }
  }

  // --- Section Navigation Highlighting ---
  function setupNavigation() {
    const navPills = document.querySelectorAll('.nav-pill');
    const sections = ['clock-section', 'skills-section', 'projects-section'];

    navPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const targetId = pill.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            navPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
          }
        }
      });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sections[i]);
        if (sectionEl && sectionEl.offsetTop <= scrollPos) {
          navPills.forEach(p => {
            if (p.getAttribute('href') === `#${sections[i]}`) {
              p.classList.add('active');
            } else {
              p.classList.remove('active');
            }
          });
          break;
        }
      }
    }, { passive: true });
  }

  // --- Subtle Ambient Parallax ---
  function initMouseParallax() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 20;
      const yPercent = (clientY / window.innerHeight - 0.5) * 20;

      const orbs = document.querySelectorAll('.aurora-orb');
      orbs.forEach((orb, idx) => {
        const factor = (idx + 1) * 0.4;
        orb.style.transform = `translate(${xPercent * factor}px, ${yPercent * factor}px)`;
      });
    }, { passive: true });
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
