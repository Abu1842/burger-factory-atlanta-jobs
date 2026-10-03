/* =========================================================
   BURGER FACTORY HOUSE – ATLANTA · EMPLOYMENT APPLICATION
   Frontend script
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {

  // ---------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------
  const CONFIG = {
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbzkFz0d45qJmCUq2JSI_vzxvaofEXUyzGplw3498jBGlnwvm32OsXvlvX3T8dJ0meyk4Q/exec",
    MAX_RESUME_BYTES: 4 * 1024 * 1024,
    TOTAL_STEPS: 5,
    REQUEST_TIMEOUT_MS: 45000
  };

  const $ = (id) => document.getElementById(id);

  const form = $("jobApplication");
  if (!form) { console.error("Application form not found."); return; }

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const navItems = Array.from(document.querySelectorAll(".step-nav__item"));
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const submitBtn = $("submitBtn");
  const progressBar = $("progressBar");
  const progressStep = $("progressStep");
  const globalError = $("globalError");
  const successScreen = $("successScreen");
  const closeSuccess = $("closeSuccess");
  const resumeInput = $("resume");
  const fileStatus = $("fileStatus");
  const appbarStep = $("appbarStep");
  const appbarNum = $("appbarNum");
  const appbarRing = $("appbarRing");
  const reviewSummary = $("reviewSummary");
  const RING_LEN = 97.4;

  let currentStep = 1;
  let errorTimer = null;

  // ---------------------------------------------------------
  // DATE + YEAR
  // ---------------------------------------------------------
  function setToday() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    if ($("signatureDate")) $("signatureDate").value = local;
    if ($("year")) $("year").textContent = now.getFullYear();
    const start = form.querySelector('[name="startDate"]');
    if (start) start.min = local;
  }
  setToday();

  // ---------------------------------------------------------
  // UI UPDATE
  // ---------------------------------------------------------
  function scrollToCard() {
    const card = document.querySelector(".application-card");
    if (!card) return;
    const appbarH = window.innerWidth <= 760 ? 70 : 15;
    const top = card.getBoundingClientRect().top + window.pageYOffset - appbarH;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  function updateUI(scroll) {
    steps.forEach((step) => step.classList.toggle("is-active", Number(step.dataset.step) === currentStep));

    navItems.forEach((item, i) => {
      item.classList.toggle("is-active", i + 1 === currentStep);
      item.classList.toggle("is-complete", i + 1 < currentStep);
      if (i + 1 === currentStep && item.scrollIntoView && window.innerWidth <= 760) {
        item.parentElement.scrollTo({ left: item.offsetLeft - 18, behavior: "smooth" });
      }
    });

    const pct = (currentStep / CONFIG.TOTAL_STEPS) * 100;
    if (progressStep) progressStep.textContent = "Step " + currentStep + " of " + CONFIG.TOTAL_STEPS;
    if (progressBar) progressBar.style.width = pct + "%";

    const active = steps.find((s) => Number(s.dataset.step) === currentStep);
    if (appbarStep) appbarStep.textContent = "Step " + currentStep + " · " + (active ? active.dataset.title : "");
    if (appbarNum) appbarNum.textContent = currentStep + "/" + CONFIG.TOTAL_STEPS;
    if (appbarRing) appbarRing.style.strokeDashoffset = RING_LEN - (RING_LEN * pct) / 100;

    const last = currentStep === CONFIG.TOTAL_STEPS;
    prevBtn && prevBtn.classList.toggle("hidden", currentStep === 1);
    nextBtn && nextBtn.classList.toggle("hidden", last);
    submitBtn && submitBtn.classList.toggle("hidden", !last);

    if (last) buildReview();
    hideError();
    if (scroll !== false) scrollToCard();
  }

  // ---------------------------------------------------------
  // ERRORS
  // ---------------------------------------------------------
  function showError(msg) {
    if (!globalError) return;
    globalError.textContent = msg;
    globalError.classList.remove("hidden");
    clearTimeout(errorTimer);
    if (window.innerWidth <= 760) errorTimer = setTimeout(hideError, 4000);
  }
  function hideError() { globalError && globalError.classList.add("hidden"); }

  // ---------------------------------------------------------
  // CONDITIONAL SECTIONS
  // ---------------------------------------------------------
  const conditionals = [
    ["hasExperience", "Yes", "experiencePanel"],
    ["hasCertification", "Yes", "certificationPanel"],
    ["workedBurgerFactory", "Yes", "previousLocationWrap"],
    ["hearAbout", "Employee referral", "referralNameWrap"]
  ];

  function syncConditionals() {
    conditionals.forEach(([inputId, value, panelId]) => {
      const input = $(inputId), panel = $(panelId);
      if (input && panel) panel.classList.toggle("hidden", input.value !== value);
    });
    const other = form.querySelector('[data-toggle="otherPosition"]');
    const otherWrap = $("otherPositionWrap");
    if (other && otherWrap) otherWrap.classList.toggle("hidden", !other.checked);
  }

  form.addEventListener("change", syncConditionals);
  syncConditionals();

  // ---------------------------------------------------------
  // CLEAR VALIDATION ON INPUT
  // ---------------------------------------------------------
  function clearField(e) {
    const f = e.target;
    if (!f.matches("input, select, textarea")) return;
    f.classList.remove("invalid");
    if (f.type === "radio") {
      form.querySelectorAll('input[name="' + f.name + '"]').forEach((r) => r.classList.remove("invalid"));
    }
    if (f.name === "positions") {
      const err = form.querySelector('[data-group-error="positions"]');
      err && err.classList.remove("show");
    }
  }
  form.addEventListener("input", (e) => { clearField(e); hideError(); });
  form.addEventListener("change", clearField);

  // Enter key moves to next step instead of submitting early
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "submit" && currentStep < CONFIG.TOTAL_STEPS) {
      e.preventDefault();
      nextBtn && nextBtn.click();
    }
  });

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------
  function isVisible(el) { return !el.closest(".hidden"); }

  function validateStep(stepNumber) {
    const step = form.querySelector('.form-step[data-step="' + stepNumber + '"]');
    if (!step) return true;

    let valid = true;
    let firstInvalid = null;
    const seenRadio = {};

    Array.from(step.querySelectorAll("[required]")).filter(isVisible).forEach((field) => {
      let ok = true;

      if (field.type === "radio") {
        if (seenRadio[field.name]) return;
        seenRadio[field.name] = true;
        const group = Array.from(step.querySelectorAll('input[type="radio"][name="' + field.name + '"]'));
        ok = group.some((r) => r.checked);
        group.forEach((r) => r.classList.toggle("invalid", !ok));
      } else if (field.type === "checkbox") {
        ok = field.checked;
      } else {
        if (field.value && field.value.trim() === "") field.value = "";
        ok = field.checkValidity();
      }

      field.classList.toggle("invalid", !ok);
      if (!ok) { valid = false; if (!firstInvalid) firstInvalid = field; }
    });

    if (stepNumber === 2) {
      const positions = Array.from(step.querySelectorAll('input[name="positions"]'));
      if (positions.length) {
        const any = positions.some((p) => p.checked);
        const err = step.querySelector('[data-group-error="positions"]');
        err && err.classList.toggle("show", !any);
        if (!any) { valid = false; if (!firstInvalid) firstInvalid = positions[0]; }
      }
    }

    if (!valid) {
      const emailBad = firstInvalid && firstInvalid.type === "email" && firstInvalid.value;
      showError(emailBad ? "Please enter a valid email address." : "Please complete the highlighted fields to continue.");
      if (firstInvalid) {
        const target = firstInvalid.closest(".field, .position-grid, .certify-check") || firstInvalid;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if (navigator.vibrate) navigator.vibrate(30);
        setTimeout(() => {
          if (firstInvalid.type !== "radio" && firstInvalid.type !== "checkbox") {
            try { firstInvalid.focus({ preventScroll: true }); } catch (_) {}
          }
        }, 350);
      }
    }
    return valid;
  }

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------
  nextBtn && nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (currentStep < CONFIG.TOTAL_STEPS) { currentStep++; updateUI(); }
  });

  prevBtn && prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep > 1) { currentStep--; updateUI(); }
  });

  navItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      const target = i + 1;
      if (target < currentStep) { currentStep = target; updateUI(); }
    });
  });

  // ---------------------------------------------------------
  // REVIEW SUMMARY (STEP 5)
  // ---------------------------------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function buildReview() {
    if (!reviewSummary) return;
    const d = formToObject();
    const positions = (d.positions || []).map((p) => (p === "Other" && d.otherPosition ? d.otherPosition : p));
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availableDays = days.filter((day) => d["avail" + day] && d["avail" + day] !== "Not available").map((day) => day.slice(0, 3));

    const items = [
      ["Name", [d.firstName, d.lastName].filter(Boolean).join(" "), 1],
      ["Contact", [d.email, d.phone].filter(Boolean).join(" · "), 1],
      ["Positions", positions.join(", "), 2],
      ["Type & start", [d.employmentType, d.startDate].filter(Boolean).join(" · "), 2],
      ["Available days", availableDays.length ? availableDays.join(", ") : "None selected", 2],
      ["Experience", d.hasExperience === "Yes" ? (d.prevEmployer || "Yes") : (d.hasExperience || "—"), 3]
    ];

    reviewSummary.innerHTML = items.map(([label, value, step]) =>
      '<div class="review__item"><button type="button" data-goto="' + step + '">Edit</button><small>' +
      escapeHtml(label) + "</small><div>" + escapeHtml(value || "—") + "</div></div>"
    ).join("");
  }

  reviewSummary && reviewSummary.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (btn) { currentStep = Number(btn.dataset.goto); updateUI(); }
  });

  // ---------------------------------------------------------
  // RESUME
  // ---------------------------------------------------------
  function setFileStatus(text, isError) {
    if (!fileStatus) return;
    fileStatus.textContent = text;
    fileStatus.style.color = isError ? "var(--danger)" : "";
  }

  resumeInput && resumeInput.addEventListener("change", () => {
    const file = resumeInput.files && resumeInput.files[0];
    if (!file) return setFileStatus("No file selected");
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) { resumeInput.value = ""; return setFileStatus("Please upload a PDF, DOC, or DOCX file.", true); }
    if (file.size > CONFIG.MAX_RESUME_BYTES) { resumeInput.value = ""; return setFileStatus("File is too large. Maximum size is 4 MB.", true); }
    setFileStatus("✓ " + file.name + " · " + (file.size / 1024 / 1024).toFixed(2) + " MB");
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: String(reader.result).split(",")[1]
      });
      reader.onerror = () => reject(new Error("Unable to read resume file."));
      reader.readAsDataURL(file);
    });
  }

  // ---------------------------------------------------------
  // FORM → OBJECT
  // ---------------------------------------------------------
  function formToObject() {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key === "resume" || key === "website") return;
      if (key === "positions") { (data.positions = data.positions || []).push(value); }
      else data[key] = typeof value === "string" ? value.trim() : value;
    });
    return data;
  }

  // =========================================================
  // PROCESSING OVERLAY
  // =========================================================
  const STAGES = [
    { key: "review", name: "Packaging application", status: "Packing", to: 20, title: "Packaging your application", text: "Organizing your answers for the hiring team." },
    { key: "resume", name: "Attaching résumé", status: "Attaching", to: 38, title: "Attaching your résumé", text: "Adding your file to the application packet." },
    { key: "deliver", name: "Sending over HTTPS", status: "Sending", to: 88, title: "Sending to hiring team", text: "Your application is on its way. Please keep this screen open." },
    { key: "finalize", name: "Confirming delivery", status: "Confirming", to: 100, title: "Confirming delivery", text: "Almost done — wrapping things up." }
  ];

  const overlay = document.createElement("div");
  overlay.className = "processing-overlay";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.innerHTML =
    '<div class="processing-card">' +
      '<div class="processing-top">' +
        '<div class="processing-ring" id="processingRing"><div class="processing-ring__inner">' +
          '<div class="processing-ring__percent" id="processingPercent">0</div>' +
          '<div class="processing-ring__label">Processing</div></div></div>' +
        "<div>" +
          '<div class="processing-kicker">Hiring system online</div>' +
          '<h2 class="processing-title" id="processingTitle">Preparing your application</h2>' +
          '<p class="processing-text" id="processingText">Please keep this page open.</p>' +
          '<div class="processing-packet"><div class="processing-packet__top"><span>Application packet</span>' +
            '<span class="processing-packet__signal" aria-hidden="true"><span></span><span></span><span></span><span></span></span></div>' +
            '<div class="processing-packet__track"><div class="processing-packet__bar"></div></div></div>' +
        "</div>" +
      "</div>" +
      '<ul class="processing-list">' +
        STAGES.map((s) =>
          '<li class="processing-item pending" data-stepkey="' + s.key + '"><span class="processing-item__dot"></span>' +
          '<span class="processing-item__name">' + s.name + '</span><span class="processing-item__status">Pending</span></li>'
        ).join("") +
      "</ul>" +
      '<div class="processing-foot"><span>🔒 Private application</span><span>🛡️ HTTPS connection</span><span>✓ Validated</span></div>' +
    "</div>";
  document.body.appendChild(overlay);

  const pRing = $("processingRing"), pPercent = $("processingPercent"), pTitle = $("processingTitle"), pText = $("processingText");
  let progressValue = 0;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setProgress(v) {
    progressValue = v;
    pRing && pRing.style.setProperty("--progress", v);
    if (pPercent) pPercent.textContent = v;
  }

  function animateProgress(to, duration) {
    const from = progressValue, start = performance.now();
    return new Promise((resolve) => {
      function frame(t) {
        const p = Math.min((t - start) / duration, 1);
        setProgress(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        p < 1 ? requestAnimationFrame(frame) : resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function setStage(key, state, statusText) {
    const item = overlay.querySelector('[data-stepkey="' + key + '"]');
    if (!item) return;
    item.classList.remove("pending", "active", "complete");
    item.classList.add(state);
    item.querySelector(".processing-item__status").textContent = statusText;
  }

  async function runStage(i, duration) {
    const s = STAGES[i];
    setStage(s.key, "active", s.status);
    if (pTitle) pTitle.textContent = s.title;
    if (pText) pText.textContent = s.text;
    await animateProgress(s.to, duration);
  }

  function showOverlay() {
    setProgress(0);
    STAGES.forEach((s) => setStage(s.key, "pending", "Pending"));
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function hideOverlay() {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  // Slowly creep progress while the network request is in flight
  function creepWhile(promise, ceiling) {
    let done = false;
    promise.finally(() => { done = true; });
    return (async () => {
      while (!done && progressValue < ceiling) {
        setProgress(progressValue + 1);
        await sleep(220);
      }
    })();
  }

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentStep !== CONFIG.TOTAL_STEPS) return;
    if (!validateStep(CONFIG.TOTAL_STEPS)) return;

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== "") { console.warn("Spam submission blocked."); return; }

    if (!CONFIG.APPS_SCRIPT_URL || !CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
      showError("The application system is temporarily unavailable. Please contact the restaurant.");
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add("is-loading"); }
    hideError();
    showOverlay();

    try {
      // 1. Package
      const payload = formToObject();
      payload.submittedAtClient = new Date().toISOString();
      payload.pageUrl = window.location.href;
      payload.userAgent = navigator.userAgent;
      payload.language = navigator.language || "";
      await runStage(0, 650);
      setStage("review", "complete", "Done");

      // 2. Résumé
      const resumeFile = resumeInput && resumeInput.files ? resumeInput.files[0] : null;
      const resumePromise = fileToBase64(resumeFile);
      await Promise.all([resumePromise, runStage(1, 600)]);
      payload.resume = await resumePromise;
      setStage("resume", "complete", resumeFile ? "Done" : "Skipped");

      // 3. Send (real network request drives this stage)
      const controller = "AbortController" in window ? new AbortController() : null;
      const timeout = setTimeout(() => controller && controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
      const request = fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).finally(() => clearTimeout(timeout));

      await runStage(2, 900);
      await Promise.all([request, creepWhile(request, 86)]);
      await animateProgress(88, 250);
      setStage("deliver", "complete", "Sent");

      // 4. Finalize
      await runStage(3, 600);
      setStage("finalize", "complete", "Done");
      if (pTitle) pTitle.textContent = "Application sent";
      if (pText) pText.textContent = "Thank you! Your application is with the Burger Factory House Atlanta hiring team.";
      await sleep(700);

      hideOverlay();
      if (successScreen) { successScreen.classList.remove("hidden"); document.body.style.overflow = "hidden"; }

      // reset
      form.reset();
      currentStep = 1;
      setToday();
      syncConditionals();
      setFileStatus("No file selected");
      form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
      updateUI(false);

    } catch (error) {
      console.error("Application submission error:", error);
      hideOverlay();
      showError(error && error.name === "AbortError"
        ? "The connection timed out. Please check your internet and try again."
        : "We could not send your application. Please check your internet connection and try again.");
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("is-loading"); }
    }
  });

  // ---------------------------------------------------------
  // SUCCESS CLOSE
  // ---------------------------------------------------------
  function closeSuccessScreen() {
    if (!successScreen || successScreen.classList.contains("hidden")) return;
    successScreen.classList.add("hidden");
    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  closeSuccess && closeSuccess.addEventListener("click", closeSuccessScreen);
  successScreen && successScreen.addEventListener("click", (e) => { if (e.target === successScreen) closeSuccessScreen(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSuccessScreen(); });

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  updateUI(false);
});
