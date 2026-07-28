SONG TEPPANYAKI COMPLETE WEBSITE
================================

IMPORTANT: Back up your current project before replacing files.

1. Extract this ZIP.
2. Copy all extracted files into:
   C:\Projects\songsteppanyaki
3. When Windows asks, choose Replace the files in the destination.
4. Open Command Prompt in the project folder.
5. Run:
   npm install
6. Create .env.local by copying .env.local.example.
7. Add your Google API credentials.
8. Run:
   npm run dev
9. Open:
   http://localhost:3000

GOOGLE MAPS
-----------
Enable Routes API in Google Cloud and place its API key in:
GOOGLE_MAPS_API_KEY

GOOGLE CALENDAR
---------------
1. Enable Google Calendar API.
2. Create a service account.
3. Create and download a JSON key.
4. Copy client_email to GOOGLE_SERVICE_ACCOUNT_EMAIL.
5. Copy private_key to GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.
6. In Google Calendar settings, share the target calendar with the service-account email.
7. Give permission: Make changes to events.
8. Copy the target calendar ID to GOOGLE_CALENDAR_ID.

VERCEL
------
Add the same four environment variables in:
Vercel > Project > Settings > Environment Variables

Then redeploy.

DEPLOY
------
git add .
git commit -m "Install complete Song Teppanyaki booking website"
git push origin main
