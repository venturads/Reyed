# RideNow

A simple Uber-style front-end prototype built with plain HTML, CSS, and JavaScript.

## Features

- Pickup and destination entry
- Economy, Comfort, and XL ride types
- Fare and travel-time estimate
- Simulated driver matching
- Ride status flow
- Cancel and complete ride buttons
- Ride history saved in localStorage
- Mobile-friendly design
- Basic PWA support

## Run locally

Open `index.html` in a browser.

For full PWA/service-worker support, use a local web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root`.
6. Save.

## Important

This is a prototype. It does not include real maps, GPS, driver dispatch, authentication, payments, or a backend.
