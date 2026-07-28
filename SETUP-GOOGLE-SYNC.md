# Reyed two-phone setup — no Firebase

This version uses a tiny Google Apps Script web app as the shared database. The Reyed website stays on GitHub Pages.

## 1. Create the Google sync endpoint

1. Go to **script.google.com** and choose **New project**.
2. Delete the example code.
3. Open the `Code.gs` file included in this ZIP.
4. Copy all of its code into the Google Apps Script editor.
5. Press **Save** and name the project `Reyed Sync`.

## 2. Deploy it

1. Press **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as** to `Me`.
4. Set **Who has access** to `Anyone`.
5. Press **Deploy** and approve Google's permission screen.
6. Copy the Web App URL. It ends with `/exec`.

Do not use the temporary `/dev` testing URL.

## 3. Connect Reyed

1. Open `google-sync-config.js`.
2. Replace:

```js
endpoint: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

with your copied `/exec` URL.

3. Keep the same `room` value on both phones.
4. Upload every Reyed file to the root of your GitHub repository.

## 4. Test two phones

- Phone 1: sign in as `rider@reyed.demo` / `rider123` and request a ride.
- Phone 2: sign in as `driver@reyed.demo` / `driver123`.
- The request should appear in Available Rides within about 2 seconds.
- Accept, Arrived, Picked Up, and Dropped Off changes should appear on the rider phone automatically.

## Notes

- The status bubble should say **Two-phone Google sync connected**.
- This is a practical demo workaround, not production-grade security.
- Anyone with the endpoint and room name could access the demo data. Do not store real payment details, passwords, medical information, or private customer data.
- To start a separate demo database, change the room name in `google-sync-config.js`.
