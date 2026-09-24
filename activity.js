// Edit this file to change the questions students see.
//
// Question types
//   "choice"  students tap one option; results show as bars
//   "text"    students type a short answer; results show as a word cloud
//   "pin"     students tap a map; results show as dots on a map
//
// Every question needs a unique id. Answers are stored under that id, so
// change the id if you rewrite a question and don't want old answers mixed in.

export const activity = {
  title: "Live poll",
  questions: [
    {
      id: "projection",
      type: "choice",
      prompt: "Which world map projection do you see most often?",
      options: ["Mercator", "Robinson", "Equal Earth", "Not sure"],
    },
    {
      id: "trust-word",
      type: "text",
      prompt: "In one word: what makes a map trustworthy?",
    },
    {
      id: "hometown",
      type: "pin",
      prompt: "Tap the map roughly where you grew up.",
      center: [38, -96], // [latitude, longitude] the map opens on
      zoom: 3,
    },
  ],
};
