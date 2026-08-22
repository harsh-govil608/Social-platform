import mongoose from "mongoose";
import dotenv from "dotenv";
import DailyChallenge from "../models/dailyChallenge.model.js";
import Vocabulary from "../models/vocabulary.model.js";
import LearningVideo from "../models/learningVideo.model.js";

dotenv.config();

// Complete daily challenges data from the removed component
const challengesData = [
  // Quick Quiz Challenge
  {
    language: "spanish",
    level: "beginner",
    type: "quiz",
    title: "Quick Quiz",
    description: "Test your knowledge with 10 rapid-fire questions",
    difficulty: 1,
    xpReward: 50,
    coins: 10,
    duration: 120,
    requirements: { timeLimit: 2 },
    content: {
      questions: [
        { 
          question: "Hello in Spanish?", 
          options: ["Hola", "Bonjour", "Ciao", "Hallo"], 
          correctAnswer: "Hola",
          explanation: "Hola is the Spanish word for Hello"
        },
        { 
          question: "Thank you in French?", 
          options: ["Gracias", "Merci", "Danke", "Grazie"], 
          correctAnswer: "Merci",
          explanation: "Merci is French for Thank you"
        },
        { 
          question: "Good morning in German?", 
          options: ["Buongiorno", "Buenos días", "Guten Morgen", "Bonjour"], 
          correctAnswer: "Guten Morgen",
          explanation: "Guten Morgen means Good morning in German"
        },
        { 
          question: "Goodbye in Italian?", 
          options: ["Arrivederci", "Au revoir", "Adiós", "Auf Wiedersehen"], 
          correctAnswer: "Arrivederci",
          explanation: "Arrivederci is Italian for Goodbye"
        },
        { 
          question: "Please in Japanese?", 
          options: ["Por favor", "S'il vous plaît", "Bitte", "Onegaishimasu"], 
          correctAnswer: "Onegaishimasu",
          explanation: "Onegaishimasu means Please in Japanese"
        }
      ]
    },
    tags: ["quiz", "basic", "vocabulary"]
  },
  
  // Word Match Challenge
  {
    language: "spanish",
    level: "intermediate",
    type: "vocabulary",
    title: "Word Match Madness",
    description: "Match words with their translations before time runs out",
    difficulty: 2,
    xpReward: 75,
    coins: 15,
    duration: 180,
    requirements: { timeLimit: 3 },
    content: {
      pairs: [
        { word: "Cat", translation: "Gato" },
        { word: "Dog", translation: "Perro" },
        { word: "House", translation: "Casa" },
        { word: "Water", translation: "Agua" },
        { word: "Food", translation: "Comida" },
        { word: "Friend", translation: "Amigo" }
      ]
    },
    tags: ["vocabulary", "matching", "speed"]
  },
  
  // Pronunciation Challenge
  {
    language: "spanish",
    level: "advanced",
    type: "pronunciation",
    title: "Perfect Pronunciation",
    description: "Master native pronunciation with AI feedback",
    difficulty: 3,
    xpReward: 100,
    coins: 20,
    duration: 300,
    requirements: { timeLimit: 5 },
    content: {
      phrases: [
        { text: "The weather is beautiful today", translation: "El clima está hermoso hoy", phoneticHint: "ehl KLEE-mah ehs-TAH ehr-MOH-soh oy" },
        { text: "Could you help me, please?", translation: "¿Podrías ayudarme, por favor?", phoneticHint: "poh-DREE-ahs ah-yoo-DAHR-meh, pohr fah-VOHR?" },
        { text: "Where is the nearest restaurant?", translation: "¿Dónde está el restaurante más cercano?", phoneticHint: "DOHN-deh ehs-TAH ehl rehs-tow-RAHN-teh mahs sehr-KAH-noh?" },
        { text: "I would like to order coffee", translation: "Me gustaría pedir café", phoneticHint: "meh goos-tah-REE-ah peh-DEER kah-FEH" },
        { text: "Thank you for your help", translation: "Gracias por tu ayuda", phoneticHint: "GRAH-see-ahs pohr too ah-YOO-dah" }
      ]
    },
    tags: ["pronunciation", "speaking", "advanced"]
  },
  
  // Story Builder Challenge
  {
    language: "spanish",
    level: "intermediate",
    type: "story",
    title: "Story Builder Pro",
    description: "Create stories with vocabulary words for bonus rewards",
    difficulty: 4,
    xpReward: 150,
    coins: 30,
    duration: 420,
    requirements: { timeLimit: 7 },
    content: {
      requiredWords: ["adventure", "mysterious", "discover", "journey", "treasure"],
      prompt: "Write a story using all the required words",
      minLength: 200,
      maxLength: 500
    },
    tags: ["creative", "writing", "vocabulary"]
  },
  
  // Video Comprehension Challenge
  {
    language: "spanish",
    level: "intermediate",
    type: "video",
    title: "Video Master",
    description: "Watch native content and answer comprehension questions",
    difficulty: 3,
    xpReward: 200,
    coins: 40,
    duration: 600,
    requirements: { timeLimit: 10 },
    content: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      questions: [
        { 
          question: "What was the main topic?", 
          options: ["Travel", "Food", "Music", "Sports"], 
          correctAnswer: "Music",
          explanation: "The video was about music"
        },
        { 
          question: "How many people appeared?", 
          options: ["1", "2", "3", "4"], 
          correctAnswer: "1",
          explanation: "One person appeared in the video"
        }
      ]
    },
    tags: ["video", "comprehension", "listening"]
  }
];

