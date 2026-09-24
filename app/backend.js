// Data layer shared by the student page and the presenter page.
//
// Firestore layout
//   live/state                                  current session (written by instructor)
//   runs/{runId}/questions/{qid}/answers/{uid}   one answer per student per question

import { firebaseConfig } from "../firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
export const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE");

export async function connect() {
  return DEMO ? demoBackend() : firebaseBackend();
}

async function firebaseBackend() {
  const [appSdk, fs, au] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
    import(`${SDK}/firebase-auth.js`),
  ]);
  const app = appSdk.initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  const auth = au.getAuth(app);

  // Wait for any saved sign-in to load before deciding who this is.
  await new Promise((resolve) => {
    const stop = au.onAuthStateChanged(auth, () => { stop(); resolve(); });
  });

  const stateRef = fs.doc(db, "live", "state");
  const answersCol = (runId, qid) =>
    fs.collection(db, "runs", runId, "questions", qid, "answers");

  return {
    mode: "firebase",

    async signInStudent() {
      if (!auth.currentUser) await au.signInAnonymously(auth);
      return auth.currentUser.uid;
    },

    isInstructorSignedIn() {
      return !!auth.currentUser && !auth.currentUser.isAnonymous;
    },

    async signInInstructor() {
      await au.signInWithPopup(auth, new au.GoogleAuthProvider());
      return auth.currentUser;
    },

    async signOut() {
      await au.signOut(auth);
    },

    watchState(cb, onError) {
      return fs.onSnapshot(stateRef, (snap) => cb(snap.exists() ? snap.data() : null), onError);
    },

    setState(state) {
      return fs.setDoc(stateRef, state);
    },

    submit(runId, qid, answer) {
      const ref = fs.doc(answersCol(runId, qid), auth.currentUser.uid);
      return fs.setDoc(ref, { answer, ts: fs.serverTimestamp() });
    },

    watchAnswers(runId, qid, cb, onError) {
      return fs.onSnapshot(
        answersCol(runId, qid),
        (snap) => cb(snap.docs.map((d) => d.data().answer)),
        onError,
      );
    },
  };
}

// Demo mode: localStorage only, so tabs in one browser stay in sync.
// Other tabs hear about changes through the "storage" event; this tab calls
// its own listeners directly. Each answer gets its own key so tabs never
// overwrite each other.
function demoBackend() {
  const ANS = "lp-demo-a:";
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());
  window.addEventListener("storage", notify);

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const listen = (fn) => { listeners.add(fn); fn(); return () => listeners.delete(fn); };
  const answerKeys = (prefix) =>
    Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .filter((k) => k && k.startsWith(prefix));

  let uid = sessionStorage.getItem("lp-demo-uid");
  if (!uid) {
    uid = "demo-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("lp-demo-uid", uid);
  }

  const denied = () => Object.assign(new Error("Responses are closed"), { code: "permission-denied" });

  return {
    mode: "demo",
    async signInStudent() { return uid; },
    isInstructorSignedIn() { return true; },
    async signInInstructor() { return { email: "demo" }; },
    async signOut() {},

    watchState(cb) {
      return listen(() => cb(read("lp-demo-state", null)));
    },

    async setState(state) {
      const prev = read("lp-demo-state", null);
      if (prev && prev.runId !== state.runId) {
        answerKeys(ANS).forEach((k) => localStorage.removeItem(k));
      }
      write("lp-demo-state", state);
      notify();
    },

    async submit(runId, qid, answer) {
      const s = read("lp-demo-state", null);
      if (!s || !s.open || s.runId !== runId || s.question?.id !== qid) throw denied();
      write(`${ANS}${runId}/${qid}/${uid}`, answer);
      notify();
    },

    watchAnswers(runId, qid, cb) {
      const prefix = `${ANS}${runId}/${qid}/`;
      return listen(() => cb(answerKeys(prefix).map((k) => read(k, null)).filter((a) => a !== null)));
    },
  };
}
