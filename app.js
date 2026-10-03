document.addEventListener("DOMContentLoaded", function () {

  // =========================================================
  // BURGER FACTORY HOUSE – ATLANTA
  // EMPLOYMENT APPLICATION
  // FINAL FRONTEND APPLICATION SCRIPT
  // =========================================================


  // ---------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------

  const CONFIG = {
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbzkFz0d45qJmCUq2JSI_vzxvaofEXUyzGplw3498jBGlnwvm32OsXvlvX3T8dJ0meyk4Q/exec",

    MAX_RESUME_BYTES:
      4 * 1024 * 1024
  };


  // ---------------------------------------------------------
  // MAIN ELEMENTS
  // ---------------------------------------------------------

  const form =
    document.getElementById("jobApplication");

  const steps =
    Array.from(
      document.querySelectorAll(".form-step")
    );

  const navItems =
    Array.from(
      document.querySelectorAll(".step-nav__item")
    );

  const prevBtn =
    document.getElementById("prevBtn");

  const nextBtn =
    document.getElementById("nextBtn");

  const submitBtn =
    document.getElementById("submitBtn");

  const progressBar =
    document.getElementById("progressBar");

  const progressStep =
    document.getElementById("progressStep");

  const globalError =
    document.getElementById("globalError");

  const successScreen =
    document.getElementById("successScreen");

  const closeSuccess =
    document.getElementById("closeSuccess");

  const resumeInput =
    document.getElementById("resume");

  const fileStatus =
    document.getElementById("fileStatus");


  let currentStep = 1;


  // ---------------------------------------------------------
  // SAFETY CHECK
  // ---------------------------------------------------------

  if (!form) {
    console.error(
      "Burger Factory House application form was not found."
    );

    return;
  }


  // ---------------------------------------------------------
  // TODAY'S DATE + COPYRIGHT YEAR
  // ---------------------------------------------------------

  function setToday() {

    const now =
      new Date();

    const localDate =
      new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];


    const signatureDate =
      document.getElementById(
        "signatureDate"
      );

    const year =
      document.getElementById(
        "year"
      );


    if (signatureDate) {
      signatureDate.value =
        localDate;
    }


    if (year) {
      year.textContent =
        now.getFullYear();
    }
  }


  setToday();


  // ---------------------------------------------------------
  // UPDATE CURRENT FORM STEP
  // ---------------------------------------------------------

  function updateUI() {

    steps.forEach(
      function (step) {

        const stepNumber =
          Number(
            step.getAttribute(
              "data-step"
            )
          );


        step.classList.toggle(
          "is-active",
          stepNumber === currentStep
        );
      }
    );


    navItems.forEach(
      function (item, index) {

        const number =
          index + 1;


        item.classList.toggle(
          "is-active",
          number === currentStep
        );


        item.classList.toggle(
          "is-complete",
          number < currentStep
        );
      }
    );


    if (progressStep) {

      progressStep.textContent =
        "Step " +
        currentStep +
        " of 5";
    }


    if (progressBar) {

      progressBar.style.width =
        currentStep * 20 + "%";
    }


    // Back button

    if (prevBtn) {

      if (currentStep === 1) {

        prevBtn.classList.add(
          "hidden"
        );

      } else {

        prevBtn.classList.remove(
          "hidden"
        );
      }
    }


    // Continue button

    if (nextBtn) {

      if (currentStep === 5) {

        nextBtn.classList.add(
          "hidden"
        );

      } else {

        nextBtn.classList.remove(
          "hidden"
        );
      }
    }


    // Submit button

    if (submitBtn) {

      if (currentStep === 5) {

        submitBtn.classList.remove(
          "hidden"
        );

      } else {

        submitBtn.classList.add(
          "hidden"
        );
      }
    }


    if (globalError) {

      globalError.classList.add(
        "hidden"
      );
    }


    const applicationCard =
      document.querySelector(
        ".application-card"
      );


    if (applicationCard) {

      const top =
        applicationCard
          .getBoundingClientRect()
          .top +
        window.pageYOffset -
        15;


      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    }
  }


  // ---------------------------------------------------------
  // CONDITIONAL SECTIONS
  // ---------------------------------------------------------

  function setupConditional(
    inputId,
    requiredValue,
    panelId
  ) {

    const input =
      document.getElementById(
        inputId
      );

    const panel =
      document.getElementById(
        panelId
      );


    if (!input || !panel) {
      return;
    }


    function sync() {

      if (
        input.value ===
        requiredValue
      ) {

        panel.classList.remove(
          "hidden"
        );

      } else {

        panel.classList.add(
          "hidden"
        );
      }
    }


    input.addEventListener(
      "change",
      sync
    );


    sync();
  }


  setupConditional(
    "hasExperience",
    "Yes",
    "experiencePanel"
  );


  setupConditional(
    "hasCertification",
    "Yes",
    "certificationPanel"
  );


  setupConditional(
    "workedBurgerFactory",
    "Yes",
    "previousLocationWrap"
  );


  setupConditional(
    "hearAbout",
    "Employee referral",
    "referralNameWrap"
  );


  // ---------------------------------------------------------
  // OTHER POSITION
  // ---------------------------------------------------------

  const otherPositionCheckbox =
    document.querySelector(
      '[data-toggle="otherPosition"]'
    );


  const otherPositionWrap =
    document.getElementById(
      "otherPositionWrap"
    );


  if (
    otherPositionCheckbox &&
    otherPositionWrap
  ) {

    function updateOtherPosition() {

      if (
        otherPositionCheckbox.checked
      ) {

        otherPositionWrap.classList.remove(
          "hidden"
        );

      } else {

        otherPositionWrap.classList.add(
          "hidden"
        );
      }
    }


    otherPositionCheckbox.addEventListener(
      "change",
      updateOtherPosition
    );


    updateOtherPosition();
  }


  // ---------------------------------------------------------
  // CLEAR VALIDATION ERROR WHEN USER TYPES
  // ---------------------------------------------------------

  form.addEventListener(
    "input",
    function (event) {

      const field =
        event.target;


      if (
        field.matches(
          "input, select, textarea"
        )
      ) {

        field.classList.remove(
          "invalid"
        );
      }


      if (globalError) {

        globalError.classList.add(
          "hidden"
        );
      }
    }
  );


  form.addEventListener(
    "change",
    function (event) {

      const field =
        event.target;


      if (
        field.matches(
          "input, select, textarea"
        )
      ) {

        field.classList.remove(
          "invalid"
        );
      }
    }
  );


  // ---------------------------------------------------------
  // VALIDATE CURRENT STEP
  // ---------------------------------------------------------

  function validateStep(
    stepNumber
  ) {

    const step =
      document.querySelector(
        '.form-step[data-step="' +
        stepNumber +
        '"]'
      );


    if (!step) {
      return true;
    }


    let valid =
      true;


    let firstInvalid =
      null;


    const requiredFields =
      Array.from(
        step.querySelectorAll(
          "[required]"
        )
      );


    const radioGroupsChecked =
      {};


    requiredFields.forEach(
      function (field) {

        let fieldValid =
          true;


        // Radio group

        if (
          field.type ===
          "radio"
        ) {

          const name =
            field.getAttribute(
              "name"
            );


          if (
            !radioGroupsChecked[
              name
            ]
          ) {

            const group =
              Array.from(
                step.querySelectorAll(
                  'input[type="radio"][name="' +
                  name +
                  '"]'
                )
              );


            fieldValid =
              group.some(
                function (radio) {

                  return (
                    radio.checked
                  );
                }
              );


            radioGroupsChecked[
              name
            ] = true;


            group.forEach(
              function (radio) {

                radio.classList.toggle(
                  "invalid",
                  !fieldValid
                );
              }
            );
          }


        // Required checkbox

        } else if (
          field.type ===
          "checkbox"
        ) {

          fieldValid =
            field.checked;


        // Standard field

        } else {

          fieldValid =
            field.checkValidity();
        }


        if (!fieldValid) {

          valid =
            false;


          field.classList.add(
            "invalid"
          );


          if (!firstInvalid) {

            firstInvalid =
              field;
          }

        } else {

          field.classList.remove(
            "invalid"
          );
        }
      }
    );


    // -------------------------------------------------------
    // POSITION SELECTION CHECK
    // -------------------------------------------------------

    if (
      stepNumber === 2
    ) {

      const positions =
        Array.from(
          step.querySelectorAll(
            'input[name="positions"]'
          )
        );


      if (
        positions.length > 0
      ) {

        const positionSelected =
          positions.some(
            function (position) {

              return (
                position.checked
              );
            }
          );


        const positionError =
          step.querySelector(
            '[data-group-error="positions"]'
          );


        if (positionError) {

          positionError.classList.toggle(
            "show",
            !positionSelected
          );
        }


        if (
          !positionSelected
        ) {

          valid =
            false;


          if (
            !firstInvalid
          ) {

            firstInvalid =
              positions[0];
          }
        }
      }
    }


    // -------------------------------------------------------
    // ERROR MESSAGE
    // -------------------------------------------------------

    if (!valid) {

      if (globalError) {

        globalError.textContent =
          "Please complete the required information before continuing.";


        globalError.classList.remove(
          "hidden"
        );
      }


      if (firstInvalid) {

        firstInvalid.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });


        setTimeout(
          function () {

            try {

              firstInvalid.focus({
                preventScroll: true
              });

            } catch (error) {

              try {
                firstInvalid.focus();
              } catch (ignore) {
                // nothing
              }
            }

          },
          350
        );
      }
    }


    return valid;
  }


  // ---------------------------------------------------------
  // CONTINUE BUTTON
  // ---------------------------------------------------------

  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        if (
          !validateStep(
            currentStep
          )
        ) {

          return;
        }


        if (
          currentStep < 5
        ) {

          currentStep =
            currentStep + 1;


          updateUI();
        }
      }
    );
  }


  // ---------------------------------------------------------
  // BACK BUTTON
  // ---------------------------------------------------------

  if (prevBtn) {

    prevBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        if (
          currentStep > 1
        ) {

          currentStep =
            currentStep - 1;


          updateUI();
        }
      }
    );
  }


  // ---------------------------------------------------------
  // STEP NAVIGATION
  // USER CAN GO BACK TO PREVIOUS STEPS
  // ---------------------------------------------------------

  navItems.forEach(
    function (item, index) {

      item.addEventListener(
        "click",
        function () {

          const targetStep =
            index + 1;


          if (
            targetStep <
            currentStep
          ) {

            currentStep =
              targetStep;


            updateUI();
          }
        }
      );
    }
  );


  // ---------------------------------------------------------
  // RESUME VALIDATION
  // ---------------------------------------------------------

  if (
    resumeInput &&
    fileStatus
  ) {

    resumeInput.addEventListener(
      "change",
      function () {

        const file =
          resumeInput.files &&
          resumeInput.files[0];


        if (!file) {

          fileStatus.textContent =
            "No file selected";


          fileStatus.style.color =
            "";


          return;
        }


        const allowedExtensions =
          [
            "pdf",
            "doc",
            "docx"
          ];


        const extension =
          file.name
            .split(".")
            .pop()
            .toLowerCase();


        if (
          !allowedExtensions.includes(
            extension
          )
        ) {

          resumeInput.value =
            "";


          fileStatus.textContent =
            "Please upload a PDF, DOC, or DOCX file.";


          fileStatus.style.color =
            "#b42318";


          return;
        }


        if (
          file.size >
          CONFIG.MAX_RESUME_BYTES
        ) {

          resumeInput.value =
            "";


          fileStatus.textContent =
            "File is too large. Maximum size is 4 MB.";


          fileStatus.style.color =
            "#b42318";


          return;
        }


        fileStatus.style.color =
          "";


        fileStatus.textContent =
          file.name +
          " · " +
          (
            file.size /
            1024 /
            1024
          ).toFixed(2) +
          " MB";
      }
    );
  }


  // ---------------------------------------------------------
  // FILE → BASE64
  // ---------------------------------------------------------

  function fileToBase64(
    file
  ) {

    return new Promise(
      function (
        resolve,
        reject
      ) {

        if (!file) {

          resolve(null);

          return;
        }


        const reader =
          new FileReader();


        reader.onload =
          function () {

            const result =
              String(
                reader.result
              );


            resolve({
              name:
                file.name,

              type:
                file.type ||
                "application/octet-stream",

              size:
                file.size,

              data:
                result.split(",")[1]
            });
          };


        reader.onerror =
          function () {

            reject(
              new Error(
                "Unable to read resume file."
              )
            );
          };


        reader.readAsDataURL(
          file
        );
      }
    );
  }


  // ---------------------------------------------------------
  // FORM → JAVASCRIPT OBJECT
  // ---------------------------------------------------------

  function formToObject() {

    const formData =
      new FormData(
        form
      );


    const data =
      {};


    formData.forEach(
      function (
        value,
        key
      ) {

        if (
          key ===
          "resume"
        ) {

          return;
        }


        if (
          key ===
          "positions"
        ) {

          if (
            !Array.isArray(
              data.positions
            )
          ) {

            data.positions =
              [];
          }


          data.positions.push(
            value
          );

        } else {

          data[key] =
            value;
        }
      }
    );


    return data;
  }


  // =========================================================
  // FUTURISTIC PROCESSING SCREEN
  // =========================================================

  const processingOverlay =
    document.createElement(
      "div"
    );


  processingOverlay.className =
    "processing-overlay";


  processingOverlay.innerHTML =
    `
      <div class="processing-card">

        <div class="processing-top">

          <div
            class="processing-ring"
            id="processingRing"
          >

            <div
              class="processing-ring__inner"
            >

              <div
                class="processing-ring__percent"
                id="processingPercent"
              >
                0
              </div>

              <div
                class="processing-ring__label"
              >
                Processing
              </div>

            </div>

          </div>


          <div>

            <div
              class="processing-kicker"
            >
              Hiring System Online
            </div>


            <h2
              class="processing-title"
              id="processingTitle"
            >
              Preparing your application
            </h2>


            <p
              class="processing-text"
              id="processingText"
            >
              Please keep this page open while your application is prepared for delivery to the hiring team.
            </p>


            <p
              class="processing-note"
            >
              This normally takes only a few seconds.
            </p>


            <div
              class="processing-packet"
            >

              <div
                class="processing-packet__top"
              >

                <span
                  class="processing-packet__label"
                >
                  Application packet
                </span>


                <span
                  class="processing-packet__signal"
                  aria-hidden="true"
                >

                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </span>

              </div>


              <div
                class="processing-packet__track"
              >

                <div
                  class="processing-packet__bar"
                ></div>

              </div>

            </div>

          </div>

        </div>


        <ul
          class="processing-list"
        >

          <li
            class="processing-item pending"
            data-stepkey="review"
          >

            <span
              class="processing-item__dot"
            ></span>

            <span
              class="processing-item__name"
            >
              Reviewing application details
            </span>

            <span
              class="processing-item__status"
            >
              Pending
            </span>

          </li>


          <li
            class="processing-item pending"
            data-stepkey="validate"
          >

            <span
              class="processing-item__dot"
            ></span>

            <span
              class="processing-item__name"
            >
              Checking required information
            </span>

            <span
              class="processing-item__status"
            >
              Pending
            </span>

          </li>


          <li
            class="processing-item pending"
            data-stepkey="secure"
          >

            <span
              class="processing-item__dot"
            ></span>

            <span
              class="processing-item__name"
            >
              Preparing protected HTTPS transfer
            </span>

            <span
              class="processing-item__status"
            >
              Pending
            </span>

          </li>


          <li
            class="processing-item pending"
            data-stepkey="deliver"
          >

            <span
              class="processing-item__dot"
            ></span>

            <span
              class="processing-item__name"
            >
              Sending application to hiring system
            </span>

            <span
              class="processing-item__status"
            >
              Pending
            </span>

          </li>


          <li
            class="processing-item pending"
            data-stepkey="finalize"
          >

            <span
              class="processing-item__dot"
            ></span>

            <span
              class="processing-item__name"
            >
              Preparing confirmation
            </span>

            <span
              class="processing-item__status"
            >
              Pending
            </span>

          </li>

        </ul>


        <div
          class="processing-foot"
        >

          <span>
            🔒 Private application
          </span>

          <span>
            🛡️ HTTPS protected connection
          </span>

          <span>
            ✓ Required-field validation
          </span>

        </div>

      </div>
    `;


  document.body.appendChild(
    processingOverlay
  );


  const processingRing =
    document.getElementById(
      "processingRing"
    );


  const processingPercent =
    document.getElementById(
      "processingPercent"
    );


  const processingTitle =
    document.getElementById(
      "processingTitle"
    );


  const processingText =
    document.getElementById(
      "processingText"
    );


  // ---------------------------------------------------------
  // WAIT UTILITY
  // ---------------------------------------------------------

  function sleep(
    milliseconds
  ) {

    return new Promise(
      function (resolve) {

        setTimeout(
          resolve,
          milliseconds
        );
      }
    );
  }


  // ---------------------------------------------------------
  // SHOW PROCESSING SCREEN
  // ---------------------------------------------------------

  function showProcessingOverlay() {

    processingOverlay.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";


    setProcessingProgress(
      0
    );


    resetProcessingItems();


    if (processingTitle) {

      processingTitle.textContent =
        "Preparing your application";
    }


    if (processingText) {

      processingText.textContent =
        "Please keep this page open while your application is prepared for delivery to the hiring team.";
    }
  }


  // ---------------------------------------------------------
  // HIDE PROCESSING SCREEN
  // ---------------------------------------------------------

  function hideProcessingOverlay() {

    processingOverlay.classList.remove(
      "show"
    );


    document.body.style.overflow =
      "";
  }


  // ---------------------------------------------------------
  // PROGRESS RING
  // ---------------------------------------------------------

  function setProcessingProgress(
    percent
  ) {

    if (processingRing) {

      processingRing.style.setProperty(
        "--progress",
        percent
      );
    }


    if (processingPercent) {

      processingPercent.textContent =
        percent;
    }
  }


  // ---------------------------------------------------------
  // RESET PROCESSING ITEMS
  // ---------------------------------------------------------

  function resetProcessingItems() {

    const items =
      processingOverlay.querySelectorAll(
        ".processing-item"
      );


    items.forEach(
      function (item) {

        item.classList.remove(
          "active",
          "complete"
        );


        item.classList.add(
          "pending"
        );


        const status =
          item.querySelector(
            ".processing-item__status"
          );


        if (status) {

          status.textContent =
            "Pending";
        }
      }
    );
  }


  // ---------------------------------------------------------
  // UPDATE ONE PROCESSING ITEM
  // ---------------------------------------------------------

  function updateProcessingItem(
    key,
    state,
    statusText
  ) {

    const item =
      processingOverlay.querySelector(
        '[data-stepkey="' +
        key +
        '"]'
      );


    if (!item) {
      return;
    }


    item.classList.remove(
      "pending",
      "active",
      "complete"
    );


    item.classList.add(
      state
    );


    const status =
      item.querySelector(
        ".processing-item__status"
      );


    if (status) {

      status.textContent =
        statusText;
    }
  }


  // ---------------------------------------------------------
  // ANIMATE PROGRESS NUMBERS SMOOTHLY
  // ---------------------------------------------------------

  async function animateProgress(
    from,
    to,
    duration
  ) {

    const difference =
      to - from;


    const start =
      performance.now();


    return new Promise(
      function (resolve) {

        function frame(
          timestamp
        ) {

          const elapsed =
            timestamp -
            start;


          const progress =
            Math.min(
              elapsed /
              duration,
              1
            );


          // Smooth easing

          const eased =
            1 -
            Math.pow(
              1 - progress,
              3
            );


          const value =
            Math.round(
              from +
              difference *
              eased
            );


          setProcessingProgress(
            value
          );


          if (
            progress < 1
          ) {

            requestAnimationFrame(
              frame
            );

          } else {

            resolve();
          }
        }


        requestAnimationFrame(
          frame
        );
      }
    );
  }


  // ---------------------------------------------------------
  // FUTURISTIC PROCESSING SEQUENCE
  // ---------------------------------------------------------

  async function runProcessingSequence() {

    const sequence = [

      {
        key:
          "review",

        start:
          0,

        end:
          18,

        title:
          "Reading application packet",

        text:
          "Your information has been received and is being organized for the hiring team.",

        status:
          "Reading",

        duration:
          750
      },


      {
        key:
          "validate",

        start:
          18,

        end:
          40,

        title:
          "Checking required information",

        text:
          "We’re checking the application for required fields and making sure the submission is properly formatted.",

        status:
          "Checking",

        duration:
          800
      },


      {
        key:
          "secure",

        start:
          40,

        end:
          63,

        title:
          "Preparing protected transfer",

        text:
          "Your application is being prepared for delivery through the secure HTTPS connection.",

        status:
          "Preparing",

        duration:
          850
      },


      {
        key:
          "deliver",

        start:
          63,

        end:
          86,

        title:
          "Sending to hiring system",

        text:
          "Your application packet is being transmitted to the Burger Factory House Atlanta hiring workflow.",

        status:
          "Sending",

        duration:
          900
      },


      {
        key:
          "finalize",

        start:
          86,

        end:
          98,

        title:
          "Preparing your confirmation",

        text:
          "Submission processing is almost complete. Please keep this screen open for another moment.",

        status:
          "Finalizing",

        duration:
          700
      }

    ];


    for (
      let i = 0;
      i < sequence.length;
      i++
    ) {

      const step =
        sequence[i];


      updateProcessingItem(
        step.key,
        "active",
        step.status
      );


      if (processingTitle) {

        processingTitle.textContent =
          step.title;
      }


      if (processingText) {

        processingText.textContent =
          step.text;
      }


      await animateProgress(
        step.start,
        step.end,
        step.duration
      );


      await sleep(
        180
      );


      updateProcessingItem(
        step.key,
        "complete",
        "Complete"
      );
    }


    await animateProgress(
      98,
      100,
      450
    );


    if (processingTitle) {

      processingTitle.textContent =
        "Application sent";
    }


    if (processingText) {

      processingText.textContent =
        "Thank you. Your application has been transmitted to the Burger Factory House Atlanta hiring workflow.";
    }


    await sleep(
      750
    );
  }


  // ---------------------------------------------------------
  // SUBMIT APPLICATION
  // ---------------------------------------------------------

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      // Final validation

      if (
        !validateStep(5)
      ) {

        return;
      }


      // Honeypot spam check

      const honeypot =
        form.querySelector(
          'input[name="website"]'
        );


      if (
        honeypot &&
        honeypot.value.trim() !== ""
      ) {

        console.warn(
          "Spam submission blocked."
        );

        return;
      }


      // Backend URL check

      if (
        !CONFIG.APPS_SCRIPT_URL ||
        !CONFIG.APPS_SCRIPT_URL.startsWith(
          "https://script.google.com/"
        )
      ) {

        if (globalError) {

          globalError.textContent =
            "The application system is temporarily unavailable. Please contact the restaurant.";


          globalError.classList.remove(
            "hidden"
          );
        }


        return;
      }


      // Prevent double submission

      if (submitBtn) {

        submitBtn.disabled =
          true;


        submitBtn.classList.add(
          "is-loading"
        );
      }


      if (globalError) {

        globalError.classList.add(
          "hidden"
        );
      }


      showProcessingOverlay();


      try {

        // ---------------------------------------------
        // CREATE APPLICATION PAYLOAD
        // ---------------------------------------------

        const payload =
          formToObject();


        payload.submittedAtClient =
          new Date()
            .toISOString();


        payload.pageUrl =
          window.location.href;


        payload.userAgent =
          navigator.userAgent;


        payload.language =
          navigator.language ||
          "";


        // ---------------------------------------------
        // RESUME
        // ---------------------------------------------

        const resumeFile =
          resumeInput &&
          resumeInput.files
            ? resumeInput.files[0]
            : null;


        payload.resume =
          await fileToBase64(
            resumeFile
          );


        // ---------------------------------------------
        // START GOOGLE SUBMISSION
        // ---------------------------------------------

        const sendRequest =
          fetch(
            CONFIG.APPS_SCRIPT_URL,
            {
              method:
                "POST",

              mode:
                "no-cors",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );


        // ---------------------------------------------
        // RUN VISUAL PROCESSING + NETWORK REQUEST
        // ---------------------------------------------

        await Promise.all([
          sendRequest,
          runProcessingSequence()
        ]);


        // ---------------------------------------------
        // CLOSE PROCESSING SCREEN
        // ---------------------------------------------

        hideProcessingOverlay();


        // ---------------------------------------------
        // SHOW FINAL SUCCESS SCREEN
        // ---------------------------------------------

        if (successScreen) {

          successScreen.classList.remove(
            "hidden"
          );


          document.body.style.overflow =
            "hidden";
        }


        // ---------------------------------------------
        // RESET FORM
        // ---------------------------------------------

        form.reset();


        currentStep =
          1;


        setToday();


        updateUI();


        // Reset conditional sections

        setupConditional(
          "hasExperience",
          "Yes",
          "experiencePanel"
        );


        setupConditional(
          "hasCertification",
          "Yes",
          "certificationPanel"
        );


        setupConditional(
          "workedBurgerFactory",
          "Yes",
          "previousLocationWrap"
        );


        setupConditional(
          "hearAbout",
          "Employee referral",
          "referralNameWrap"
        );


        if (
          otherPositionWrap
        ) {

          otherPositionWrap.classList.add(
            "hidden"
          );
        }


        // Reset resume message

        if (fileStatus) {

          fileStatus.textContent =
            "No file selected";


          fileStatus.style.color =
            "";
        }


      } catch (error) {

        console.error(
          "Application submission error:",
          error
        );


        hideProcessingOverlay();


        if (globalError) {

          globalError.textContent =
            "We could not send your application. Please check your internet connection and try again.";


          globalError.classList.remove(
            "hidden"
          );


          globalError.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });
        }


      } finally {

        if (submitBtn) {

          submitBtn.disabled =
            false;


          submitBtn.classList.remove(
            "is-loading"
          );
        }
      }
    }
  );


  // ---------------------------------------------------------
  // CLOSE SUCCESS SCREEN
  // ---------------------------------------------------------

  if (closeSuccess) {

    closeSuccess.addEventListener(
      "click",
      function () {

        if (successScreen) {

          successScreen.classList.add(
            "hidden"
          );
        }


        document.body.style.overflow =
          "";


        const applicationCard =
          document.querySelector(
            ".application-card"
          );


        if (applicationCard) {

          applicationCard.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
        }
      }
    );
  }


  // ---------------------------------------------------------
  // ESCAPE KEY SAFETY
  // DON'T CLOSE PROCESSING SCREEN DURING SUBMISSION
  // ---------------------------------------------------------

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        if (
          successScreen &&
          !successScreen.classList.contains(
            "hidden"
          )
        ) {

          successScreen.classList.add(
            "hidden"
          );


          document.body.style.overflow =
            "";
        }
      }
    }
  );


  // ---------------------------------------------------------
  // INITIALIZE APPLICATION
  // ---------------------------------------------------------

  updateUI();

});