// Complete vocabulary data from LearnTenWords component
const vocabularyData = [
  // Daily Essentials - Beginner Spanish
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Hello",
    translation: "Hola",
    pronunciation: "OH-lah",
    example: "Hello, how are you?",
    exampleTranslation: "Hola, ¿cómo estás?",
    image: "👋",
    mnemonic: 'Think of saying "OH-LA-LA" when greeting someone special!',
    difficulty: 1,
    frequency: 10
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Thank you",
    translation: "Gracias",
    pronunciation: "GRAH-see-ahs",
    example: "Thank you for your help",
    exampleTranslation: "Gracias por tu ayuda",
    image: "🙏",
    mnemonic: "GRACIOUS people say Gracias!",
    difficulty: 1,
    frequency: 10
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Water",
    translation: "Agua",
    pronunciation: "AH-gwah",
    example: "I need water",
    exampleTranslation: "Necesito agua",
    image: "💧",
    mnemonic: "AH! GWA! - the sound you make when thirsty!",
    difficulty: 1,
    frequency: 9
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Food",
    translation: "Comida",
    pronunciation: "koh-MEE-dah",
    example: "The food is delicious",
    exampleTranslation: "La comida está deliciosa",
    image: "🍽️",
    mnemonic: "COME EAT DA food = Comida",
    difficulty: 2,
    frequency: 9
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Friend",
    translation: "Amigo",
    pronunciation: "ah-MEE-goh",
    example: "He is my friend",
    exampleTranslation: "Él es mi amigo",
    image: "👥",
    mnemonic: "A ME GO - friends go together!",
    difficulty: 1,
    frequency: 8
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "House",
    translation: "Casa",
    pronunciation: "KAH-sah",
    example: "Welcome to my house",
    exampleTranslation: "Bienvenido a mi casa",
    image: "🏠",
    mnemonic: "My CASA is my castle!",
    difficulty: 1,
    frequency: 9
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Money",
    translation: "Dinero",
    pronunciation: "dee-NEH-roh",
    example: "I need money",
    exampleTranslation: "Necesito dinero",
    image: "💰",
    mnemonic: "DINNER costs dinero!",
    difficulty: 2,
    frequency: 7
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Time",
    translation: "Tiempo",
    pronunciation: "tee-EHM-poh",
    example: "What time is it?",
    exampleTranslation: "¿Qué hora es?",
    image: "⏰",
    mnemonic: "TEMPO of time = Tiempo",
    difficulty: 2,
    frequency: 8
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Love",
    translation: "Amor",
    pronunciation: "ah-MOHR",
    example: "Love is beautiful",
    exampleTranslation: "El amor es hermoso",
    image: "❤️",
    mnemonic: "AMOUR (French) = Amor (Spanish)",
    difficulty: 1,
    frequency: 7
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "daily",
    word: "Happy",
    translation: "Feliz",
    pronunciation: "feh-LEES",
    example: "I am happy",
    exampleTranslation: "Estoy feliz",
    image: "😊",
    mnemonic: "FELIX the cat is always feliz!",
    difficulty: 2,
    frequency: 8
  },
  
  // Travel Vocabulary
  { 
    language: "spanish",
    level: "beginner",
    category: "travel",
    word: "Airport",
    translation: "Aeropuerto",
    pronunciation: "ah-eh-roh-PWEHR-toh",
    example: "I'm going to the airport",
    exampleTranslation: "Voy al aeropuerto",
    image: "✈️",
    mnemonic: "AERO-PORT = Aeropuerto",
    difficulty: 3,
    frequency: 6
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "travel",
    word: "Hotel",
    translation: "Hotel",
    pronunciation: "oh-TEHL",
    example: "The hotel is nice",
    exampleTranslation: "El hotel es bonito",
    image: "🏨",
    mnemonic: "Hotel is almost the same in Spanish!",
    difficulty: 1,
    frequency: 7
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "travel",
    word: "Restaurant",
    translation: "Restaurante",
    pronunciation: "reh-stow-RAHN-teh",
    example: "Let's go to a restaurant",
    exampleTranslation: "Vamos a un restaurante",
    image: "🍴",
    mnemonic: "Restaurant with an E = Restaurante",
    difficulty: 2,
    frequency: 7
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "travel",
    word: "Ticket",
    translation: "Boleto",
    pronunciation: "boh-LEH-toh",
    example: "I need a ticket",
    exampleTranslation: "Necesito un boleto",
    image: "🎫",
    mnemonic: "BOWL-EH-TOE = Boleto",
    difficulty: 2,
    frequency: 6
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "travel",
    word: "Passport",
    translation: "Pasaporte",
    pronunciation: "pah-sah-POHR-teh",
    example: "Where is my passport?",
    exampleTranslation: "¿Dónde está mi pasaporte?",
    image: "📘",
    mnemonic: "PASS-A-PORT-E = Pasaporte",
    difficulty: 2,
    frequency: 5
  },
  
  // Business Terms - Intermediate
  { 
    language: "spanish",
    level: "intermediate",
    category: "business",
    word: "Meeting",
    translation: "Reunión",
    pronunciation: "reh-oo-nee-OHN",
    example: "The meeting is at 3 PM",
    exampleTranslation: "La reunión es a las 3 PM",
    image: "🤝",
    mnemonic: "RE-UNION of people = Reunión",
    difficulty: 3,
    frequency: 6
  },
  { 
    language: "spanish",
    level: "intermediate",
    category: "business",
    word: "Contract",
    translation: "Contrato",
    pronunciation: "kohn-TRAH-toh",
    example: "Sign the contract",
    exampleTranslation: "Firma el contrato",
    image: "📄",
    mnemonic: "CONTRACT-O = Contrato",
    difficulty: 3,
    frequency: 5
  },
  { 
    language: "spanish",
    level: "intermediate",
    category: "business",
    word: "Office",
    translation: "Oficina",
    pronunciation: "oh-fee-SEE-nah",
    example: "I work in an office",
    exampleTranslation: "Trabajo en una oficina",
    image: "🏢",
    mnemonic: "OFFICE-INA = Oficina",
    difficulty: 2,
    frequency: 7
  },
  { 
    language: "spanish",
    level: "intermediate",
    category: "business",
    word: "Boss",
    translation: "Jefe",
    pronunciation: "HEH-feh",
    example: "My boss is nice",
    exampleTranslation: "Mi jefe es amable",
    image: "👔",
    mnemonic: "CHIEF sounds like JEFE",
    difficulty: 2,
    frequency: 6
  },
  { 
    language: "spanish",
    level: "intermediate",
    category: "business",
    word: "Salary",
    translation: "Salario",
    pronunciation: "sah-LAH-ree-oh",
    example: "What is the salary?",
    exampleTranslation: "¿Cuál es el salario?",
    image: "💵",
    mnemonic: "SALARY-O = Salario",
    difficulty: 2,
    frequency: 5
  },
  
  // Family vocabulary
  { 
    language: "spanish",
    level: "beginner",
    category: "family",
    word: "Family",
    translation: "Familia",
    pronunciation: "fah-MEE-lee-ah",
    example: "I love my family",
    exampleTranslation: "Amo a mi familia",
    image: "👨‍👩‍👧‍👦",
    mnemonic: "FAMILY-A = Familia",
    difficulty: 1,
    frequency: 9
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "family",
    word: "Mother",
    translation: "Madre",
    pronunciation: "MAH-dreh",
    example: "My mother is kind",
    exampleTranslation: "Mi madre es amable",
    image: "👩",
    mnemonic: "MADRE sounds like Mother",
    difficulty: 1,
    frequency: 9
  },
  { 
    language: "spanish",
    level: "beginner",
    category: "family",
    word: "Father",
    translation: "Padre",
    pronunciation: "PAH-dreh",
    example: "My father works hard",
    exampleTranslation: "Mi padre trabaja duro",
    image: "👨",
    mnemonic: "PADRE sounds like Father/Papa",
    difficulty: 1,
    frequency: 9
  },
  
  // French vocabulary
  { 
    language: "french",
    level: "beginner",
    category: "greetings",
    word: "Hello",
    translation: "Bonjour",
    pronunciation: "bon-ZHOOR",
    example: "Hello, how are you?",
    exampleTranslation: "Bonjour, comment allez-vous?",
    image: "👋",
    mnemonic: "BON JOUR = Good Day",
    difficulty: 1,
    frequency: 10
  },
  { 
    language: "french",
    level: "beginner",
    category: "greetings",
    word: "Goodbye",
    translation: "Au revoir",
    pronunciation: "oh reh-VWAHR",
    example: "Goodbye, see you later",
    exampleTranslation: "Au revoir, à plus tard",
    image: "👋",
    mnemonic: "OH RE-VOIR = Until we see again",
    difficulty: 1,
    frequency: 9
  },
  { 
    language: "french",
    level: "beginner",
    category: "greetings",
    word: "Please",
    translation: "S'il vous plaît",
    pronunciation: "see voo PLEH",
    example: "Water please",
    exampleTranslation: "De l'eau s'il vous plaît",
    image: "🙏",
    mnemonic: "SEE YOU PLAY = S'il vous plaît",
    difficulty: 2,
    frequency: 10
  },
  { 
    language: "french",
    level: "beginner",
    category: "greetings",
    word: "Thank you",
    translation: "Merci",
    pronunciation: "mehr-SEE",
    example: "Thank you very much",
    exampleTranslation: "Merci beaucoup",
    image: "🙏",
    mnemonic: "MERCY = Merci",
    difficulty: 1,
    frequency: 10
  }
];

