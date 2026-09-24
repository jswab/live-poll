# Live poll

Students scan a QR code, answer on their phones, and results update live on the projector.
Hosted on GitHub Pages, with Firebase (free plan) relaying the answers.

- `index.html` is the student page. The QR code points here.
- `present.html` is your projector page: QR code, controls, live results.
- `activity.js` holds the questions. This is the file you'll edit most.

Question types: `choice` (bar chart), `text` (word cloud), `pin` (dots on a map).

## 1. Try it on your computer first (optional, 2 minutes)

The site runs in demo mode until you add Firebase settings. Demo mode only syncs tabs in one browser,
so phones won't connect yet, but you can see how everything works.

```
cd live-poll
python3 -m http.server 8000
```

Open `http://localhost:8000/present.html`, click **Start session**, then open `http://localhost:8000/`
in a couple of other tabs and answer.

## 2. Set up Firebase (one time, about 10 minutes)

1. Go to https://console.firebase.google.com and **Create a project** (Analytics isn't needed).
2. On the project home page, click the **Web** icon (`</>`) to add a web app. Copy the
   `firebaseConfig` values it shows into `firebase-config.js`.
3. **Build > Authentication > Get started**. Under **Sign-in method**, enable:
   - **Anonymous** (students; no login for them)
   - **Google** (you, on the presenter page; pick a support email when asked)
4. Still in Authentication: **Settings > Authorized domains > Add domain** and add
   `YOUR-GITHUB-USERNAME.github.io`.
5. **Build > Firestore Database > Create database**. Pick a US location and start in
   **production mode**.
6. Open the **Rules** tab, paste in the contents of `firestore.rules`, replace
   `YOUR_GOOGLE_EMAIL@gmail.com` with the Google account you'll use on the presenter page,
   and click **Publish**.

The rules make sure only your account can change questions or see answers, each student
gets one answer per question, and answers are only accepted while a question is open.

## 3. Put it on GitHub Pages

1. Create a new repository (for example `live-poll`) and upload everything in this folder,
   keeping the `app` and `vendor` folders.
2. **Settings > Pages**: under *Build and deployment*, choose **Deploy from a branch**,
   branch `main`, folder `/ (root)`, and save.
3. After a minute or two the site is live at `https://YOUR-GITHUB-USERNAME.github.io/live-poll/`.

## 4. In class

1. Open `https://YOUR-GITHUB-USERNAME.github.io/live-poll/present.html` on the classroom computer.
2. Sign in with Google, then click **Start session**.
3. Press **Q** to show a full-screen QR code while students join; press it again to go back.
4. Move through questions with the arrow keys or a presentation clicker.

| Key | Action |
| --- | --- |
| → or Page Down | Next question |
| ← or Page Up | Previous question |
| O | Close or reopen responses |
| R | Hide or show results (good for collecting answers before revealing them) |
| Q | Full-screen QR code |

Click a word in a word cloud to hide it from the screen. **Start fresh** clears the results for a new
class; earlier answers stay in Firestore if you want them later.

## Editing questions

Change `activity.js` and upload it to GitHub. GitHub Pages can take a minute or two to update,
so do this before class, then reload `present.html`. Give each question a unique `id`.

## Good to know

- Free GitHub Pages sites come from public repositories, so anyone who finds the repo can read
  the questions in `activity.js`. Students on the phone page only ever see the current question.
- The Firebase free plan allows 20,000 answers and 50,000 reads a day, far more than a class uses.
- The values in `firebase-config.js` are meant to be public; `firestore.rules` is what protects the data.
- To browse raw answers, open Firestore Database in the Firebase console: `runs > (session) > questions > (question) > answers`.
