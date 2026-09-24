// Edit this file to change the questions students see.
//
// Question types
//   "choice"  students tap one option; results show as bars
//   "text"    students type a short answer; results show as a word cloud
//   "pin"     students tap a map; results show as dots on a map
//
// Every question needs a unique id. Answers are stored under that id, so
// change the id if you rewrite a question and don't want old answers mixed in.

js
export const activity = {
  title: "AI check-in",
  questions: [
    {
      id: "ai-use",
      type: "choice",
      prompt: "How often do you use AI tools like ChatGPT, Claude, or Gemini?",
      options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
    },
    {
      id: "ai-attitude",
      type: "text",
      prompt: "In one word, how do you feel about AI?",
    },
  ],
};
