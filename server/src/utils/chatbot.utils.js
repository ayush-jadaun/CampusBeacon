// nlp/languageProcessor.js
import { NlpManager } from "node-nlp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Mutex } from "async-mutex"; // Import Mutex
import config from "../config/chatbot.js";

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_FILE = config.modelPath;
const CORPUS_FILE = config.corpusPath;
const fileMutex = new Mutex(); // Create a Mutex for file operations

// Ensure the directory for the model exists
const modelDir = path.dirname(MODEL_FILE);
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}
// Ensure the directory for the corpus exists
const corpusDir = path.dirname(CORPUS_FILE);
if (!fs.existsSync(corpusDir)) {
  fs.mkdirSync(corpusDir, { recursive: true });
}

// --- Confidence Levels --- (from config)
const HIGH_CONFIDENCE = config.confidenceLevels.HIGH;
const MEDIUM_CONFIDENCE = config.confidenceLevels.MEDIUM;
const LOW_CONFIDENCE = config.confidenceLevels.LOW;
const SUGGESTION_THRESHOLD = config.confidenceLevels.SUGGESTION;

// --- NLP Manager Initialization ---
const manager = new NlpManager({
  languages: config.nlpConfig.languages || ["en"],
  forceNER: true,
  nlu: { log: config.nlpConfig.log },
  modelFileName: MODEL_FILE, // Used by manager internally if needed, but we manage load/save
  threshold: config.nlpConfig.threshold, // Set manager's base threshold
  autoSave: false, // Explicit saving
  autoLoad: false, // Explicit loading
  // Consider enabling 'useNeural' based on performance needs and environment setup
  // useNeural: true,
});

class AdvancedLanguageProcessor {
  constructor() {
    this.corpus = null; // Loaded asynchronously
    this.contextMemory = new Map(); // Session-based context
    this.entityPatterns = this.initializeEntityPatterns();
    this.synonyms = this.initializeSynonyms();
    this.sentimentCache = new Map(); // Cache sentiment analysis results
    this.phraseVectorsCache = new Map(); // Cache computed phrase vectors
    this.isModelTrained = false; // Track if model is trained in current session
  }

  // --- Initialization ---
  async initialize() {
    this.corpus = await this.loadCorpus(); // Load corpus first
    await this.loadOrTrainModel(); // Then load or train the model
  }

  async loadCorpus() {
    console.log(`Attempting to load corpus from: ${CORPUS_FILE}`);
    try {
      if (!fs.existsSync(CORPUS_FILE)) {
        console.warn(
          `Corpus file not found at ${CORPUS_FILE}. Creating with default data.`
        );
        const defaultCorpus = this.getDefaultCorpus();
        await fs.promises.writeFile(
          CORPUS_FILE,
          JSON.stringify(defaultCorpus, null, 2),
          "utf8"
        );
        return defaultCorpus;
      }

      const corpusData = await fs.promises.readFile(CORPUS_FILE, "utf8");
      const corpus = JSON.parse(corpusData);

      // Basic validation and cleanup
      if (!corpus || !Array.isArray(corpus.phrases)) {
        console.warn(
          `Corpus file at ${CORPUS_FILE} is invalid. Using default corpus.`
        );
        return this.getDefaultCorpus();
      }

      corpus.phrases = corpus.phrases
        .filter(
          (phrase) =>
            phrase &&
            phrase.question &&
            typeof phrase.question === "string" && // Ensure question is string
            phrase.answer &&
            typeof phrase.answer === "string" && // Ensure answer is string
            phrase.category
        )
        .map((phrase) => ({
          ...phrase,
          // Store lowercase version for matching, keep original for display/use
          lowercaseQuestion: phrase.question.toLowerCase(),
        }));

      console.log(
        `Corpus loaded successfully with ${corpus.phrases.length} phrases.`
      );
      return corpus;
    } catch (error) {
      console.error("Error loading corpus file:", error);
      console.warn("Using default corpus due to error.");
      return this.getDefaultCorpus();
    }
  }

