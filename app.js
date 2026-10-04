/* =========================================================
   BURGER FACTORY ATL — Website + Employment Application
   Frontend script (works with index.html + Code.gs)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {

  // ---------------------------------------------------------
  // CONFIG — Apps Script /exec URL
  // ---------------------------------------------------------
  const CONFIG = {
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbyFZ8s80rDVunl5O9bC4cgH5AmqNLyclKOInlwAyJ7jnFT0OlrZ6U_lln99-2AKnOYS4Q/exec",
    MAX_RESUME_BYTES: 4 * 1024 * 1024,
    TOTAL_STEPS: 5,
    REQUEST_TIMEOUT_MS: 60000
  };

  const $ = (id) => document.getElementById(id);
  const form = $("jobApplication");

  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const stepTabs = Array.from(document.querySelectorAll(".steps__item"));
  const timeline = Array.from(document.querySelectorAll(".timeline li"));
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const submitBtn = $("submitBtn");
  const resumeInput = $("resume");
  const fileStatus = $("fileStatus");

  const RING_LEN = 100.5;

  let currentStep = 1;
  let toastTimer = null;
  let pendingSubmissionToken = null;

  // ---------------------------------------------------------
  // DATES
  // ---------------------------------------------------------
  function localToday() {
    const now = new Date();

    return new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  }

  function setDates() {
    const today = localToday();

    $("signatureDate").value = today;

    const start = form.elements.startDate;

    if (start) {
      start.min = today;
    }

    if ($("year")) {
      $("year").textContent = new Date().getFullYear();
    }
  }

  setDates();

  // ---------------------------------------------------------
  // TOAST
  // ---------------------------------------------------------
  function toast(msg) {
    const t = $("toast");

    t.textContent = msg;
    t.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      t.classList.add("hidden");
    }, 4500);
  }

  function hideToast() {
    $("toast").classList.add("hidden");
  }

  // ---------------------------------------------------------
  // STEP UI
  // ---------------------------------------------------------
  function scrollToCard() {
    const card = document.querySelector(".app-card");

    const offset =
      window.innerWidth <= 760
        ? 70
        : 96;

    const top =
      card.getBoundingClientRect().top +
      window.pageYOffset -
      offset;

    if (Math.abs(window.pageYOffset - top) > 40) {
      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    }
  }

  function updateUI(scroll) {
    steps.forEach((s) => {
      s.classList.toggle(
        "is-active",
        Number(s.dataset.step) === currentStep
      );
    });

    const active = steps[currentStep - 1];

    stepTabs.forEach((t, i) => {
      t.classList.toggle(
        "is-active",
        i + 1 === currentStep
      );

      t.classList.toggle(
        "is-done",
        i + 1 < currentStep
      );
    });

    timeline.forEach((t, i) => {
      t.classList.toggle(
        "is-active",
        i + 1 === currentStep
      );

      t.classList.toggle(
        "is-done",
        i + 1 < currentStep
      );
    });

    const activeTab = stepTabs[currentStep - 1];

    if (activeTab && window.innerWidth <= 760) {
      activeTab.parentElement.scrollTo({
        left: activeTab.offsetLeft - 14,
        behavior: "smooth"
      });
    }

    const pct = Math.round(
      (currentStep / CONFIG.TOTAL_STEPS) * 100
    );

    $("stepNum").textContent = currentStep;

    $("stepTitle").textContent =
      active
        ? active.dataset.title
        : "";

    $("ringPct").textContent =
      pct + "%";

    $("ringFg").style.strokeDashoffset =
      RING_LEN -
      (RING_LEN * pct) / 100;

    const last =
      currentStep === CONFIG.TOTAL_STEPS;

    prevBtn.classList.toggle(
      "hidden",
      currentStep === 1
    );

    nextBtn.classList.toggle(
      "hidden",
      last
    );

    submitBtn.classList.toggle(
      "hidden",
      !last
    );

    if (last) {
      buildReview();
    }

    hideToast();

    if (scroll !== false) {
      scrollToCard();
    }
  }

  // ---------------------------------------------------------
  // CONDITIONAL FIELDS
  // ---------------------------------------------------------
  const conditionals = [
    [
      "hasExperience",
      "Yes",
      "experiencePanel"
    ],
    [
      "hasCertification",
      "Yes",
      "certificationPanel"
    ],
    [
      "workedBurgerFactory",
      "Yes",
      "previousLocationWrap"
    ],
    [
      "hearAbout",
      "Employee referral",
      "referralNameWrap"
    ]
  ];

  function syncConditionals() {
    conditionals.forEach(
      ([inputId, value, panelId]) => {

        const input = $(inputId);
        const panel = $(panelId);

        if (input && panel) {
          panel.classList.toggle(
            "hidden",
            input.value !== value
          );
        }
      }
    );

    $("otherPositionWrap").classList.toggle(
      "hidden",
      !$("positionOther").checked
    );

    syncRoleCards();
  }

  form.addEventListener(
    "change",
    syncConditionals
  );

  // ---------------------------------------------------------
  // ROLE CARDS
  // ---------------------------------------------------------
  const roleCards =
    Array.from(
      document.querySelectorAll(".role")
    );

  function positionBox(value) {
    return form.querySelector(
      'input[name="positions"][value="' +
      value +
      '"]'
    );
  }

  function syncRoleCards() {
    roleCards.forEach((card) => {

      const box =
        positionBox(card.dataset.role);

      const on =
        !!(box && box.checked);

      card.classList.toggle(
        "is-picked",
        on
      );

      card.querySelector("em").textContent =
        on
          ? "✓ Added"
          : "+ Add";
    });
  }

  roleCards.forEach((card) => {

    card.addEventListener(
      "click",
      () => {

        const box =
          positionBox(card.dataset.role);

        if (!box) return;

        box.checked =
          !box.checked;

        $("positionsError")
          .classList
          .remove("show");

        syncRoleCards();
      }
    );
  });

  syncConditionals();

  // ---------------------------------------------------------
  // QUICK FILL — ALL DAYS OPEN
  // ---------------------------------------------------------
  $("allOpen").addEventListener(
    "click",
    () => {

      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ].forEach((d) => {

        const s =
          form.elements["avail" + d];

        s.value = "Open";

        s.classList.remove(
          "invalid"
        );
      });
    }
  );

  // ---------------------------------------------------------
  // CLEAR ERRORS WHILE TYPING
  // ---------------------------------------------------------
  function clearField(e) {

    const f = e.target;

    if (
      !f.matches ||
      !f.matches(
        "input, select, textarea"
      )
    ) {
      return;
    }

    f.classList.remove(
      "invalid"
    );

    if (f.type === "radio") {

      form.querySelectorAll(
        'input[name="' +
        f.name +
        '"]'
      )
        .forEach((r) => {
          r.classList.remove(
            "invalid"
          );
        });
    }

    if (f.name === "positions") {
      $("positionsError")
        .classList
        .remove("show");
    }
  }

  form.addEventListener(
    "input",
    clearField
  );

  form.addEventListener(
    "change",
    clearField
  );

  // ---------------------------------------------------------
  // ENTER KEY = NEXT STEP
  // ---------------------------------------------------------
  form.addEventListener(
    "keydown",
    (e) => {

      if (
        e.key === "Enter" &&
        e.target.tagName === "INPUT" &&
        currentStep < CONFIG.TOTAL_STEPS
      ) {
        e.preventDefault();
        nextBtn.click();
      }
    }
  );

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------
  const isVisible =
    (el) =>
      !el.closest(".hidden");

  function validateStep(n) {

    const step =
      steps[n - 1];

    let firstBad = null;

    const seenRadio = {};

    step
      .querySelectorAll("[required]")
      .forEach((field) => {

        if (!isVisible(field)) {
          return;
        }

        let ok;

        if (
          field.type === "radio"
        ) {

          if (
            seenRadio[field.name]
          ) {
            return;
          }

          seenRadio[field.name] =
            true;

          const group =
            Array.from(
              step.querySelectorAll(
                'input[name="' +
                field.name +
                '"]'
              )
            );

          ok =
            group.some(
              (r) => r.checked
            );

          group.forEach((r) => {
            r.classList.toggle(
              "invalid",
              !ok
            );
          });

        } else if (
          field.type === "checkbox"
        ) {

          ok = field.checked;

        } else {

          if (
            typeof field.value ===
              "string" &&
            field.value.trim() === ""
          ) {
            field.value = "";
          }

          ok =
            field.checkValidity();
        }

        field.classList.toggle(
          "invalid",
          !ok
        );

        if (
          !ok &&
          !firstBad
        ) {
          firstBad = field;
        }
      });

    // Position validation
    if (n === 2) {

      const any =
        form.querySelectorAll(
          'input[name="positions"]:checked'
        ).length > 0;

      $("positionsError")
        .classList
        .toggle(
          "show",
          !any
        );

      if (
        !any &&
        !firstBad
      ) {
        firstBad =
          form.querySelector(
            'input[name="positions"]'
          );
      }
    }

    if (firstBad) {

      let msg =
        "Please complete the highlighted fields.";

      if (
        firstBad.type ===
          "email" &&
        firstBad.value
      ) {
        msg =
          "Please enter a valid email address.";
      }

      else if (
        firstBad.tagName ===
          "TEXTAREA" &&
        firstBad.value
      ) {
        msg =
          "Please write at least 20 characters for that answer.";
      }

      toast(msg);

      const target =
        firstBad.closest(
          ".field, .avail, .check"
        ) ||
        firstBad;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      if (navigator.vibrate) {
        navigator.vibrate(25);
      }

      if (
        firstBad.type !== "radio" &&
        firstBad.type !== "checkbox"
      ) {

        setTimeout(() => {

          try {
            firstBad.focus({
              preventScroll: true
            });
          } catch (_) {}

        }, 350);
      }

      return false;
    }

    return true;
  }

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------
  nextBtn.addEventListener(
    "click",
    () => {

      if (
        !validateStep(
          currentStep
        )
      ) {
        return;
      }

      if (
        currentStep <
        CONFIG.TOTAL_STEPS
      ) {
        currentStep++;
        updateUI();
      }
    }
  );

  prevBtn.addEventListener(
    "click",
    () => {

      if (
        currentStep > 1
      ) {
        currentStep--;
        updateUI();
      }
    }
  );

  stepTabs.forEach(
    (tab, i) => {

      tab.addEventListener(
        "click",
        () => {

          if (
            i + 1 <
            currentStep
          ) {
            currentStep =
              i + 1;

            updateUI();
          }
        }
      );
    }
  );

  // ---------------------------------------------------------
  // REVIEW — STEP 5
  // ---------------------------------------------------------
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c])
    );

  function buildReview() {

    const d =
      formToObject();

    const positions =
      (d.positions || [])
        .map(
          (p) =>
            p === "Other" &&
            d.otherPosition
              ? d.otherPosition
              : p
        );

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];

    const avail =
      days
        .filter(
          (day) =>
            d["avail" + day] &&
            d["avail" + day] !==
              "Not Available"
        )
        .map(
          (day) =>
            day.slice(0, 3)
        );

    const items = [
      [
        "Name",
        [
          d.firstName,
          d.lastName
        ]
          .filter(Boolean)
          .join(" "),
        1
      ],

      [
        "Contact",
        [
          d.phone,
          d.email
        ]
          .filter(Boolean)
          .join(" · "),
        1
      ],

      [
        "Positions",
        positions.join(", "),
        2
      ],

      [
        "Type & start",
        [
          d.employmentType,
          d.startDate
        ]
          .filter(Boolean)
          .join(" · "),
        2
      ],

      [
        "Available",
        avail.length
          ? avail.join(", ")
          : "None selected",
        3
      ],

      [
        "Experience",
        d.hasExperience === "Yes"
          ? (
              d.recentEmployer ||
              "Yes"
            )
          : (
              d.hasExperience ||
              "—"
            ),
        4
      ]
    ];

    $("reviewSummary").innerHTML =
      items
        .map(
          ([
            label,
            value,
            step
          ]) =>
            '<div class="review__item">' +
            '<button type="button" data-goto="' +
            step +
            '">Edit</button>' +
            "<small>" +
            esc(label) +
            "</small>" +
            "<div>" +
            esc(value || "—") +
            "</div>" +
            "</div>"
        )
        .join("");
  }

  $("reviewSummary")
    .addEventListener(
      "click",
      (e) => {

        const btn =
          e.target.closest(
            "[data-goto]"
          );

        if (btn) {
          currentStep =
            Number(
              btn.dataset.goto
            );

          updateUI();
        }
      }
    );

  // ---------------------------------------------------------
  // RESUME
  // ---------------------------------------------------------
  function setFileStatus(
    text,
    state
  ) {

    fileStatus.textContent =
      text;

    fileStatus.className =
      state || "";
  }

  resumeInput.addEventListener(
    "change",
    () => {

      const file =
        resumeInput.files &&
        resumeInput.files[0];

      if (!file) {
        return setFileStatus(
          "PDF, DOC, or DOCX · max 4 MB"
        );
      }

      const ext =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        ![
          "pdf",
          "doc",
          "docx"
        ].includes(ext)
      ) {

        resumeInput.value = "";

        return setFileStatus(
          "Please upload a PDF, DOC, or DOCX file.",
          "err"
        );
      }

      if (
        file.size >
        CONFIG.MAX_RESUME_BYTES
      ) {

        resumeInput.value = "";

        return setFileStatus(
          "That file is over 4 MB.",
          "err"
        );
      }

      setFileStatus(
        "✓ " +
        file.name +
        " · " +
        (
          file.size /
          1048576
        ).toFixed(2) +
        " MB",
        "ok"
      );
    }
  );

  function fileToBase64(file) {

    return new Promise(
      (resolve, reject) => {

        if (!file) {
          return resolve(null);
        }

        const reader =
          new FileReader();

        reader.onload =
          () =>
            resolve({
              name: file.name,
              type:
                file.type ||
                "application/octet-stream",
              size:
                file.size,
              data:
                String(
                  reader.result
                ).split(",")[1]
            });

        reader.onerror =
          () =>
            reject(
              new Error(
                "We couldn't read your résumé file."
              )
            );

        reader.readAsDataURL(
          file
        );
      }
    );
  }

  // ---------------------------------------------------------
  // FORM → OBJECT
  // ---------------------------------------------------------
  function formToObject() {

    const data = {};

    new FormData(form)
      .forEach(
        (value, key) => {

          if (
            key === "resume" ||
            key === "website"
          ) {
            return;
          }

          if (
            key === "positions"
          ) {

            (
              data.positions =
                data.positions ||
                []
            ).push(value);

          } else {

            data[key] =
              typeof value ===
                "string"
                ? value.trim()
                : value;
          }
        }
      );

    return data;
  }

  // ---------------------------------------------------------
  // FINAL SILENT VALIDATION
  // ---------------------------------------------------------
  function stepIsValidSilent(n) {

    const step =
      steps[n - 1];

    const seenRadio = {};

    let ok = true;

    step
      .querySelectorAll("[required]")
      .forEach((field) => {

        if (!isVisible(field)) {
          return;
        }

        if (
          field.type === "radio"
        ) {

          if (
            seenRadio[field.name]
          ) {
            return;
          }

          seenRadio[field.name] =
            true;

          const group =
            Array.from(
              step.querySelectorAll(
                'input[name="' +
                field.name +
                '"]'
              )
            );

          if (
            !group.some(
              (r) => r.checked
            )
          ) {
            ok = false;
          }

        } else if (
          field.type ===
          "checkbox"
        ) {

          if (!field.checked) {
            ok = false;
          }

        } else if (
          !field.checkValidity()
        ) {

          ok = false;
        }
      });

    if (
      n === 2 &&
      !form.querySelector(
        'input[name="positions"]:checked'
      )
    ) {
      ok = false;
    }

    return ok;
  }

  function validateWholeApplication() {

    for (
      let n = 1;
      n <= CONFIG.TOTAL_STEPS;
      n++
    ) {

      if (
        !stepIsValidSilent(n)
      ) {

        currentStep = n;

        updateUI();

        validateStep(n);

        return false;
      }
    }

    return true;
  }

  // ---------------------------------------------------------
  // PROFESSIONAL SUBMISSION PROCESS
  // ---------------------------------------------------------
  const sending =
    $("sending");

  const sendingCard =
    $("sendingCard");

  const processRing =
    $("processRing");

  const processPercent =
    $("processPercent");

  const processEyebrow =
    $("processEyebrow");

  const processSteps =
    Array.from(
      document.querySelectorAll(
        ".process-steps li"
      )
    );

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  let processValue = 0;

  let softProgressTimer =
    null;

  const PROCESS = [
    {
      key: "validate",
      title:
        "Validating your application…",
      text:
        "Checking required information before anything is sent."
    },
    {
      key: "prepare",
      title:
        "Preparing secure submission…",
      text:
        "Packaging your application and résumé for delivery."
    },
    {
      key: "send",
      title:
        "Sending to the hiring team…",
      text:
        "Transmitting your application to Burger Factory ATL."
    },
    {
      key: "confirm",
      title:
        "Creating your confirmation…",
      text:
        "Waiting for the hiring system to confirm receipt."
    }
  ];

  function delay(ms) {

    return new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          reduceMotion
            ? 0
            : ms
        )
    );
  }

  function clampProgress(
    value
  ) {

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(value)
      )
    );
  }

  function paintProgress(
    value
  ) {

    processValue =
      clampProgress(value);

    processRing.style.setProperty(
      "--progress",
      processValue + "%"
    );

    processPercent.textContent =
      processValue + "%";
  }

  function setProcessStage(
    index,
    progress,
    title,
    text
  ) {

    const stage =
      PROCESS[index];

    processEyebrow.textContent =
      "Step " +
      (index + 1) +
      " of " +
      PROCESS.length;

    $("sendingTitle").textContent =
      title ||
      stage.title;

    $("sendingText").textContent =
      text ||
      stage.text;

    processSteps.forEach(
      (item, i) => {

        item.classList.toggle(
          "is-done",
          i < index
        );

        item.classList.toggle(
          "is-active",
          i === index
        );
      }
    );

    paintProgress(progress);
  }

  function markProcessComplete() {

    processEyebrow.textContent =
      "Complete";

    $("sendingTitle").textContent =
      "Application confirmed!";

    $("sendingText").textContent =
      "Your confirmation number is ready.";

    processSteps.forEach(
      (item) => {

        item.classList.add(
          "is-done"
        );

        item.classList.remove(
          "is-active"
        );
      }
    );

    paintProgress(100);
  }

  function startSoftProgress(
    cap
  ) {

    stopSoftProgress();

    softProgressTimer =
      setInterval(
        () => {

          if (
            processValue >= cap
          ) {
            return;
          }

          const remaining =
            cap -
            processValue;

          const bump =
            remaining > 16
              ? 2
              : 1;

          paintProgress(
            Math.min(
              cap,
              processValue +
              bump
            )
          );

        },
        reduceMotion
          ? 1000
          : 220
      );
  }

  function stopSoftProgress() {

    if (softProgressTimer) {
      clearInterval(
        softProgressTimer
      );
    }

    softProgressTimer =
      null;
  }

  function showSending() {

    stopSoftProgress();

    setProcessStage(
      0,
      8
    );

    sending.classList.remove(
      "hidden"
    );

    document.body.style.overflow =
      "hidden";

    setTimeout(
      () => {

        try {
          sendingCard.focus({
            preventScroll: true
          });
        } catch (_) {}

      },
      30
    );
  }

  function hideSending() {

    stopSoftProgress();

    sending.classList.add(
      "hidden"
    );

    document.body.style.overflow =
      "";
  }

  // ---------------------------------------------------------
  // SUBMISSION TOKEN
  // Helps prevent accidental duplicate submissions
  // ---------------------------------------------------------
  function createSubmissionToken() {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
        "function"
    ) {
      return window.crypto.randomUUID();
    }

    return (
      "bfa-" +
      Date.now().toString(36) +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 12)
    );
  }

  // ---------------------------------------------------------
  // FORMAT SUBMISSION TIME
  // ---------------------------------------------------------
  function formatSubmittedTime(
    date
  ) {

    try {

      return new Intl.DateTimeFormat(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit"
        }
      ).format(date);

    } catch (_) {

      return date.toLocaleString();
    }
  }

  // ---------------------------------------------------------
  // SUBMIT APPLICATION
  // ---------------------------------------------------------
  form.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      if (
        currentStep !==
        CONFIG.TOTAL_STEPS
      ) {
        return;
      }

      if (
        !validateWholeApplication()
      ) {
        return;
      }

      // Honeypot field
      const hp =
        form.querySelector(
          'input[name="website"]'
        );

      if (
        hp &&
        hp.value.trim()
      ) {
        return;
      }

      if (
        !CONFIG
          .APPS_SCRIPT_URL
          .startsWith(
            "https://script.google.com/"
          )
      ) {

        toast(
          "The application system is offline. Please email Burgerfactoryatl@gmail.com."
        );

        return;
      }

      submitBtn.disabled =
        true;

      hideToast();

      showSending();

      const controller =
        "AbortController" in window
          ? new AbortController()
          : null;

      const timer =
        setTimeout(
          () =>
            controller &&
            controller.abort(),
          CONFIG.REQUEST_TIMEOUT_MS
        );

      try {

        // --------------------------------------------
        // STEP 1 — VALIDATE
        // --------------------------------------------
        await delay(320);

        setProcessStage(
          1,
          28
        );

        // --------------------------------------------
        // STEP 2 — PREPARE DATA
        // --------------------------------------------
        const payload =
          formToObject();

        const applicantFirstName =
          payload.firstName ||
          "Applicant";

        if (
          !pendingSubmissionToken
        ) {

          pendingSubmissionToken =
            createSubmissionToken();
        }

        payload.submissionToken =
          pendingSubmissionToken;

        payload.submittedAtClient =
          new Date().toISOString();

        payload.pageUrl =
          window.location.href;

        const file =
          resumeInput.files &&
          resumeInput.files[0];

        payload.resume =
          await fileToBase64(
            file
          );

        paintProgress(
          file
            ? 42
            : 46
        );

        await delay(320);

        // --------------------------------------------
        // STEP 3 — SEND
        // --------------------------------------------
        setProcessStage(
          2,
          56
        );

        startSoftProgress(
          88
        );

        const res =
          await fetch(
            CONFIG.APPS_SCRIPT_URL,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify(
                  payload
                ),

              redirect:
                "follow",

              signal:
                controller
                  ? controller.signal
                  : undefined
            }
          );

        let result =
          null;

        try {
          result =
            await res.json();
        } catch (_) {}

        stopSoftProgress();

        // --------------------------------------------
        // STEP 4 — CONFIRM
        // --------------------------------------------
        setProcessStage(
          3,
          92
        );

        await delay(280);

        if (
          !res.ok ||
          !result ||
          result.ok !== true ||
          !result.applicationId
        ) {

          throw new Error(
            (
              result &&
              result.error
            ) ||
            "The server did not confirm your application."
          );
        }

        // --------------------------------------------
        // 100% COMPLETE
        // --------------------------------------------
        markProcessComplete();

        await delay(520);

        const confirmedName =
          result.firstName ||
          applicantFirstName;

        const confirmedAt =
          result.submittedAt
            ? new Date(
                result.submittedAt
              )
            : new Date();

        hideSending();

        // --------------------------------------------
        // SUCCESS SCREEN
        // --------------------------------------------
        $("successName").textContent =
          confirmedName;

        $("successId").textContent =
          result.applicationId;

        $("successTime").textContent =
          formatSubmittedTime(
            confirmedAt
          );

        $("copyConfirmation").textContent =
          "Copy";

        $("successScreen")
          .classList
          .remove("hidden");

        document.body.style.overflow =
          "hidden";

        setTimeout(
          () => {

            try {
              $("successCard")
                .focus({
                  preventScroll:
                    true
                });
            } catch (_) {}

          },
          30
        );

        // --------------------------------------------
        // RESET ONLY AFTER REAL SERVER CONFIRMATION
        // --------------------------------------------
        pendingSubmissionToken =
          null;

        form.reset();

        currentStep =
          1;

        setDates();

        setFileStatus(
          "PDF, DOC, or DOCX · max 4 MB"
        );

        form
          .querySelectorAll(
            ".invalid"
          )
          .forEach(
            (el) =>
              el.classList.remove(
                "invalid"
              )
          );

        $("positionsError")
          .classList
          .remove("show");

        syncConditionals();

        updateUI(false);

      } catch (err) {

        console.error(
          "Application submission error:",
          err
        );

        hideSending();

        if (
          err &&
          err.name ===
            "AbortError"
        ) {

          toast(
            "The connection timed out. Your form is still here — please check your internet and try again."
          );

        } else if (
          err &&
          err.message &&
          err.message !==
            "Failed to fetch" &&
          !/NetworkError|Load failed/i.test(
            err.message
          )
        ) {

          toast(
            "We couldn't submit: " +
            err.message
          );

        } else {

          toast(
            "We couldn't reach the hiring system. Your form was not cleared. Check your connection and try again."
          );
        }

      } finally {

        clearTimeout(timer);

        stopSoftProgress();

        submitBtn.disabled =
          false;
      }
    }
  );

  // ---------------------------------------------------------
  // COPY CONFIRMATION NUMBER
  // ---------------------------------------------------------
  $("copyConfirmation")
    .addEventListener(
      "click",
      async () => {

        const value =
          $("successId")
            .textContent
            .trim();

        if (
          !value ||
          value === "—"
        ) {
          return;
        }

        try {

          if (
            navigator.clipboard &&
            window.isSecureContext
          ) {

            await navigator
              .clipboard
              .writeText(value);

          } else {

            const temp =
              document.createElement(
                "textarea"
              );

            temp.value =
              value;

            temp.setAttribute(
              "readonly",
              ""
            );

            temp.style.position =
              "fixed";

            temp.style.opacity =
              "0";

            document.body
              .appendChild(temp);

            temp.select();

            document.execCommand(
              "copy"
            );

            temp.remove();
          }

          $("copyConfirmation")
            .textContent =
              "Copied ✓";

          setTimeout(
            () => {

              $("copyConfirmation")
                .textContent =
                  "Copy";

            },
            1800
          );

        } catch (_) {

          toast(
            "Please copy the confirmation number manually."
          );
        }
      }
    );

  // ---------------------------------------------------------
  // SUCCESS CLOSE
  // ---------------------------------------------------------
  function closeSuccess() {

    $("successScreen")
      .classList
      .add("hidden");

    document.body.style.overflow =
      "";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  $("closeSuccess")
    .addEventListener(
      "click",
      closeSuccess
    );

  // ---------------------------------------------------------
  // MOBILE — MORE SHEET
  // ---------------------------------------------------------
  const sheet =
    $("moreSheet");

  $("moreBtn")
    .addEventListener(
      "click",
      () =>
        sheet.classList.remove(
          "hidden"
        )
    );

  sheet.addEventListener(
    "click",
    (e) => {

      if (
        e.target === sheet ||
        e.target.closest(
          "[data-close]"
        )
      ) {

        sheet.classList.add(
          "hidden"
        );
      }
    }
  );

  // ---------------------------------------------------------
  // ESCAPE KEY
  // ---------------------------------------------------------
  document.addEventListener(
    "keydown",
    (e) => {

      if (
        e.key === "Escape"
      ) {

        sheet.classList.add(
          "hidden"
        );

        if (
          !$("successScreen")
            .classList
            .contains("hidden")
        ) {

          closeSuccess();
        }
      }
    }
  );

  // ---------------------------------------------------------
  // MOBILE ACTIVE TAB
  // ---------------------------------------------------------
  const tabs =
    Array.from(
      document.querySelectorAll(
        ".tabbar [data-tab]"
      )
    );

  function setTab(name) {

    tabs.forEach(
      (t) =>
        t.classList.toggle(
          "is-active",
          t.dataset.tab === name
        )
    );
  }

  if (
    "IntersectionObserver" in
    window
  ) {

    const map = {
      home:
        "home",
      roles:
        "roles",
      apply:
        "apply",
      location:
        "location",
      about:
        "more"
    };

    const io =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (en) => {

              if (
                en.isIntersecting
              ) {

                setTab(
                  map[
                    en.target.id
                  ]
                );
              }
            }
          );
        },
        {
          rootMargin:
            "-45% 0px -45% 0px"
        }
      );

    Object.keys(map)
      .forEach(
        (id) => {

          const el = $(id);

          if (el) {
            io.observe(el);
          }
        }
      );
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  updateUI(false);

});
