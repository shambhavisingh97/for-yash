// ============================================
// CUSTOMIZE EVERYTHING HERE FOR YOUR PARTNER
// ============================================

const CONFIG = {
  // Password to view the site (only someone with this can see the content)
  // Set a word/phrase only Yash knows, or one you'll send him separately (e.g. "VNIT2016" or "OurAnniversary")
  accessPassword: "",

  // Names (used in quiz and messages)
  yourName: "Aashi",
  theirName: "Yash",

  // Photo gallery: add your trip photos
  // Put image files in the "photos" folder, then list filenames here:
  galleryImages: [
    "trip1.jpg",
    "trip2.jpg",
    "trip3.jpg",
    "trip4.jpg",
    "trip5.jpg",
    "trip6.jpg",
  ],
  // If you don't have photos yet, leave as is — placeholder images will show.
  // When you add photos, name them trip1.jpg, trip2.jpg, etc. (or update the names above).

  // Quiz: "How well do you know us?" — personalized for Yash & your journey
  quizQuestions: [
    {
      question: "Where did we meet on our first anniversary?",
      options: ["Mumbai", "Nagpur", "Navi Mumbai", "Couldnt meet :("],
      correct: 1,
    },
    {
      question: "How many countries have we visited together except India?",
      options: ["5", "6", "7", "8"],
      correct: 2,
    },
  ],

  // Optional: use your own photos for the memory game (pairs)
  // Add 4–8 image paths for 2–4 pairs. If empty, the game uses emojis below.
  memoryImages: [], // e.g. ["photo1.jpg", "photo1.jpg", "photo2.jpg", "photo2.jpg"]

  // Memory match emojis (need at least 8 for 8 pairs). All Valentine's themed.
  memoryEmojis: ["💕", "❤️", "💝", "💖", "🌹", "💐", "🌷", "💌", "💘", "🫶", "💗", "💓", "💞", "😘", "🎀", "🍫", "🩷"],

  // Sweet letter (shown when they click the envelope at the end)
  letterContent: `To Yash,

Ten years of you — and I still made you a whole website. (You're welcome.)

Thank you for the small moments, the big dreams, and everything in between that led us here. Here's to many more years of us.

Love,
Aashi 💕`,
};