  getDefaultCorpus() {
    // Provides a basic corpus if the file is missing or invalid
    // (Keep your extensive default list here as in the original)
    return {
        phrases: [
          // === GREETINGS & CASUAL ===
          {
            question: "hello",
            answer:
              "Hello there! Welcome to CampusBeacon. It's great to have you here. How can I assist you today?",
            category: "greetings",
          },
          {
            question: "hi",
            answer:
              "Hi! Glad you're here at CampusBeacon. How can I help you with our services?",
            category: "greetings",
          },
          {
            question: "hey",
            answer:
              "Hey! Thanks for stopping by CampusBeacon. Let me know what you're looking for!",
            category: "greetings",
          },
          {
            question: "good morning",
            answer:
              "Good morning! Hope you have a wonderful day on CampusBeacon!",
            category: "greetings",
          },
          {
            question: "good afternoon",
            answer:
              "Good afternoon! Welcome to CampusBeacon. How can I help you today?",
            category: "greetings",
          },
          {
            question: "good evening",
            answer:
              "Good evening! Feel free to explore CampusBeacon's features anytime.",
            category: "greetings",
          },
          {
            question: "how are you",
            answer:
              "I'm here to help! Thanks for asking. What can I do for you today on CampusBeacon?",
            category: "casual",
          },
          {
            question: "thank you",
            answer:
              "You're welcome! Let me know if you need anything else.",
            category: "casual",
          },
          {
            question: "thanks",
            answer:
              "Happy to help! Feel free to ask if you have more questions.",
            category: "casual",
          },
          {
            question: "bye",
            answer:
              "Goodbye! Come back anytime you need help with CampusBeacon.",
            category: "casual",
          },

          // === GENERAL INFORMATION ===
          {
            question: "What is CampusBeacon?",
            answer:
              "CampusBeacon is a comprehensive platform exclusively for MNNIT students. It connects the campus community with features like Lost & Found, Marketplace, Attendance Tracking, Mess Menu, Resources, Ride Sharing, Events, Clubs, Eateries, and Hostel Management. We make campus life easier and more connected!",
            category: "general",
          },
          {
            question: "Who can use CampusBeacon?",
            answer:
              "CampusBeacon is exclusively for MNNIT students. You need a valid @mnnit.ac.in email address to register and use the platform.",
            category: "general",
          },
          {
            question: "Is CampusBeacon free to use?",
            answer:
              "Yes! CampusBeacon is completely free for all MNNIT students. No hidden charges, no subscriptions.",
            category: "general",
          },
          {
            question: "What features does CampusBeacon have?",
            answer:
              "CampusBeacon offers 10 major features: Lost & Found, Marketplace, Attendance Tracker, Mess Menu, Resource Hub, Ride Sharing, Events, Clubs, Eateries, and Hostel Management. Plus authentication, chat, and profile management!",
            category: "general",
          },
          {
            question: "Is there a mobile app?",
            answer:
              "Yes! We have a React Native mobile app for both iOS and Android. It includes all features from the web version with beautiful UI, Redux state management, and offline support. Download it to stay connected on the go!",
            category: "general",
          },

          // === AUTHENTICATION & REGISTRATION ===
          {
            question: "How do I sign up for CampusBeacon?",
            answer:
              "Click 'Register' on the homepage, enter your MNNIT email (@mnnit.ac.in), create a password, and fill in your details. You'll receive a verification email to activate your account.",
            category: "registration",
          },
          {
            question: "Can I use my personal email?",
            answer:
              "No, CampusBeacon only accepts MNNIT email addresses (@mnnit.ac.in) to ensure the platform is exclusive to MNNIT students.",
            category: "registration",
          },
          {
            question: "I forgot my password",
            answer:
              "Click 'Forgot Password' on the login page, enter your MNNIT email, and you'll receive a password reset link. Follow the instructions to create a new password.",
            category: "registration",
          },
          {
            question: "Can I login with Google?",
            answer:
              "Yes! We support Google OAuth for quick login. However, your Google account must use your MNNIT email (@mnnit.ac.in).",
            category: "registration",
          },
          {
            question: "How do I verify my email?",
            answer:
              "After registration, check your MNNIT email inbox for a verification link. Click it to activate your account. If you don't see it, check your spam folder.",
            category: "registration",
          },

          // === LOST & FOUND ===
          {
            question: "How do I report a lost item?",
            answer:
              "Go to the Lost & Found section, click 'Report Lost Item', add photos, description, location where lost, date, and your contact info. Other students can help you find it!",
            category: "lost_found",
          },
          {
            question: "How do I report a found item?",
            answer:
              "In Lost & Found, click 'Report Found Item', upload photos of the item, describe it, mention where you found it, and provide your contact details so the owner can reach you.",
            category: "lost_found",
          },
          {
            question: "Can I search for my lost item?",
            answer:
              "Yes! Use the search bar and filters in Lost & Found to find items by category (phone, wallet, keys, etc.), location, date, or keywords in the description.",
            category: "lost_found",
          },
          {
            question: "What categories are available in Lost & Found?",
            answer:
              "We have categories like Electronics (phones, laptops), Documents (IDs, certificates), Accessories (bags, wallets, keys), Clothing, Books, and Others.",
            category: "lost_found",
          },
          {
            question: "How do I mark an item as found?",
            answer:
              "If you're the owner and someone found your item, go to your Lost & Found post and click 'Mark as Found'. This helps keep the listings up to date!",
            category: "lost_found",
          },

          // === MARKETPLACE ===
          {
            question: "How can I sell items on CampusBeacon?",
            answer:
              "Go to Marketplace, click 'Sell Item', upload photos, add title, description, price, condition (new/used), category, and your contact info. Your listing will be visible to all students!",
            category: "buy_sell",
          },
          {
            question: "How do I buy items from the marketplace?",
            answer:
              "Browse the Marketplace, use filters to find what you need, click on an item to see details, and contact the seller directly via WhatsApp or email to negotiate and arrange pickup.",
            category: "buy_sell",
          },
          {
            question: "What can I sell on the marketplace?",
            answer:
              "You can sell books, electronics, furniture, clothing, cycles, sports equipment, and more! Just make sure items are appropriate for a campus community.",
            category: "buy_sell",
          },
          {
            question: "How do I mark an item as sold?",
            answer:
              "Once you've sold your item, go to your listing in Marketplace and click 'Mark as Sold'. This removes it from active listings.",
            category: "buy_sell",
          },
          {
            question: "Can I negotiate prices?",
            answer:
              "Absolutely! Contact the seller directly and negotiate a fair price. CampusBeacon facilitates the connection, but transactions are between students.",
            category: "buy_sell",
          },
          {
            question: "What are the marketplace categories?",
            answer:
              "We have Books, Electronics, Furniture, Clothing, Cycles, Sports Equipment, Stationery, and Others. Use category filters to find exactly what you need!",
            category: "buy_sell",
          },

          // === ATTENDANCE TRACKER ===
          {
            question: "How does attendance tracking work?",
            answer:
              "The Attendance section tracks your class attendance subject-wise. You can see overall percentage, subject-wise breakdown, color-coded warnings (red < 75%, yellow 75-85%, green > 85%), and forecasts.",
            category: "attendance",
          },
          {
            question: "How do I add attendance?",
            answer:
              "Go to Attendance, select a subject, and manually add attended/missed classes. The system calculates your percentage automatically.",
            category: "attendance",
          },
          {
            question: "What if my attendance is below 75%?",
            answer:
              "You'll see a red warning indicator. The system shows how many more classes you need to attend to reach the safe zone (75% or above).",
            category: "attendance",
          },
          {
            question: "Can I view attendance analytics?",
            answer:
              "Yes! View graphs showing attendance trends over time, subject-wise comparisons, and forecasts predicting your final attendance based on current patterns.",
            category: "attendance",
          },
          {
            question: "Does CampusBeacon sync with official attendance?",
            answer:
              "Currently, you manually enter your attendance. We're working on integrating with the official system for automatic syncing in future updates.",
            category: "attendance",
          },

          // === MESS MENU & HOSTEL ===
          {
            question: "How do I check the mess menu?",
            answer:
              "Go to Mess Menu, select your hostel (there are chips for each hostel), choose the meal type (breakfast, lunch, dinner), and view today's menu plus the weekly schedule!",
            category: "hostel",
          },
          {
            question: "Can I see menus for other hostels?",
            answer:
              "Yes! Just tap on a different hostel chip at the top of the Mess Menu screen to see their menu.",
            category: "hostel",
          },
          {
            question: "How do I submit a mess complaint?",
            answer:
              "In the Mess Menu or Hostel section, find the 'Submit Complaint' button. Describe your issue (food quality, hygiene, timings, etc.), and the mess officials will review it.",
            category: "hostel",
          },
          {
            question: "Who are the hostel officials?",
            answer:
              "Check the Hostel section > Officials tab to see the warden, caretaker, mess secretary, and other officials with their contact details (phone, email).",
            category: "officials",
          },
          {
            question: "What are the mess timings?",
            answer:
              "Mess timings are displayed in the Hostel section. Generally: Breakfast 7:30-9:30 AM, Lunch 12:30-2:30 PM, Snacks 5:00-6:00 PM, Dinner 8:00-10:00 PM. Check your specific hostel for exact times.",
            category: "hostel",
          },
          {
            question: "How do I request hostel maintenance?",
            answer:
              "Go to Hostel > Complaints tab, submit a maintenance request describing the issue (electrical, plumbing, furniture, etc.), and the hostel administration will address it.",
            category: "hostel",
          },

          // === RESOURCE HUB ===
          {
            question: "Where can I find study materials?",
            answer:
              "Go to Resource Hub, select your branch (CSE, ECE, ME, etc.), then year (1st, 2nd, 3rd, 4th), then subject. You'll find notes, books, PDFs, past year questions, and more!",
            category: "resource_hub",
          },
          {
            question: "Can I download study materials?",
            answer:
              "Yes! All resources in the Resource Hub have download buttons. PDFs, images, and documents can be downloaded directly to your device.",
            category: "resource_hub",
          },
          {
            question: "How do I upload study materials?",
            answer:
              "In Resource Hub, click the 'Upload' FAB button, select branch, year, subject, upload your file (PDF, image, doc), add a description, and share with fellow students!",
            category: "resource_hub",
          },
          {
            question: "What types of resources are available?",
            answer:
              "You'll find lecture notes, textbooks, past year question papers (PYQs), assignment solutions, lab manuals, reference materials, and quick revision notes.",
            category: "resource_hub",
          },
          {
            question: "Are there resources for all branches?",
            answer:
              "Yes! We have resources for CSE, ECE, ME, CE, IT, Chemical, Bio-Tech, and all other MNNIT branches. Content is organized by branch, year, and subject.",
            category: "resource_hub",
          },

          // === RIDE SHARING ===
          {
            question: "How does ride sharing work?",
            answer:
              "Students offer rides or look for rides. Go to Ride Share, enter from/to/date filters to find rides, or create your own ride listing with details like vehicle, seats available, and price per seat.",
            category: "rides",
          },
          {
            question: "How do I create a ride?",
            answer:
              "Click 'Create Ride' in Ride Share, enter starting point, destination, date & time, vehicle type, total seats, price per seat, and your contact info. Others can join your ride!",
            category: "rides",
          },
          {
            question: "How do I join a ride?",
            answer:
              "Find a ride going your way, check availability, and click 'Join Ride'. You can see the driver's contact info to coordinate pickup details.",
            category: "rides",
          },
          {
            question: "Can I cancel a ride?",
            answer:
              "Yes! If you joined a ride and need to cancel, click 'Leave Ride'. If you created a ride and need to cancel it, edit or delete your listing.",
            category: "rides",
          },
          {
            question: "How is the cost calculated?",
            answer:
              "The ride creator sets the price per seat. Total cost = price per seat × number of seats you book. Split fuel costs fairly with fellow passengers!",
            category: "rides",
          },
          {
            question: "What routes are popular?",
            answer:
              "Popular routes include Campus to Railway Station, Campus to Airport, Campus to City Center, and inter-city routes during breaks (Delhi, Lucknow, Kanpur, etc.).",
            category: "rides",
          },

          // === EVENTS & CLUBS ===
          {
            question: "How do I find campus events?",
            answer:
              "Go to the Events section and filter by status (Upcoming, Ongoing, Completed). You'll see tech fests, cultural events, workshops, seminars, club activities, and more!",
            category: "events",
          },
          {
            question: "How do I register for an event?",
            answer:
              "Click on an event to see details, then click 'Register'. You'll get confirmation and updates about the event. Some events may have limited seats!",
            category: "events",
          },
          {
            question: "Can I see which club is hosting an event?",
            answer:
              "Yes! Each event shows the organizing club with their logo. Click on the club name to see more details about them and their other events.",
            category: "events",
          },
          {
            question: "What clubs are on campus?",
            answer:
              "Check the Clubs section to see all campus clubs categorized as Technical (coding, robotics), Cultural (music, dance), Sports, Literary (debate, writing), and Social Service clubs.",
            category: "events",
          },
          {
            question: "How do I join a club?",
            answer:
              "View club details in the Clubs section, check their recruitment events, follow their social media links, and contact coordinators listed on their profile.",
            category: "events",
          },
          {
            question: "Can I view past events?",
            answer:
              "Yes! Filter by 'Completed' in Events to see past events, including photos, highlights, and outcomes. Great for seeing what you missed!",
            category: "events",
          },

          // === EATERIES ===
          {
            question: "Where can I find food options on campus?",
            answer:
              "Check the Eateries section for all campus food outlets including canteens, cafeterias, juice shops, and food stalls with menus, prices, ratings, and opening hours.",
            category: "eateries",
          },
          {
            question: "Can I see restaurant ratings?",
            answer:
              "Yes! Each eatery has star ratings (1-5 stars) and reviews from students. You can see the average rating and read what others think about the food quality and service.",
            category: "eateries",
          },
          {
            question: "How do I rate an eatery?",
            answer:
              "Go to an eatery's detail page, click 'Rate', give stars (1-5), write a review (optional), and submit. Your feedback helps other students choose!",
            category: "eateries",
          },
          {
            question: "What information is shown for eateries?",
            answer:
              "You'll see the name, type (veg/non-veg), location, opening hours, menu with prices, contact number, ratings, reviews, and popular items!",
            category: "eateries",
          },
          {
            question: "Can I call the eatery directly?",
            answer:
              "Yes! Each eatery listing has a 'Call' button that directly dials their number for takeout orders or inquiries.",
            category: "eateries",
          },

          // === SUPPORT & PRIVACY ===
          {
            question: "How can I contact CampusBeacon support?",
            answer:
              "For support, email us at campusbeacon0@gmail.com or use the 'Contact Us' form on the website. We typically respond within 24 hours!",
            category: "support",
          },
          {
            question: "Is my data safe on CampusBeacon?",
            answer:
              "Absolutely! We use industry-standard encryption, secure authentication (JWT tokens), and follow best practices for data protection. Your personal information is never shared without permission.",
            category: "privacy",
          },
          {
            question: "Can I delete my account?",
            answer:
              "Yes. Go to Profile > Settings > Delete Account. Note that this permanently removes all your data, listings, and activity from CampusBeacon.",
            category: "support",
          },
          {
            question: "How do I report inappropriate content?",
            answer:
              "If you see inappropriate listings, posts, or behavior, use the 'Report' button on that item or email us at campusbeacon0@gmail.com with details. We take community safety seriously!",
            category: "support",
          },

          // === PROFILE & SETTINGS ===
          {
            question: "How do I update my profile?",
            answer:
              "Go to Profile section, click 'Edit Profile', update your name, photo, registration number, branch, year, or contact info, then save changes.",
            category: "general",
          },
          {
            question: "Can I change my profile picture?",
            answer:
              "Yes! In Profile > Edit Profile, click on your photo, choose a new image from your device, crop if needed, and save. It'll update across all your posts and listings.",
            category: "general",
          },
          {
            question: "What appears on my profile?",
            answer:
              "Your profile shows your name, registration number, branch, year, profile picture, and stats (attendance percentage, number of posts, activities). You control what's public!",
            category: "general",
          },
          {
            question: "How do I enable notifications?",
            answer:
              "Go to Profile > Settings > Notifications. Toggle on/off notifications for events, messages, lost & found matches, ride updates, marketplace activity, etc.",
            category: "general",
          },

          // === MOBILE APP SPECIFIC ===
          {
            question: "Does the mobile app have all features?",
            answer:
              "Yes! The mobile app has 100% feature parity with the web version, including all 10 main features, Redux state management, offline support, and beautiful gradients!",
            category: "general",
          },
          {
            question: "Is the mobile app available for iOS?",
            answer:
              "Yes! The React Native app works on both iOS (App Store) and Android (Play Store). Download it to stay connected on the go!",
            category: "general",
          },
          {
            question: "Does the app work offline?",
            answer:
              "Partially. You can view previously loaded content offline (cached data). Creating new posts, listings, or viewing real-time updates requires internet.",
            category: "general",
          },

          // === TECHNICAL & TROUBLESHOOTING ===
          {
            question: "The website is slow",
            answer:
              "Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection or contact us at campusbeacon0@gmail.com.",
            category: "support",
          },
          {
            question: "I can't upload images",
            answer:
              "Make sure your image is under 5MB and in JPG, PNG, or WebP format. Try compressing the image or using a different browser. Still having issues? Contact support!",
            category: "support",
          },
          {
            question: "My email verification link expired",
            answer:
              "Login to your account and request a new verification email from your profile settings. The new link will be valid for 24 hours.",
            category: "support",
          },
          {
            question: "What browsers are supported?",
            answer:
              "CampusBeacon works best on Chrome, Firefox, Safari, and Edge (latest versions). For the best experience, keep your browser updated!",
            category: "support",
          },

          // === MISCELLANEOUS ===
          {
            question: "I need help",
            answer:
              "I'm here to help! Tell me specifically what you need assistance with - Lost & Found, Marketplace, Attendance, Events, or something else?",
            category: "help",
          },
          {
            question: "What's new on CampusBeacon?",
            answer:
              "We recently launched the mobile app with Redux state management, added 7 new feature screens, improved UI with gradients, and enhanced search functionality across all sections!",
            category: "general",
          },
          {
            question: "Can I suggest new features?",
            answer:
              "Absolutely! We love feedback. Email your suggestions to campusbeacon0@gmail.com or use the feedback form in Profile > Settings. Your ideas help make CampusBeacon better!",
            category: "support",
          },
          {
            question: "Who created CampusBeacon?",
            answer:
              "CampusBeacon was created by Team BrainWashingtonEC: Ayush Jadaun and Ayush Agarwal, MNNIT students passionate about solving real campus problems through technology!",
            category: "general",
          },
        ].map((p) => ({ ...p, lowercaseQuestion: p.question.toLowerCase() })), // Ensure defaults also have lowercase
    };
  }