// Complete video data from WatchAndLearn component
const videosData = [
  // Beginner Videos
  {
    language: "spanish",
    level: "beginner",
    category: "daily",
    title: "Daily Routines Explained",
    description: "Learn essential vocabulary for describing your daily routine",
    videoUrl: "https://www.youtube.com/embed/7xQMz1DgRaU",
    thumbnailUrl: "https://img.youtube.com/vi/7xQMz1DgRaU/maxresdefault.jpg",
    duration: 330, // 5:30 in seconds
    difficulty: 1,
    instructor: { 
      name: "Maria González",
      avatar: "https://i.pravatar.cc/150?u=maria"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ["english", "spanish", "both"]
    },
    keyPhrases: [
      { phrase: "Buenos días", translation: "Good morning", timestamp: 30 },
      { phrase: "Me levanto temprano", translation: "I wake up early", timestamp: 60 },
      { phrase: "Desayuno a las ocho", translation: "I have breakfast at eight", timestamp: 90 }
    ],
    quiz: [
      {
        timestamp: 120,
        question: "What does 'desayuno' mean?",
        options: ["Lunch", "Breakfast", "Dinner", "Snack"],
        correctAnswer: "Breakfast"
      },
      {
        timestamp: 240,
        question: "How do you say 'I wake up' in Spanish?",
        options: ["Me levanto", "Me despierto", "Me duermo", "Me visto"],
        correctAnswer: "Me despierto"
      }
    ],
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ["daily", "routine", "vocabulary", "essential"],
    viewCount: 12500,
    rating: { average: 4.8, count: 342 }
  },
  {
    language: "spanish",
    level: "beginner",
    category: "shopping",
    title: "Shopping Conversations",
    description: "Master shopping vocabulary and bargaining phrases",
    videoUrl: "https://www.youtube.com/embed/aNdWL7NJ5Cs",
    thumbnailUrl: "https://img.youtube.com/vi/aNdWL7NJ5Cs/maxresdefault.jpg",
    duration: 525, // 8:45 in seconds
    difficulty: 2,
    instructor: { 
      name: "Carlos Mendez",
      avatar: "https://i.pravatar.cc/150?u=carlos"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ["english", "spanish", "both"]
    },
    keyPhrases: [
      { phrase: "¿Cuánto cuesta?", translation: "How much does it cost?", timestamp: 45 },
      { phrase: "¿Tiene descuento?", translation: "Do you have a discount?", timestamp: 120 },
      { phrase: "Me lo llevo", translation: "I'll take it", timestamp: 200 }
    ],
    isPremium: false,
    xpReward: 75,
    coins: 15,
    tags: ["shopping", "conversation", "practical", "bargaining"],
    viewCount: 8200,
    rating: { average: 4.9, count: 215 }
  },
  {
    language: "spanish",
    level: "beginner",
    category: "food",
    title: "Restaurant Etiquette & Ordering",
    description: "Learn how to order food and navigate restaurant situations",
    videoUrl: "https://www.youtube.com/embed/fNMd0R1xFsk",
    thumbnailUrl: "https://img.youtube.com/vi/fNMd0R1xFsk/maxresdefault.jpg",
    duration: 620, // 10:20 in seconds
    difficulty: 2,
    instructor: { 
      name: "Ana Rodriguez",
      avatar: "https://i.pravatar.cc/150?u=ana"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ["english", "spanish", "both"]
    },
    keyPhrases: [
      { phrase: "La carta, por favor", translation: "The menu, please", timestamp: 30 },
      { phrase: "Quisiera ordenar", translation: "I would like to order", timestamp: 90 },
      { phrase: "La cuenta, por favor", translation: "The bill, please", timestamp: 400 }
    ],
    isPremium: false,
    xpReward: 100,
    coins: 20,
    tags: ["restaurant", "food", "ordering", "etiquette"],
    viewCount: 15700,
    rating: { average: 4.7, count: 456 }
  },
  
  // Intermediate Videos
  {
    language: "spanish",
    level: "intermediate",
    category: "business",
    title: "Business Spanish Essentials",
    description: "Professional Spanish for business meetings and emails",
    videoUrl: "https://www.youtube.com/embed/cFOm7aURcSU",
    thumbnailUrl: "https://img.youtube.com/vi/cFOm7aURcSU/maxresdefault.jpg",
    duration: 900, // 15:00 in seconds
    difficulty: 3,
    instructor: { 
      name: "Dr. Juan Pablo",
      avatar: "https://i.pravatar.cc/150?u=juan"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      hasDownloadableNotes: true,
      hasCertificate: true,
      subtitleLanguages: ["english", "spanish"]
    },
    keyPhrases: [
      { phrase: "Según el informe", translation: "According to the report", timestamp: 60 },
      { phrase: "En mi opinión", translation: "In my opinion", timestamp: 180 },
      { phrase: "Propongo que", translation: "I propose that", timestamp: 300 }
    ],
    isPremium: false,
    xpReward: 150,
    coins: 30,
    tags: ["business", "professional", "meetings", "emails"],
    viewCount: 5300,
    rating: { average: 4.9, count: 167 }
  },
  {
    language: "spanish",
    level: "intermediate",
    category: "news",
    title: "News & Current Events",
    description: "Understand news broadcasts and discuss current events",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: 750, // 12:30 in seconds
    difficulty: 3,
    instructor: { 
      name: "Isabella Torres",
      avatar: "https://i.pravatar.cc/150?u=isabella"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ["english", "spanish"]
    },
    keyPhrases: [
      { phrase: "Últimas noticias", translation: "Breaking news", timestamp: 20 },
      { phrase: "Según fuentes oficiales", translation: "According to official sources", timestamp: 100 },
      { phrase: "Se espera que", translation: "It is expected that", timestamp: 200 }
    ],
    isPremium: false,
    xpReward: 125,
    coins: 25,
    tags: ["news", "current events", "media", "discussion"],
    viewCount: 3800,
    rating: { average: 4.6, count: 98 }
  },
  
  // Advanced Videos
  {
    language: "spanish",
    level: "advanced",
    category: "culture",
    title: "Literature & Poetry Analysis",
    description: "Explore Spanish literature and poetry",
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    thumbnailUrl: "https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg",
    duration: 1200, // 20:00 in seconds
    difficulty: 5,
    instructor: { 
      name: "Prof. Miguel Cervantes",
      avatar: "https://i.pravatar.cc/150?u=miguel"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      hasDiscussionForum: true,
      hasExpertAnalysis: true,
      subtitleLanguages: ["spanish"]
    },
    keyPhrases: [
      { phrase: "Metáfora extendida", translation: "Extended metaphor", timestamp: 120 },
      { phrase: "Contexto histórico", translation: "Historical context", timestamp: 300 },
      { phrase: "Análisis literario", translation: "Literary analysis", timestamp: 500 }
    ],
    isPremium: false,
    xpReward: 200,
    coins: 40,
    tags: ["literature", "poetry", "culture", "analysis"],
    viewCount: 2100,
    rating: { average: 5.0, count: 67 }
  },
  
  // French Videos
  {
    language: "french",
    level: "beginner",
    category: "pronunciation",
    title: "French Pronunciation Guide",
    description: "Master French sounds and pronunciation",
    videoUrl: "https://www.youtube.com/embed/FrenchPronounce123",
    thumbnailUrl: "https://img.youtube.com/vi/FrenchPronounce123/maxresdefault.jpg",
    duration: 720, // 12:00 in seconds
    difficulty: 2,
    instructor: { 
      name: "Pierre Dubois",
      avatar: "https://i.pravatar.cc/150?u=pierre"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ["english", "french"]
    },
    keyPhrases: [
      { phrase: "Les voyelles nasales", translation: "Nasal vowels", timestamp: 60 },
      { phrase: "La liaison", translation: "Linking sounds", timestamp: 200 },
      { phrase: "L'accent tonique", translation: "Stress accent", timestamp: 400 }
    ],
    isPremium: false,
    xpReward: 120,
    coins: 24,
    tags: ["pronunciation", "phonetics", "french", "basics"],
    viewCount: 11234,
    rating: { average: 4.6, count: 298 }
  },
  {
    language: "french",
    level: "beginner",
    category: "daily",
    title: "French Daily Conversations",
    description: "Essential French for everyday situations",
    videoUrl: "https://www.youtube.com/embed/FrenchDaily456",
    thumbnailUrl: "https://img.youtube.com/vi/FrenchDaily456/maxresdefault.jpg",
    duration: 480, // 8:00 in seconds
    difficulty: 1,
    instructor: { 
      name: "Marie Leblanc",
      avatar: "https://i.pravatar.cc/150?u=marie"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ["english", "french", "both"]
    },
    keyPhrases: [
      { phrase: "Comment allez-vous?", translation: "How are you?", timestamp: 30 },
      { phrase: "Je voudrais", translation: "I would like", timestamp: 90 },
      { phrase: "Excusez-moi", translation: "Excuse me", timestamp: 150 }
    ],
    isPremium: false,
    xpReward: 60,
    coins: 12,
    tags: ["daily", "conversation", "french", "beginner"],
    viewCount: 9876,
    rating: { average: 4.7, count: 234 }
  },
  
  // German Videos
  {
    language: "german",
    level: "beginner",
    category: "greetings",
    title: "German Greetings and Introductions",
    description: "Learn how to greet and introduce yourself in German",
    videoUrl: "https://www.youtube.com/embed/GermanGreet789",
    thumbnailUrl: "https://img.youtube.com/vi/GermanGreet789/maxresdefault.jpg",
    duration: 420, // 7:00 in seconds
    difficulty: 1,
    instructor: { 
      name: "Hans Mueller",
      avatar: "https://i.pravatar.cc/150?u=hans"
    },
    features: { 
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ["english", "german"]
    },
    keyPhrases: [
      { phrase: "Guten Tag", translation: "Good day", timestamp: 20 },
      { phrase: "Wie heißen Sie?", translation: "What is your name?", timestamp: 60 },
      { phrase: "Freut mich", translation: "Nice to meet you", timestamp: 120 }
    ],
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ["greetings", "introduction", "german", "basic"],
    viewCount: 7654,
    rating: { average: 4.5, count: 189 }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing learning data...");
    await DailyChallenge.deleteMany({});
    await Vocabulary.deleteMany({});
    await LearningVideo.deleteMany({});

    // Seed Daily Challenges
    console.log("Seeding daily challenges...");
    await DailyChallenge.insertMany(challengesData);
    console.log(`✅ Inserted ${challengesData.length} daily challenges`);

    // Seed Vocabulary
    console.log("Seeding vocabulary...");
    await Vocabulary.insertMany(vocabularyData);
    console.log(`✅ Inserted ${vocabularyData.length} vocabulary words`);

    // Seed Learning Videos
    console.log("Seeding learning videos...");
    await LearningVideo.insertMany(videosData);
    console.log(`✅ Inserted ${videosData.length} learning videos`);

    console.log("\n✨ Database seeded successfully!");
    console.log("Summary:");
    console.log(`  - ${challengesData.length} challenges (quiz, pronunciation, grammar, etc.)`);
    console.log(`  - ${vocabularyData.length} vocabulary words (Spanish, French, etc.)`);
    console.log(`  - ${videosData.length} learning videos (beginner to advanced)`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();