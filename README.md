# Burger Factory House – Atlanta Employment Application

A custom, mobile-first hiring microsite designed for GitHub Pages.

## What is included

- `index.html` — public employment application
- `styles.css` — responsive premium restaurant styling
- `app.js` — multi-step form, validation, conditional fields, resume encoding, backend submission
- `google-apps-script/Code.gs` — private Google Apps Script backend
- `.nojekyll` — tells GitHub Pages to serve the static files directly

## Architecture

**Applicant browser → GitHub Pages → Google Apps Script → Google Sheets + Google Drive + email notification**

GitHub Pages contains only the public website code. Applicant submissions and resumes are stored privately in the restaurant owner's Google account, not in GitHub.

---

# PART 1 — Set up the Google backend

## 1. Create the Apps Script project

1. Sign into the Google account that should own the applications.
2. Go to https://script.google.com/
3. Click **New project**.
4. Name it `Burger Factory House Atlanta Hiring`.
5. Delete the starter code.
6. Open `google-apps-script/Code.gs` from this package and paste the entire file into the Apps Script editor.

## 2. Set the notification email

At the top of `Code.gs`, replace:

```js
NOTIFICATION_EMAIL: 'YOUR_EMAIL@example.com',
```

with the email address that should receive new-application alerts.

## 3. Initialize the private storage

1. In the function dropdown at the top of Apps Script, select `setupApplicationSystem`.
2. Click **Run**.
3. Google will ask for authorization. Approve the permissions for the account that owns the hiring system.
4. The script creates:
   - a Google Sheet named **Burger Factory House – Atlanta Job Applications**
   - a private Google Drive folder named **Burger Factory House – Atlanta Resumes**
5. In Apps Script, open **Execution log** after the function runs. It prints links to both.

## 4. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Choose **Web app**.
3. Description: `Burger Factory House Employment Application API`.
4. **Execute as:** Me.
5. **Who has access:** Anyone.
6. Click **Deploy** and authorize if prompted.
7. Copy the URL ending in `/exec`.

Keep that URL. It is the form's private submission endpoint.

---

# PART 2 — Connect the website to the backend

Open `app.js` and find:

```js
APPS_SCRIPT_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
```

Replace the placeholder with your `/exec` URL, for example:

```js
APPS_SCRIPT_URL: "https://script.google.com/macros/s/ABC123.../exec",
```

Save the file.

---

# PART 3 — Put it on GitHub Pages

## Recommended simple setup

1. Sign in at https://github.com/ and click **New repository**.
2. Name the repository something clean, such as:
   - `burger-factory-atlanta-jobs`
   - `burger-factory-house-atlanta`
3. For GitHub Free, make it **Public** so GitHub Pages can publish it.
4. Create the repository.
5. Click **Add file → Upload files**.
6. Upload these files/folders from this package:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `.nojekyll`
   - optionally `README.md`

   You do **not** need to upload the `google-apps-script` folder to the public website repository. It contains backend source code and setup instructions only.

7. Commit the files to the `main` branch.
8. Open **Settings → Pages**.
9. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
10. Click **Save**.

Your site will normally be available at:

`https://YOUR-GITHUB-USERNAME.github.io/burger-factory-atlanta-jobs/`

If the repository itself is named `YOUR-GITHUB-USERNAME.github.io`, then the site can be:

`https://YOUR-GITHUB-USERNAME.github.io/`

## About the GitHub name in the URL

GitHub Pages hosting is free, but a free Pages URL contains `github.io`. To remove GitHub from the URL completely, use a custom domain later. A domain is optional; traditional paid web hosting is not required.

---

# PART 4 — Test before sharing

Submit one test application yourself and confirm all three of these happen:

1. A new row appears in the Google Sheet.
2. If you uploaded a résumé, it appears in the private Drive folder.
3. The hiring email address receives the notification.

Only after those tests pass should the public link be shared with applicants.

---

# Recommended production improvements

Before public launch, customize these items:

- Add the restaurant's authorized logo or official brand artwork.
- Add the exact Atlanta location or location selector if there is more than one Atlanta location.
- Replace generic footer wording with the franchisee/legal business name if required.
- Confirm the application questions with the restaurant's employment counsel/HR advisor for Georgia and local Atlanta requirements.
- Use a dedicated hiring email account rather than a personal address.
- Limit Google Sheet/Drive access to the owner and authorized hiring managers.
- Periodically remove applications according to the company's records-retention policy.

## Security notes

- Never put applicant data directly into GitHub files.
- Never commit passwords, Google credentials, OAuth tokens, or private API secrets.
- The Apps Script endpoint is intentionally a submission endpoint; Google account permissions protect the Sheet and Drive storage.
- The front end includes a basic honeypot. If spam becomes an issue, add a stronger anti-bot service or challenge.
- Résumé uploads are capped at 4 MB in both the browser and backend.