  async loadOrTrainModel() {
    try {
      if (fs.existsSync(MODEL_FILE)) {
        console.log(`Loading existing model from: ${MODEL_FILE}`);
        await manager.load(MODEL_FILE);
        console.log("Model loaded successfully.");
        this.isModelTrained = true;
      } else {
        console.log("Model file not found. Training a new model...");
        if (!this.corpus || this.corpus.phrases.length === 0) {
          console.error("Cannot train model: Corpus is empty or not loaded.");
          return; // Avoid training on empty data
        }
        await this.prepareTrainingData();
        await this.trainAndSaveModel(); // Train and save the new model
      }
    } catch (error) {
      console.error("Error loading or training model:", error);
      // Optionally: Fallback or further error handling
    }
  }

  // Separate function to add documents/answers to the manager
  async prepareTrainingData() {
    if (!this.corpus) {
      console.error("Cannot prepare training data: Corpus not loaded.");
      return;
    }
    console.log(
      `Preparing training data with ${this.corpus.phrases.length} phrases...`
    );
    // Clear existing documents/answers in case of retrain
    manager.settings.languages.forEach((lang) => {
      manager.nlp.sentences[lang] = [];
      manager.nlp.answers[lang] = {};
    });

    for (const phrase of this.corpus.phrases) {
      if (phrase.lowercaseQuestion && phrase.answer && phrase.category) {
        // Use lowercase question for training
        manager.addDocument("en", phrase.lowercaseQuestion, phrase.category);
        // Keep original answer casing
        manager.addAnswer("en", phrase.category, phrase.answer);

        // Add synonym variations (using lowercase)
        const words = phrase.lowercaseQuestion.split(/\W+/).filter(Boolean);
        for (const word of words) {
          const synonyms = this.findSynonyms(word); // findSynonyms should work with lowercase
          for (const synonym of synonyms) {
            // Be careful not to replace parts of other words
            const regex = new RegExp(`\\b${word}\\b`, "gi"); // Use word boundary
            if (phrase.lowercaseQuestion.match(regex)) {
              const synonymQuestion = phrase.lowercaseQuestion.replace(
                regex,
                synonym
              );
              // Avoid adding identical questions multiple times if synonyms overlap heavily
              if (synonymQuestion !== phrase.lowercaseQuestion) {
                manager.addDocument("en", synonymQuestion, phrase.category);
                // console.log(`Added synonym variation: ${synonymQuestion}`);
              }
            }
          }
        }
      }
    }
    console.log("Training data prepared.");
  }

