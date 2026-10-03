// ============================================================
// BURGER FACTORY HOUSE – ATLANTA
// Employment Application
// GitHub Pages Frontend
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  // ----------------------------------------------------------
  // CONFIGURATION
  // ----------------------------------------------------------

  const CONFIG = {
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbzkFz0d45qJmCUq2JSI_vzxvaofEXUyzGplw3498jBGlnwvm32OsXvlvX3T8dJ0meyk4Q/exec",

    MAX_RESUME_BYTES: 4 * 1024 * 1024
  };


  // ----------------------------------------------------------
  // MAIN ELEMENTS
  // ----------------------------------------------------------

  const form = document.getElementById("jobApplication");

  const steps = Array.from(
    document.querySelectorAll(".form-step")
  );

  const navItems = Array.from(
    document.querySelectorAll(".step-nav__item")
  );

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  const progressBar = document.getElementById("progressBar");
  const progressStep = document.getElementById("progressStep");

  const globalError = document.getElementById("globalError");

  const successScreen = document.getElementById("successScreen");
  const closeSuccess = document.getElementById("closeSuccess");

  const resumeInput = document.getElementById("resume");
  const fileStatus = document.getElementById("fileStatus");

  let currentStep = 1;


  // ----------------------------------------------------------
  // SAFETY CHECK
  // ----------------------------------------------------------

  if (!form) {
    console.error("Burger Factory application form was not found.");
    return;
  }


  // ----------------------------------------------------------
  // DATE + COPYRIGHT
  // ----------------------------------------------------------

  function setToday() {

    const now = new Date();

    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const signatureDate =
      document.getElementById("signatureDate");

    const year =
      document.getElementById("year");

    if (signatureDate) {
      signatureDate.value = localDate;
    }

    if (year) {
      year.textContent = now.getFullYear();
    }
  }

  setToday();


  // ----------------------------------------------------------
  // DISPLAY STEP
  // ----------------------------------------------------------

  function updateUI() {

    steps.forEach(function (step) {

      const stepNumber =
        Number(step.getAttribute("data-step"));

      if (stepNumber === currentStep) {
        step.classList.add("is-active");
      } else {
        step.classList.remove("is-active");
      }
    });


    navItems.forEach(function (item, index) {

      const number = index + 1;

      item.classList.toggle(
        "is-active",
        number === currentStep
      );

      item.classList.toggle(
        "is-complete",
        number < currentStep
      );
    });


    if (progressStep) {
      progressStep.textContent =
        "Step " + currentStep;
    }


    if (progressBar) {
      progressBar.style.width =
        currentStep * 20 + "%";
    }


    if (prevBtn) {

      if (currentStep === 1) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }


    if (nextBtn) {

      if (currentStep === 5) {
        nextBtn.classList.add("hidden");
      } else {
        nextBtn.classList.remove("hidden");
      }
    }


    if (submitBtn) {

      if (currentStep === 5) {
        submitBtn.classList.remove("hidden");
      } else {
        submitBtn.classList.add("hidden");
      }
    }


    if (globalError) {
      globalError.classList.add("hidden");
    }


    const applicationCard =
      document.querySelector(".application-card");

    if (applicationCard) {

      const top =
        applicationCard.getBoundingClientRect().top +
        window.pageYOffset -
        15;

      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    }
  }


  // ----------------------------------------------------------
  // CONDITIONAL FIELDS
  // ----------------------------------------------------------

  function setupConditional(
    inputId,
    requiredValue,
    panelId
  ) {

    const input =
      document.getElementById(inputId);

    const panel =
      document.getElementById(panelId);

    if (!input || !panel) {
      return;
    }


    function sync() {

      if (input.value === requiredValue) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
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


  // ----------------------------------------------------------
  // OTHER POSITION FIELD
  // ----------------------------------------------------------

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

    otherPositionCheckbox.addEventListener(
      "change",
      function () {

        if (otherPositionCheckbox.checked) {

          otherPositionWrap.classList.remove(
            "hidden"
          );

        } else {

          otherPositionWrap.classList.add(
            "hidden"
          );
        }
      }
    );
  }


  // ----------------------------------------------------------
  // CLEAR FIELD ERROR WHEN USER FIXES IT
  // ----------------------------------------------------------

  form.addEventListener(
    "input",
    function (event) {

      const field = event.target;

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

      const field = event.target;

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


  // ----------------------------------------------------------
  // VALIDATE ONE STEP
  // ----------------------------------------------------------

  function validateStep(stepNumber) {

    const step =
      document.querySelector(
        '.form-step[data-step="' +
        stepNumber +
        '"]'
      );


    if (!step) {
      return true;
    }


    let valid = true;
    let firstInvalid = null;


    // --------------------------------------------------------
    // TEXT / SELECT / TEXTAREA / CHECKBOX
    // --------------------------------------------------------

    const requiredFields =
      Array.from(
        step.querySelectorAll(
          "[required]"
        )
      );


    const radioGroupsChecked = {};


    requiredFields.forEach(
      function (field) {

        let fieldValid = true;


        // RADIO BUTTON GROUP

        if (
          field.type === "radio"
        ) {

          const name =
            field.getAttribute("name");

          if (
            !radioGroupsChecked[name]
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
                  return radio.checked;
                }
              );

            radioGroupsChecked[name] =
              true;


            group.forEach(
              function (radio) {

                radio.classList.toggle(
                  "invalid",
                  !fieldValid
                );
              }
            );
          }


        // REQUIRED CHECKBOX

        } else if (
          field.type === "checkbox"
        ) {

          fieldValid =
            field.checked;


        // EVERYTHING ELSE

        } else {

          fieldValid =
            field.checkValidity();
        }


        if (!fieldValid) {

          valid = false;

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


    // --------------------------------------------------------
    // POSITION SELECTION
    // --------------------------------------------------------

    if (stepNumber === 2) {

      const positions =
        Array.from(
          step.querySelectorAll(
            'input[name="positions"]'
          )
        );


      const positionSelected =
        positions.some(
          function (position) {
            return position.checked;
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


      if (!positionSelected) {

        valid = false;


        if (
          !firstInvalid &&
          positions.length
        ) {

          firstInvalid =
            positions[0];
        }
      }
    }


    // --------------------------------------------------------
    // ERROR MESSAGE
    // --------------------------------------------------------

    if (!valid) {

      if (globalError) {

        globalError.textContent =
          "Please complete all required fields before continuing.";

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

              firstInvalid.focus();
            }

          },
          300
        );
      }
    }


    return valid;
  }


  // ----------------------------------------------------------
  // CONTINUE BUTTON
  // ----------------------------------------------------------

  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        console.log(
          "Continue clicked. Current step:",
          currentStep
        );


        if (
          !validateStep(currentStep)
        ) {

          console.log(
            "Step validation failed."
          );

          return;
        }


        if (currentStep < 5) {

          currentStep =
            currentStep + 1;

          updateUI();
        }
      }
    );
  }


  // ----------------------------------------------------------
  // BACK BUTTON
  // ----------------------------------------------------------

  if (prevBtn) {

    prevBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        if (currentStep > 1) {

          currentStep =
            currentStep - 1;

          updateUI();
        }
      }
    );
  }


  // ----------------------------------------------------------
  // STEP NAVIGATION
  // Only allow applicant to go BACK
  // ----------------------------------------------------------

  navItems.forEach(
    function (item, index) {

      item.addEventListener(
        "click",
        function () {

          const targetStep =
            index + 1;


          if (
            targetStep < currentStep
          ) {

            currentStep =
              targetStep;

            updateUI();
          }
        }
      );
    }
  );


  // ----------------------------------------------------------
  // RESUME UPLOAD
  // ----------------------------------------------------------

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

          resumeInput.value = "";

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

          resumeInput.value = "";

          fileStatus.textContent =
            "File is too large. Maximum size is 4 MB.";

          fileStatus.style.color =
            "#b42318";

          return;
        }


        fileStatus.style.color = "";


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


  // ----------------------------------------------------------
  // FILE TO BASE64
  // ----------------------------------------------------------

  function fileToBase64(file) {

    return new Promise(
      function (resolve, reject) {

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
              name: file.name,
              type:
                file.type ||
                "application/octet-stream",
              size: file.size,
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


  // ----------------------------------------------------------
  // FORM DATA TO OBJECT
  // ----------------------------------------------------------

  function formToObject() {

    const formData =
      new FormData(form);

    const data = {};


    formData.forEach(
      function (value, key) {

        if (
          key === "resume"
        ) {
          return;
        }


        if (
          key === "positions"
        ) {

          if (
            !Array.isArray(
              data.positions
            )
          ) {

            data.positions = [];
          }


          data.positions.push(
            value
          );

        } else {

          data[key] = value;
        }
      }
    );


    return data;
  }


  // ----------------------------------------------------------
  // SUBMIT APPLICATION
  // ----------------------------------------------------------

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (
        !validateStep(5)
      ) {

        return;
      }


      // Spam honeypot
      const honeypot =
        form.querySelector(
          'input[name="website"]'
        );


      if (
        honeypot &&
        honeypot.value.trim() !== ""
      ) {

        return;
      }


      if (
        !CONFIG.APPS_SCRIPT_URL ||
        !CONFIG.APPS_SCRIPT_URL.startsWith(
          "https://script.google.com/"
        )
      ) {

        if (globalError) {

          globalError.textContent =
            "Application system is temporarily unavailable. Please contact the restaurant.";

          globalError.classList.remove(
            "hidden"
          );
        }

        return;
      }


      if (submitBtn) {

        submitBtn.disabled = true;

        submitBtn.classList.add(
          "is-loading"
        );
      }


      if (globalError) {
        globalError.classList.add(
          "hidden"
        );
      }


      try {

        const payload =
          formToObject();


        payload.submittedAtClient =
          new Date().toISOString();


        payload.pageUrl =
          window.location.href;


        const resumeFile =
          resumeInput &&
          resumeInput.files
            ? resumeInput.files[0]
            : null;


        payload.resume =
          await fileToBase64(
            resumeFile
          );


        // Google Apps Script submission
        await fetch(
          CONFIG.APPS_SCRIPT_URL,
          {
            method: "POST",

            mode: "no-cors",

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


        // Show success window
        if (successScreen) {

          successScreen.classList.remove(
            "hidden"
          );

          document.body.style.overflow =
            "hidden";
        }


        form.reset();

        currentStep = 1;

        setToday();

        updateUI();


        if (fileStatus) {

          fileStatus.textContent =
            "No file selected";

          fileStatus.style.color =
            "";
        }


      } catch (error) {

        console.error(
          "Submission error:",
          error
        );


        if (globalError) {

          globalError.textContent =
            "We could not send your application. Please check your internet connection and try again.";

          globalError.classList.remove(
            "hidden"
          );
        }


      } finally {

        if (submitBtn) {

          submitBtn.disabled = false;

          submitBtn.classList.remove(
            "is-loading"
          );
        }
      }
    }
  );


  // ----------------------------------------------------------
  // CLOSE SUCCESS WINDOW
  // ----------------------------------------------------------

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
      }
    );
  }


  // ----------------------------------------------------------
  // START FORM
  // ----------------------------------------------------------

  updateUI();

});
