# Reyed v9 — Admin-controlled two-phone demo

No payment processing is included. The admin can set one external button/link shown on the rider page.

Admin controls:
- app name and announcement
- external link label and URL
- support contact information
- pause/resume new ride requests
- create, edit, assign, change status, or delete rides
- create, edit, change role/password, or delete users
- edit pickup, drop-off, driver, rider, and display offer

Use the same Google Apps Script setup from `SETUP-GOOGLE-SYNC.md`. Replace the deployed Apps Script code with the included `Code.gs`, redeploy, and paste the `/exec` URL into `google-sync-config.js`.

Admin login: admin@reyed.demo / admin123