  // --- Core NLP Logic ---

  // Helper to get cached or compute vector (operates on lowercase)
  getCachedVector(text) {
    const lowerText = text.toLowerCase();
    if (!this.phraseVectorsCache.has(lowerText)) {
      this.phraseVectorsCache.set(
        lowerText,
        this.generateWordVector(lowerText)
      );
    }
    return this.phraseVectorsCache.get(lowerText);
  }

  // TF-based Vectorization (operates on lowercase text)
  // Consider TF-IDF or embeddings for future improvement
  generateWordVector(text) {
    if (!text || typeof text !== "string") return new Map();
    // Already expect lowercase text here
    const stopWords = new Set([
      "the",
      "and",
      "is",
      "in",
      "to",
      "a",
      "of",
      "for",
      "on",
      "with",
      "i",
      "you",
      "me",
      "my",
      "what",
      "how",
      "where",
      "when",
      "can",
      "do",
    ]);
    const words = text
      .split(/\W+/)
      .filter((w) => w && w.length > 1 && !stopWords.has(w));
    const vector = new Map();
    let sumSq = 0;

    for (const word of words) {
      const count = (vector.get(word) || 0) + 1;
      vector.set(word, count);
    }

    // Normalize vector (L2 norm)
    for (const count of vector.values()) {
      sumSq += count * count;
    }
    const magnitude = Math.sqrt(sumSq);

    if (magnitude > 0) {
      for (const [word, count] of vector.entries()) {
        vector.set(word, count / magnitude);
      }
    }
    return vector;
  }

