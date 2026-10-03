// Burger Factory House – Atlanta
// Replace this URL after deploying the Google Apps Script backend.
const CONFIG = {
  APPS_SCRIPT_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  MAX_RESUME_BYTES: 4 * 1024 * 1024
};

const form = document.getElementById('jobApplication');
const steps = [...document.querySelectorAll('.form-step')];
const navItems = [...document.querySelectorAll('.step-nav__item')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressStep = document.getElementById('progressStep');
const globalError = document.getElementById('globalError');
const successScreen = document.getElementById('successScreen');
let currentStep = 1;

function setToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  document.getElementById('signatureDate').value = local;
  document.getElementById('year').textContent = now.getFullYear();
}
setToday();

function updateUI() {
  steps.forEach(step => step.classList.toggle('is-active', Number(step.dataset.step) === currentStep));
  navItems.forEach((item, idx) => {
    item.classList.toggle('is-active', idx + 1 === currentStep);
    item.classList.toggle('is-complete', idx + 1 < currentStep);
  });
  progressStep.textContent = `Step ${currentStep}`;
  progressBar.style.width = `${currentStep * 20}%`;
  prevBtn.classList.toggle('hidden', currentStep === 1);
  nextBtn.classList.toggle('hidden', currentStep === 5);
  submitBtn.classList.toggle('hidden', currentStep !== 5);
  globalError.classList.add('hidden');
  window.scrollTo({ top: document.querySelector('.application-card').offsetTop - 14, behavior: 'smooth' });
}

function setConditional(inputId, value, panelId) {
  const input = document.getElementById(inputId);
  const panel = document.getElementById(panelId);
  if (!input || !panel) return;
  const sync = () => panel.classList.toggle('hidden', input.value !== value);
  input.addEventListener('change', sync);
  sync();
}
setConditional('hasExperience', 'Yes', 'experiencePanel');
setConditional('hasCertification', 'Yes', 'certificationPanel');
setConditional('workedBurgerFactory', 'Yes', 'previousLocationWrap');
setConditional('hearAbout', 'Employee referral', 'referralNameWrap');

document.querySelector('[data-toggle="otherPosition"]').addEventListener('change', e => {
  document.getElementById('otherPositionWrap').classList.toggle('hidden', !e.target.checked);
});

function validateStep(stepNumber) {
  const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
  const required = [...step.querySelectorAll('[required]')];
  let valid = true;
  let firstInvalid = null;

  required.forEach(el => {
    let ok = el.checkValidity();
    if (el.type === 'radio') {
      const group = step.querySelectorAll(`[name="${CSS.escape(el.name)}"]`);
      ok = [...group].some(r => r.checked);
    }
    el.classList.toggle('invalid', !ok);
    if (!ok && !firstInvalid) firstInvalid = el;
    if (!ok) valid = false;
  });

  if (stepNumber === 2) {
    const positions = [...step.querySelectorAll('input[name="positions"]')];
    const hasPosition = positions.some(x => x.checked);
    step.querySelector('[data-group-error="positions"]').classList.toggle('show', !hasPosition);
    if (!hasPosition) {
      valid = false;
      if (!firstInvalid) firstInvalid = positions[0];
    }
  }

  if (!valid) {
    globalError.textContent = 'Please complete the required fields before continuing.';
    globalError.classList.remove('hidden');
    firstInvalid?.focus({ preventScroll: true });
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

form.addEventListener('input', e => {
  if (e.target.matches('input, select, textarea')) e.target.classList.remove('invalid');
});

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  currentStep = Math.min(5, currentStep + 1);
  updateUI();
});
prevBtn.addEventListener('click', () => {
  currentStep = Math.max(1, currentStep - 1);
  updateUI();
});
navItems.forEach((item, idx) => {
  item.addEventListener('click', () => {
    const target = idx + 1;
    if (target < currentStep) {
      currentStep = target;
      updateUI();
    }
  });
});

const resumeInput = document.getElementById('resume');
const fileStatus = document.getElementById('fileStatus');
resumeInput.addEventListener('change', () => {
  const file = resumeInput.files?.[0];
  if (!file) { fileStatus.textContent = 'No file selected'; return; }
  if (file.size > CONFIG.MAX_RESUME_BYTES) {
    resumeInput.value = '';
    fileStatus.textContent = 'File is too large. Maximum size is 4 MB.';
    fileStatus.style.color = '#b42318';
    return;
  }
  fileStatus.style.color = '';
  fileStatus.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      data: String(reader.result).split(',')[1]
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formToObject() {
  const fd = new FormData(form);
  const data = {};
  for (const [key, value] of fd.entries()) {
    if (key === 'resume') continue;
    if (key === 'positions') {
      if (!Array.isArray(data.positions)) data.positions = [];
      data.positions.push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateStep(5)) return;
  if (form.website.value) return;
  if (!CONFIG.APPS_SCRIPT_URL.startsWith('https://script.google.com/')) {
    globalError.textContent = 'This form is not connected to the private application backend yet. Complete the setup steps in README.md first.';
    globalError.classList.remove('hidden');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add('is-loading');
  globalError.classList.add('hidden');

  try {
    const payload = formToObject();
    payload.submittedAtClient = new Date().toISOString();
    payload.pageUrl = window.location.href;
    payload.resume = await fileToBase64(resumeInput.files?.[0]);

    // text/plain avoids a browser preflight request that Google Apps Script does not handle like a normal API.
    // no-cors intentionally produces an opaque response; successful network dispatch is followed by the thank-you screen.
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    successScreen.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    form.reset();
    currentStep = 1;
    setToday();
    updateUI();
    fileStatus.textContent = 'No file selected';
  } catch (err) {
    console.error(err);
    globalError.textContent = 'We could not send your application. Please check your connection and try again.';
    globalError.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
  }
});

document.getElementById('closeSuccess').addEventListener('click', () => {
  successScreen.classList.add('hidden');
  document.body.style.overflow = '';
});