  // Cosine Similarity (operates on TF vectors)
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.size === 0 || vecB.size === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [word, valueA] of vecA.entries()) {
      dotProduct += valueA * (vecB.get(word) || 0);
      normA += valueA * valueA;
    }
    for (const valueB of vecB.values()) {
      normB += valueB * valueB;
    }

    const magnitudeA = Math.sqrt(normA);
    const magnitudeB = Math.sqrt(normB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Finds potential matches using cosine similarity (compares lowercase input to lowercase corpus questions)
  findContextualMatches(lowerCaseQuestion, threshold) {
    if (!lowerCaseQuestion || !this.corpus || !this.corpus.phrases) {
      return [];
    }
    const questionVector = this.getCachedVector(lowerCaseQuestion); // Use cache/compute for input
    const matches = [];

    for (const phrase of this.corpus.phrases) {
      if (!phrase.lowercaseQuestion || !phrase.answer) continue;

      // Get vector for the corpus phrase (use cache/compute)
      const phraseVector = this.getCachedVector(phrase.lowercaseQuestion);
      const similarity = this.cosineSimilarity(questionVector, phraseVector);

      if (similarity >= threshold) {
        matches.push({
          question: phrase.question, // Return original case question
          answer: phrase.answer, // Return original case answer
          category: phrase.category,
          similarity,
          lowercaseQuestion: phrase.lowercaseQuestion, // Include for filtering
        });
      }
    }
    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  // Context Analysis (operates on lowercase)
  enhancedContextAnalysis(lowerCaseQuestion, sessionId) {
    const context = this.contextMemory.get(sessionId) || [];
    const currentQuestionVector = this.getCachedVector(lowerCaseQuestion);
    const recentQuestions = context.slice(-3); // Look at last 3 context questions

    // Generate weighted vectors for recent context questions (expect context items are already lowercase)
    const contextVectors = recentQuestions.map((q, index) => ({
      vector: this.getCachedVector(q),
      weight: (0.6 * (index + 1)) / recentQuestions.length, // Recent get slightly more weight (total context weight 0.6)
    }));

    let bestMatch = null;
    let bestSimilarityScore = 0;

    if (!this.corpus || !this.corpus.phrases) {
      return { bestMatch: null, bestSimilarityScore: 0 };
    }

    for (const phrase of this.corpus.phrases) {
      if (!phrase.lowercaseQuestion || !phrase.answer) continue;

      const phraseVector = this.getCachedVector(phrase.lowercaseQuestion);

      // Similarity with current question (weighted 0.4)
      const currentSimilarity =
        this.cosineSimilarity(currentQuestionVector, phraseVector) * 0.4;

      // Combined similarity with context questions (total weight 0.6)
      let contextSimilarity = 0;
      for (const { vector, weight } of contextVectors) {
        if (vector.size > 0) {
          // Only calculate if context vector is valid
          contextSimilarity +=
            this.cosineSimilarity(vector, phraseVector) * weight;
        }
      }

      const totalSimilarity = currentSimilarity + contextSimilarity;

      if (totalSimilarity > bestSimilarityScore) {
        bestSimilarityScore = totalSimilarity;
        bestMatch = phrase; // Keep the whole phrase object
      }
    }

    // Return original case question/answer
    return {
      bestMatch: bestMatch
        ? {
            ...bestMatch,
            question: bestMatch.question,
            answer: bestMatch.answer,
          }
        : null,
      bestSimilarityScore,
    };
  }

  updateContext(sessionId, lowerCaseQuestion) {
    if (!sessionId || !lowerCaseQuestion) return;
    const context = this.contextMemory.get(sessionId) || [];
    context.push(lowerCaseQuestion); // Store lowercase in context memory
    if (context.length > 5) context.shift(); // Limit context size
    this.contextMemory.set(sessionId, context);
  }

  // Keyword extraction (operates on lowercase)
  extractKeywords(lowerCaseText) {
    if (!lowerCaseText || typeof lowerCaseText !== "string") return [];
    const stopWords = new Set([
      "the",
      "and",
      "is",
      "in",
      "to",
      "a",
      "of",
      "for",
      "on",
      "with",
      "i",
      "you",
      "me",
      "my",
      "what",
      "how",
      "where",
      "when",
      "can",
      "do",
      "what",
      "is",
      "help",
      "need",
      "want",
    ]);
    const words = lowerCaseText
      .split(/\W+/)
      .filter((w) => w && w.length > 2 && !stopWords.has(w));
    const wordFreq = new Map();
    words.forEach((word) => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));

    const keywords = Array.from(wordFreq.entries())
      .filter(([_, freq]) => freq > 0) // Keep all significant words for now
      .sort(([, freqA], [, freqB]) => freqB - freqA)
      .slice(0, 5) // Limit to top 5
      .map(([word]) => word);
    return keywords;
  }

  // Regex-based Entity Extraction (operates on original case text for better matching of proper nouns, etc.)
  extractEntitiesRegex(text) {
    if (!text || typeof text !== "string") return {};
    const entities = {};
    for (const [type, pattern] of Object.entries(this.entityPatterns)) {
      // Use matchAll to find all occurrences
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        // Store potentially multiple values per type
        entities[type] = matches.map((match) => match[0]);
      }
    }
    return entities;
  }

  // Synonym lookup (operates on lowercase)
  findSynonyms(word) {
    if (!word || typeof word !== "string") return [];
    const lowerWord = word.toLowerCase();
    for (const [key, synonymsList] of this.synonyms.entries()) {
      if (key === lowerWord || synonymsList.includes(lowerWord)) {
        // Return the list including the key, excluding the input word itself
        return [key, ...synonymsList].filter((syn) => syn !== lowerWord);
      }
    }
    return [];
  }

  // --- Data Management ---

  // Adds a QnA pair, saves corpus, adds to manager IN MEMORY. Does NOT train.
  async addQnAPair(question, answer, category = "general") {
    if (
      !question ||
      !answer ||
      typeof question !== "string" ||
      typeof answer !== "string"
    ) {
      throw new Error("Invalid question or answer format");
    }
    if (!this.corpus) {
      throw new Error("Corpus not loaded. Cannot add QnA pair.");
    }

    const release = await fileMutex.acquire(); // Acquire lock before reading/writing file
    try {
      console.log("Acquired lock to add QnA pair.");
      // Reload corpus from file inside the lock to get the latest version
      let currentCorpusData;
      let currentCorpus;
      try {
        currentCorpusData = await fs.promises.readFile(CORPUS_FILE, "utf8");
        currentCorpus = JSON.parse(currentCorpusData);
        if (!currentCorpus || !Array.isArray(currentCorpus.phrases)) {
          console.warn(
            "Corpus file content was invalid during add. Starting fresh."
          );
          currentCorpus = { phrases: [] };
        }
      } catch (readError) {
        console.warn(
          "Could not read existing corpus during add, might be creating new. Error:",
          readError.code
        );
        currentCorpus = { phrases: [] }; // Start with empty if file doesnt exist or unreadable
      }

      const lowerCaseQuestion = question.toLowerCase();

      // Avoid adding exact duplicates (check lowercase question)
      const exists = currentCorpus.phrases.some(
        (p) => p.lowercaseQuestion === lowerCaseQuestion
      );
      if (exists) {
        console.log(`Question already exists: "${question}". Skipping add.`);
        return false; // Indicate that nothing was added
      }

      // Add to the structure read from file
      const newPhrase = { question, answer, category, lowercaseQuestion };
      currentCorpus.phrases.push(newPhrase);

      // Write the updated structure back to the file
      await fs.promises.writeFile(
        CORPUS_FILE,
        JSON.stringify(currentCorpus, null, 2),
        "utf8"
      );
      console.log("Corpus file updated successfully.");

      // Update in-memory corpus as well
      this.corpus.phrases.push(newPhrase);

      // Add to the NLP manager (in memory only)
      manager.addDocument(
        "en",
        newPhrase.lowercaseQuestion,
        newPhrase.category
      );
      manager.addAnswer("en", newPhrase.category, newPhrase.answer);
      console.log("QnA pair added to in-memory manager.");

      // Invalidate vector cache for the added phrase if needed (safer to clear all or relevant ones)
      this.phraseVectorsCache.delete(newPhrase.lowercaseQuestion);

      // *** CRITICAL: Do NOT train here. Training should be explicit. ***

      return true; // Indicate successful addition
    } catch (error) {
      console.error("Error adding QnA pair:", error);
      return false;
    } finally {
      release(); // Always release the lock
      console.log("Released lock after adding QnA pair.");
    }
  }

  // --- Model Training ---
  // Explicit function to train and save the model
  async trainAndSaveModel() {
    try {
      console.log("Starting model training...");
      if (!this.corpus || this.corpus.phrases.length === 0) {
        console.warn(
          "Attempted to train model, but corpus is empty. Aborting training."
        );
        return false;
      }
      // Ensure latest data from corpus is prepared in the manager
      await this.prepareTrainingData(); // This function adds documents/answers

      const hrstart = process.hrtime();
      await manager.train();
      const hrend = process.hrtime(hrstart);
      console.info(
        `Model training completed in ${hrend[0]}s ${hrend[1] / 1000000}ms`
      );

      console.log("Saving model...");
      await manager.save(MODEL_FILE, true); // Force saving even if unchanged according to manager
      console.log(`Model saved successfully to ${MODEL_FILE}`);
      this.isModelTrained = true; // Mark as trained
      this.phraseVectorsCache.clear(); // Clear vector cache after retrain as model changes context
      return true;
    } catch (error) {
      console.error("Error training and saving model:", error);
      this.isModelTrained = false;
      return false;
    }
  }

  // --- Helper Methods (Internal) ---

  initializeEntityPatterns() {
    // Using slightly more robust regex, note capturing groups may differ
    return {
      date: /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)\b/gi,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/gi, // Improved phone regex
      time: /\b(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?(?::[0-5][0-9])?\s*(?:am|pm)\b/gi,
      url: /https?:\/\/[^\s]+/gi,
      courseCode: /\b[A-Z]{2,4}\s?\d{3,4}\b/gi, // Matches "CS 101", "ECE450"
      buildingName:
        /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(Hall|Building|Center|Library)\b/gi, // Matches "Smith Hall", "Engineering Building"
      professorName:
        /\b(?:Prof\.?|Dr\.?|Professor|Doctor)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi, // Matches "Prof. Smith", "Dr Jones"
    };
  }

  initializeSynonyms() {
    // Ensure keys and values are lowercase for consistent lookup
    return new Map([
      [
        "hello",
        ["hi", "hey", "greetings", "howdy", "good morning", "good evening"],
      ],
      ["help", ["assist", "support", "aid", "guide", "assistance"]],
      [
        "event",
        ["activity", "program", "gathering", "meeting", "session", "workshop"],
      ],
      ["register", ["signup", "enroll", "join", "subscribe"]],
      ["cancel", ["delete", "remove", "unsubscribe", "quit", "stop"]],
      ["campus", ["university", "college", "school", "institution"]],
      ["forum", ["discussion", "board", "community", "thread"]],
      ["resource", ["material", "tool", "document", "file", "pdf", "link"]],
      ["hostel", ["dorm", "residence", "dormitory", "hall"]],
      ["sell", ["list", "offer"]],
      ["buy", ["purchase", "acquire", "get"]],
      ["ride", ["lift", "transport", "carpool", "share"]],
    ]);
  }
}

// --- Singleton Instance and Initialization ---
const processor = new AdvancedLanguageProcessor();

// Initialize the processor (load corpus, load/train model) asynchronously
// This promise can be awaited elsewhere if needed before handling requests
const initializationPromise = processor.initialize();

initializationPromise
  .then(() => {
    console.log("AdvancedLanguageProcessor initialized.");
  })
  .catch((error) => {
    console.error("Failed to initialize AdvancedLanguageProcessor:", error);
    // Consider exiting the application if initialization fails critically
    // process.exit(1);
  });

// --- Public Interface ---

export const processQuestion = async (question, sessionId = "default") => {
  await initializationPromise; // Ensure initialization is complete

  if (!processor.isModelTrained && !processor.corpus?.phrases?.length) {
    console.error(
      "Cannot process question: Model not trained and corpus is empty."
    );
    return {
      /* Default error response */
    };
  }

  try {
    if (!question || typeof question !== "string" || question.trim() === "") {
      return {
        answer: "Please provide a valid question.",
        category: "error",
        confidence: 0,
        similarQuestions: [],
        entities: {},
        sentiment: "neutral",
        keywords: [],
      };
    }

    const originalQuestion = question; // Keep original for logging or context if needed
    const lowerCaseQuestion = question.toLowerCase();

    // Update context with lowercase version
    processor.updateContext(sessionId, lowerCaseQuestion);

    // Process with NlpManager (expects lowercase)
    const result = await manager.process("en", lowerCaseQuestion);
    const nlpConfidence = result.score || 0;
    const nlpAnswer = result.answer;
    const nlpIntent = result.intent || "None";

    // Extract features (use lowercase for analysis, original for regex)
    const keywords = processor.extractKeywords(lowerCaseQuestion);
    const regexEntities = processor.extractEntitiesRegex(originalQuestion); // Use original case text for regex
    const nlpEntities = result.entities || []; // From NlpManager NER

    // Combine entities (simple merge, prioritize NLP Manager's usually)
    const combinedEntities = { ...regexEntities };
    nlpEntities.forEach((entity) => {
      if (entity.entity && entity.sourceText) {
        if (!combinedEntities[entity.entity]) {
          combinedEntities[entity.entity] = [];
        }
        // Avoid duplicates if regex caught the same thing
        if (!combinedEntities[entity.entity].includes(entity.sourceText)) {
          combinedEntities[entity.entity].push(entity.sourceText);
        }
      }
    });

    // Use NLP Manager's sentiment if available and scored, otherwise fallback (could add custom here if needed)
    const sentimentResult =
      result.sentiment && result.sentiment.score !== 0
        ? { score: result.sentiment.score, sentiment: result.sentiment.vote }
        : { score: 0, sentiment: "neutral" }; // Basic default fallback

    // --- Decision Logic ---

    // 1. High Confidence NLP Match
    if (nlpAnswer && nlpIntent !== "None" && nlpConfidence >= HIGH_CONFIDENCE) {
      console.log(
        `High confidence match (${nlpConfidence}) via NLP Manager for intent: ${nlpIntent}`
      );
      const similar = processor
        .findContextualMatches(lowerCaseQuestion, SUGGESTION_THRESHOLD)
        .filter((q) => q.lowercaseQuestion !== lowerCaseQuestion) // Filter out self
        .slice(0, 3)
        .map((q) => q.question); // Return original case questions
      return {
        answer: nlpAnswer, // Use the direct answer from matched intent
        category: nlpIntent,
        confidence: nlpConfidence,
        similarQuestions: similar,
        entities: combinedEntities,
        sentiment: sentimentResult.sentiment,
        keywords,
        matchType: "nlp_high",
      };
    }

    // 2. Medium Confidence - Try Enhanced Context Analysis
    console.log(
      `NLP confidence (${nlpConfidence}) below HIGH (${HIGH_CONFIDENCE}). Trying enhanced context.`
    );
    const { bestMatch: contextMatch, bestSimilarityScore: contextScore } =
      processor.enhancedContextAnalysis(lowerCaseQuestion, sessionId);

    if (contextMatch && contextScore >= MEDIUM_CONFIDENCE) {
      console.log(
        `Medium confidence match (${contextScore}) via Enhanced Context Analysis.`
      );
      const similar = processor
        .findContextualMatches(lowerCaseQuestion, SUGGESTION_THRESHOLD)
        .filter((q) => q.lowercaseQuestion !== contextMatch.lowercaseQuestion) // Filter match
        .slice(0, 3)
        .map((q) => q.question);
      return {
        answer: contextMatch.answer, // Original case answer
        category: contextMatch.category,
        confidence: contextScore,
        similarQuestions: similar,
        entities: combinedEntities,
        sentiment: sentimentResult.sentiment,
        keywords,
        matchType: "context_medium",
      };
    }

    // 3. Low Confidence - Try Direct Cosine Similarity Fallback
    console.log(
      `Context confidence (${contextScore}) below MEDIUM (${MEDIUM_CONFIDENCE}). Trying direct similarity.`
    );
    const directMatches = processor.findContextualMatches(
      lowerCaseQuestion,
      LOW_CONFIDENCE
    );

    if (directMatches.length > 0) {
      const bestDirectMatch = directMatches[0];
      console.log(
        `Low confidence match (${bestDirectMatch.similarity}) via Direct Similarity.`
      );
      const similar = directMatches.slice(1, 4).map((q) => q.question); // Suggest next best direct matches
      return {
        answer: bestDirectMatch.answer, // Original case answer
        category: bestDirectMatch.category,
        confidence: bestDirectMatch.similarity,
        similarQuestions: similar,
        entities: combinedEntities,
        sentiment: sentimentResult.sentiment,
        keywords,
        matchType: "similarity_low",
      };
    }

    // 4. No Match Found - Provide Default + Suggestions
    console.log(`No matches found above LOW threshold (${LOW_CONFIDENCE}).`);
    const suggestions = processor
      .findContextualMatches(lowerCaseQuestion, SUGGESTION_THRESHOLD)
      .slice(0, 3)
      .map((q) => q.question); // Original case questions
    return {
      answer:
        "I'm not sure how to answer that. Can you try rephrasing? You might also find these related topics helpful:",
      category: "unknown",
      confidence: 0,
      similarQuestions: suggestions,
      entities: combinedEntities,
      sentiment: sentimentResult.sentiment,
      keywords,
      matchType: "none",
    };
  } catch (error) {
    console.error("Error processing question:", error);
    return {
      answer:
        "Sorry, I encountered an internal error trying to process your request. Please try again later.",
      category: "error",
      confidence: 0,
      similarQuestions: [],
      entities: {},
      sentiment: "neutral",
      keywords: [],
      matchType: "error",
    };
  }
};

// Expose the explicit training function
export const trainAndSave = async () => {
  await initializationPromise; // Ensure processor is initialized
  return await processor.trainAndSaveModel();
};

// Expose the add function
export const addQnAPair = async (question, answer, category) => {
  await initializationPromise; // Ensure processor is initialized
  // The function inside the processor now handles the mutex and saving corpus
  const success = await processor.addQnAPair(question, answer, category);
  if (success) {
    console.log(
      "Successfully added QnA. Remember to call trainAndSave() later to include it in the active model."
    );
  }
  return success;
};

// Optionally expose the processor instance if direct access is needed elsewhere (use with caution)
// export { processor };
