// Seed data for DailyChallenge and Vocabulary collections

export const CHALLENGE_SEEDS = {
  english: [
    {
      language: "english", level: "beginner", type: "quiz", title: "Common English Idioms",
      description: "Test your knowledge of popular English expressions",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "What does 'break the ice' mean?", options: ["Start a conversation", "Break something", "Feel cold", "Go skating"], correctAnswer: "Start a conversation", explanation: "'Break the ice' means to initiate conversation in a social setting" },
          { question: "What does 'piece of cake' mean?", options: ["A dessert", "Something easy", "A small portion", "Being hungry"], correctAnswer: "Something easy", explanation: "'Piece of cake' means something that is very easy to do" },
          { question: "What does 'hit the books' mean?", options: ["Be angry", "Go to the library", "Study hard", "Read slowly"], correctAnswer: "Study hard", explanation: "'Hit the books' means to study intensively" },
          { question: "What does 'under the weather' mean?", options: ["Outside", "Feeling sick", "Rainy day", "Cold temperature"], correctAnswer: "Feeling sick", explanation: "'Under the weather' means feeling ill or unwell" },
          { question: "What does 'cost an arm and a leg' mean?", options: ["Be injured", "Very expensive", "Need surgery", "Physical effort"], correctAnswer: "Very expensive", explanation: "'Cost an arm and a leg' means something is very expensive" }
        ]
      },
      tags: ["idioms", "expressions"]
    },
    {
      language: "english", level: "beginner", type: "matching", title: "Synonyms Match",
      description: "Match English words with their synonyms",
      difficulty: 1, xpReward: 40, coins: 8, duration: 120,
      content: {
        pairs: [
          { word: "Happy", translation: "Joyful" }, { word: "Big", translation: "Large" },
          { word: "Fast", translation: "Quick" }, { word: "Smart", translation: "Intelligent" },
          { word: "Beautiful", translation: "Gorgeous" }, { word: "Angry", translation: "Furious" }
        ]
      },
      tags: ["synonyms", "vocabulary"]
    },
    {
      language: "english", level: "beginner", type: "vocabulary", title: "Academic Vocabulary",
      description: "Learn essential academic English words",
      difficulty: 2, xpReward: 60, coins: 12, duration: 240,
      content: {
        words: [
          { word: "analyze", translation: "to examine in detail", context: "We need to analyze the data carefully", category: "academic" },
          { word: "evaluate", translation: "to judge the value of", context: "The teacher will evaluate your essay", category: "academic" },
          { word: "significant", translation: "important or notable", context: "This is a significant achievement", category: "academic" },
          { word: "evidence", translation: "proof or support", context: "The evidence supports the theory", category: "academic" },
          { word: "hypothesis", translation: "a proposed explanation", context: "We need to test this hypothesis", category: "academic" }
        ]
      },
      tags: ["academic", "vocabulary"]
    },
    {
      language: "english", level: "beginner", type: "grammar", title: "Tenses Practice",
      description: "Practice using English verb tenses correctly",
      difficulty: 2, xpReward: 70, coins: 14, duration: 300,
      content: {
        questions: [
          { question: "She ___ to the store yesterday.", options: ["goes", "went", "going", "gone"], correctAnswer: "went", explanation: "Use simple past tense for completed actions in the past" },
          { question: "They ___ dinner right now.", options: ["eat", "ate", "are eating", "have eaten"], correctAnswer: "are eating", explanation: "Use present continuous for actions happening at this moment" },
          { question: "I ___ this book three times.", options: ["read", "reads", "have read", "am reading"], correctAnswer: "have read", explanation: "Use present perfect for experiences or repeated past actions" },
          { question: "He ___ here since 2020.", options: ["lives", "lived", "has lived", "is living"], correctAnswer: "has lived", explanation: "Use present perfect with 'since' for duration from a point in the past" }
        ]
      },
      tags: ["grammar", "tenses"]
    },
    {
      language: "english", level: "beginner", type: "translation", title: "Phrasal Verbs",
      description: "Learn common English phrasal verbs and their meanings",
      difficulty: 3, xpReward: 80, coins: 16, duration: 300,
      content: {
        sentences: [
          { original: "look up", translation: "to search for information", hints: ["Think about using a dictionary", "Finding something"] },
          { original: "give up", translation: "to stop trying", hints: ["Surrender", "Quit"] },
          { original: "come across", translation: "to find by chance", hints: ["Discover accidentally", "Stumble upon"] },
          { original: "figure out", translation: "to understand or solve", hints: ["Solve a puzzle", "Understand something"] }
        ]
      },
      tags: ["phrasal-verbs", "expressions"]
    },
    {
      language: "english", level: "intermediate", type: "quiz", title: "Advanced Grammar",
      description: "Test your knowledge of advanced English grammar concepts",
      difficulty: 3, xpReward: 100, coins: 20, duration: 300,
      content: {
        questions: [
          { question: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], correctAnswer: "were", explanation: "In subjunctive/conditional mood, use 'were' for all subjects" },
          { question: "The book, ___ was published in 1960, is a classic.", options: ["that", "which", "who", "whom"], correctAnswer: "which", explanation: "Use 'which' for non-restrictive clauses set off by commas" },
          { question: "Neither the students nor the teacher ___ ready.", options: ["was", "were", "are", "is"], correctAnswer: "was", explanation: "With 'neither...nor', the verb agrees with the nearest subject" }
        ]
      },
      tags: ["grammar", "advanced"]
    }
  ],
  spanish: [
    {
      language: "spanish", level: "beginner", type: "quiz", title: "Common Greetings Quiz",
      description: "Test your knowledge of basic Spanish greetings",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "How do you say 'Hello' in Spanish?", options: ["Hola", "Adiós", "Gracias", "Por favor"], correctAnswer: "Hola", explanation: "Hola is the most common greeting in Spanish" },
          { question: "What does 'Buenos días' mean?", options: ["Good night", "Good morning", "Good afternoon", "Goodbye"], correctAnswer: "Good morning", explanation: "Buenos días literally means 'good days' but is used as 'good morning'" },
          { question: "How do you say 'Thank you'?", options: ["De nada", "Por favor", "Gracias", "Lo siento"], correctAnswer: "Gracias", explanation: "Gracias is used to express gratitude" },
          { question: "What does '¿Cómo estás?' mean?", options: ["What's your name?", "How are you?", "Where are you?", "How old are you?"], correctAnswer: "How are you?", explanation: "¿Cómo estás? is an informal way to ask how someone is doing" },
          { question: "How do you say 'Please'?", options: ["Gracias", "Lo siento", "Por favor", "Con permiso"], correctAnswer: "Por favor", explanation: "Por favor literally means 'as a favor'" }
        ]
      },
      tags: ["greetings", "basics"]
    },
    {
      language: "spanish", level: "beginner", type: "matching", title: "Match the Numbers",
      description: "Match Spanish numbers with their English translations",
      difficulty: 1, xpReward: 40, coins: 8, duration: 120,
      content: {
        pairs: [
          { word: "Uno", translation: "One" }, { word: "Dos", translation: "Two" },
          { word: "Tres", translation: "Three" }, { word: "Cuatro", translation: "Four" },
          { word: "Cinco", translation: "Five" }, { word: "Seis", translation: "Six" }
        ]
      },
      tags: ["numbers", "basics"]
    },
    {
      language: "spanish", level: "beginner", type: "vocabulary", title: "Food & Drinks",
      description: "Learn essential food vocabulary in Spanish",
      difficulty: 2, xpReward: 60, coins: 12, duration: 240,
      content: {
        words: [
          { word: "agua", translation: "water", context: "Quiero un vaso de agua", category: "food" },
          { word: "pan", translation: "bread", context: "El pan está fresco", category: "food" },
          { word: "leche", translation: "milk", context: "Tomo leche por la mañana", category: "food" },
          { word: "manzana", translation: "apple", context: "La manzana es roja", category: "food" },
          { word: "pollo", translation: "chicken", context: "El pollo está delicioso", category: "food" }
        ]
      },
      tags: ["food", "daily"]
    },
    {
      language: "spanish", level: "beginner", type: "translation", title: "Translate Daily Phrases",
      description: "Translate common everyday phrases from English to Spanish",
      difficulty: 2, xpReward: 70, coins: 14, duration: 300,
      content: {
        sentences: [
          { original: "I am happy", translation: "Estoy feliz", hints: ["Estoy = I am", "feliz = happy"] },
          { original: "The cat is small", translation: "El gato es pequeño", hints: ["gato = cat", "pequeño = small"] },
          { original: "I like music", translation: "Me gusta la música", hints: ["Me gusta = I like", "música = music"] },
          { original: "Where is the bathroom?", translation: "¿Dónde está el baño?", hints: ["Dónde = Where", "baño = bathroom"] }
        ]
      },
      tags: ["translation", "daily"]
    },
    {
      language: "spanish", level: "beginner", type: "grammar", title: "Ser vs Estar",
      description: "Master the difference between ser and estar",
      difficulty: 3, xpReward: 80, coins: 16, duration: 300,
      content: {
        questions: [
          { question: "Yo ___ estudiante. (I am a student)", options: ["soy", "estoy", "es", "está"], correctAnswer: "soy", explanation: "Use 'ser' for permanent characteristics like identity/occupation" },
          { question: "Ella ___ cansada. (She is tired)", options: ["es", "está", "soy", "estoy"], correctAnswer: "está", explanation: "Use 'estar' for temporary states like emotions/conditions" },
          { question: "Nosotros ___ de México. (We are from Mexico)", options: ["estamos", "somos", "son", "están"], correctAnswer: "somos", explanation: "Use 'ser' for origin/nationality" },
          { question: "La comida ___ en la mesa. (The food is on the table)", options: ["es", "está", "son", "están"], correctAnswer: "está", explanation: "Use 'estar' for location" }
        ]
      },
      tags: ["grammar", "verbs"]
    },
    {
      language: "spanish", level: "intermediate", type: "quiz", title: "Past Tense Challenge",
      description: "Test your knowledge of the preterite tense",
      difficulty: 3, xpReward: 100, coins: 20, duration: 300,
      content: {
        questions: [
          { question: "Yo ___ al cine ayer. (I went to the cinema yesterday)", options: ["fui", "iba", "voy", "iré"], correctAnswer: "fui", explanation: "Fui is the preterite (past) form of 'ir' for yo" },
          { question: "Ella ___ una carta. (She wrote a letter)", options: ["escribió", "escribía", "escribe", "escribirá"], correctAnswer: "escribió", explanation: "Escribió is the preterite form of 'escribir' for ella" },
          { question: "Nosotros ___ la cena. (We cooked dinner)", options: ["cocinamos", "cocinábamos", "cocinemos", "cocinaremos"], correctAnswer: "cocinamos", explanation: "Cocinamos is the preterite form for nosotros" }
        ]
      },
      tags: ["grammar", "past-tense"]
    }
  ],
  french: [
    {
      language: "french", level: "beginner", type: "quiz", title: "French Greetings",
      description: "Learn basic French greetings and introductions",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "How do you say 'Hello' in French?", options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"], correctAnswer: "Bonjour", explanation: "Bonjour literally means 'good day'" },
          { question: "What does 'Merci beaucoup' mean?", options: ["You're welcome", "Thank you very much", "Please", "Excuse me"], correctAnswer: "Thank you very much", explanation: "Merci = thanks, beaucoup = very much" },
          { question: "How do you say 'Goodbye'?", options: ["Bonjour", "Bonsoir", "Au revoir", "Salut"], correctAnswer: "Au revoir", explanation: "Au revoir literally means 'until seeing again'" },
          { question: "What does 'Comment allez-vous?' mean?", options: ["What is your name?", "How are you?", "Where do you live?", "How old are you?"], correctAnswer: "How are you?", explanation: "This is the formal way to ask how someone is" }
        ]
      },
      tags: ["greetings", "basics"]
    },
    {
      language: "french", level: "beginner", type: "matching", title: "Colors in French",
      description: "Match French colors with their English translations",
      difficulty: 1, xpReward: 40, coins: 8, duration: 120,
      content: {
        pairs: [
          { word: "Rouge", translation: "Red" }, { word: "Bleu", translation: "Blue" },
          { word: "Vert", translation: "Green" }, { word: "Jaune", translation: "Yellow" },
          { word: "Noir", translation: "Black" }, { word: "Blanc", translation: "White" }
        ]
      },
      tags: ["colors", "basics"]
    },
    {
      language: "french", level: "beginner", type: "vocabulary", title: "At the Restaurant",
      description: "Essential French vocabulary for dining out",
      difficulty: 2, xpReward: 60, coins: 12, duration: 240,
      content: {
        words: [
          { word: "l'addition", translation: "the bill/check", context: "L'addition, s'il vous plaît", category: "food" },
          { word: "le pain", translation: "bread", context: "Le pain est frais", category: "food" },
          { word: "l'eau", translation: "water", context: "Un verre d'eau, s'il vous plaît", category: "food" },
          { word: "le fromage", translation: "cheese", context: "J'aime le fromage français", category: "food" },
          { word: "le vin", translation: "wine", context: "Un verre de vin rouge", category: "food" }
        ]
      },
      tags: ["food", "restaurant"]
    },
    {
      language: "french", level: "beginner", type: "translation", title: "Everyday French Phrases",
      description: "Translate common French phrases",
      difficulty: 2, xpReward: 70, coins: 14, duration: 300,
      content: {
        sentences: [
          { original: "I am happy", translation: "Je suis content(e)", hints: ["Je = I", "suis = am", "content = happy"] },
          { original: "The weather is nice", translation: "Il fait beau", hints: ["Il fait = It is (weather)", "beau = nice/beautiful"] },
          { original: "I like chocolate", translation: "J'aime le chocolat", hints: ["J'aime = I like/love", "chocolat = chocolate"] }
        ]
      },
      tags: ["translation", "daily"]
    }
  ],
  german: [
    {
      language: "german", level: "beginner", type: "quiz", title: "German Basics Quiz",
      description: "Test your knowledge of basic German phrases",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "How do you say 'Hello' in German?", options: ["Hallo", "Tschüss", "Danke", "Bitte"], correctAnswer: "Hallo", explanation: "Hallo is the standard informal greeting" },
          { question: "What does 'Danke schön' mean?", options: ["You're welcome", "Thank you very much", "Good morning", "Goodbye"], correctAnswer: "Thank you very much", explanation: "Danke = thanks, schön = nicely/beautifully" },
          { question: "How do you say 'Yes'?", options: ["Nein", "Ja", "Vielleicht", "Bitte"], correctAnswer: "Ja", explanation: "Ja is one of the most basic German words" },
          { question: "What does 'Guten Morgen' mean?", options: ["Good night", "Good evening", "Good morning", "Good afternoon"], correctAnswer: "Good morning", explanation: "Guten = good, Morgen = morning" }
        ]
      },
      tags: ["greetings", "basics"]
    },
    {
      language: "german", level: "beginner", type: "matching", title: "German Articles",
      description: "Match German nouns with their articles (der/die/das)",
      difficulty: 2, xpReward: 60, coins: 12, duration: 180,
      content: {
        pairs: [
          { word: "der Hund", translation: "the dog" }, { word: "die Katze", translation: "the cat" },
          { word: "das Buch", translation: "the book" }, { word: "der Tisch", translation: "the table" },
          { word: "die Blume", translation: "the flower" }, { word: "das Haus", translation: "the house" }
        ]
      },
      tags: ["articles", "nouns"]
    }
  ],
  japanese: [
    {
      language: "japanese", level: "beginner", type: "quiz", title: "Japanese Greetings",
      description: "Learn essential Japanese greetings",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "How do you say 'Hello' (daytime)?", options: ["Konnichiwa", "Sayonara", "Arigatou", "Sumimasen"], correctAnswer: "Konnichiwa", explanation: "Konnichiwa (こんにちは) is used during daytime" },
          { question: "What does 'Arigatou gozaimasu' mean?", options: ["I'm sorry", "Thank you very much", "Excuse me", "Good morning"], correctAnswer: "Thank you very much", explanation: "This is the polite form of 'thank you'" },
          { question: "How do you say 'Good morning'?", options: ["Konbanwa", "Ohayou gozaimasu", "Oyasuminasai", "Konnichiwa"], correctAnswer: "Ohayou gozaimasu", explanation: "Ohayou gozaimasu (おはようございます) is the polite morning greeting" }
        ]
      },
      tags: ["greetings", "basics"]
    },
    {
      language: "japanese", level: "beginner", type: "matching", title: "Japanese Numbers 1-10",
      description: "Match Japanese numbers with their values",
      difficulty: 1, xpReward: 40, coins: 8, duration: 120,
      content: {
        pairs: [
          { word: "いち (ichi)", translation: "1" }, { word: "に (ni)", translation: "2" },
          { word: "さん (san)", translation: "3" }, { word: "よん (yon)", translation: "4" },
          { word: "ご (go)", translation: "5" }, { word: "ろく (roku)", translation: "6" }
        ]
      },
      tags: ["numbers", "basics"]
    }
  ],
  korean: [
    {
      language: "korean", level: "beginner", type: "quiz", title: "Korean Basics",
      description: "Test your knowledge of basic Korean phrases",
      difficulty: 1, xpReward: 50, coins: 10, duration: 180,
      content: {
        questions: [
          { question: "How do you say 'Hello' in Korean?", options: ["안녕하세요 (Annyeonghaseyo)", "감사합니다 (Gamsahamnida)", "미안합니다 (Mianhamnida)", "잘가 (Jalga)"], correctAnswer: "안녕하세요 (Annyeonghaseyo)", explanation: "Annyeonghaseyo is the standard polite greeting" },
          { question: "What does '감사합니다' mean?", options: ["I'm sorry", "Thank you", "Hello", "Goodbye"], correctAnswer: "Thank you", explanation: "Gamsahamnida is the formal way to say thank you" },
          { question: "How do you say 'Yes'?", options: ["아니요 (Aniyo)", "네 (Ne)", "왜 (Wae)", "뭐 (Mwo)"], correctAnswer: "네 (Ne)", explanation: "Ne (네) is the polite way to say yes" }
        ]
      },
      tags: ["greetings", "basics"]
    }
  ]
};

export const VOCABULARY_SEEDS = {
  english: [
    { language: "english", level: "beginner", category: "academic", word: "analyze", translation: "to examine in detail", pronunciation: "AN-uh-lyze", context: "Studying data or text", exampleSentence: { original: "We need to analyze the results carefully.", translated: "Examine the results in detail." }, difficulty: 2, frequency: 8 },
    { language: "english", level: "beginner", category: "academic", word: "evaluate", translation: "to assess or judge", pronunciation: "ih-VAL-yoo-ayt", context: "Making judgments", exampleSentence: { original: "The teacher will evaluate your performance.", translated: "The teacher will assess your work." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "accomplish", translation: "to achieve or complete", pronunciation: "uh-KOM-plish", context: "Completing goals", exampleSentence: { original: "She accomplished her goal of running a marathon.", translated: "She achieved her marathon goal." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "emotions", word: "anxious", translation: "worried or nervous", pronunciation: "ANK-shus", context: "Feeling worried", exampleSentence: { original: "He felt anxious before the exam.", translated: "He was nervous before the test." }, difficulty: 1, frequency: 8 },
    { language: "english", level: "beginner", category: "daily", word: "efficient", translation: "productive with minimum waste", pronunciation: "ih-FISH-unt", context: "Being productive", exampleSentence: { original: "This is a more efficient way to work.", translated: "This is a more productive method." }, difficulty: 2, frequency: 8 },
    { language: "english", level: "beginner", category: "daily", word: "contribute", translation: "to give or add to", pronunciation: "kun-TRIB-yoot", context: "Helping or adding", exampleSentence: { original: "Everyone should contribute to the project.", translated: "Everyone should add their part." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "perspective", translation: "point of view", pronunciation: "per-SPEK-tiv", context: "Way of seeing things", exampleSentence: { original: "Try to see it from my perspective.", translated: "Try to understand my point of view." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "emotions", word: "enthusiastic", translation: "very excited and interested", pronunciation: "en-THOO-zee-AS-tik", context: "Being excited", exampleSentence: { original: "She is enthusiastic about learning English.", translated: "She is very excited about English." }, difficulty: 2, frequency: 6 },
    { language: "english", level: "beginner", category: "daily", word: "opportunity", translation: "a favorable chance", pronunciation: "op-er-TOO-ni-tee", context: "A chance to do something", exampleSentence: { original: "This is a great opportunity to learn.", translated: "This is a great chance to learn." }, difficulty: 2, frequency: 8 },
    { language: "english", level: "beginner", category: "daily", word: "essential", translation: "absolutely necessary", pronunciation: "ih-SEN-shul", context: "Very important", exampleSentence: { original: "Water is essential for life.", translated: "Water is necessary for life." }, difficulty: 1, frequency: 8 },
    { language: "english", level: "beginner", category: "academic", word: "comprehensive", translation: "complete and thorough", pronunciation: "kom-prih-HEN-siv", context: "Covering everything", exampleSentence: { original: "This is a comprehensive guide to English.", translated: "This guide covers everything about English." }, difficulty: 3, frequency: 6 },
    { language: "english", level: "beginner", category: "daily", word: "demonstrate", translation: "to show or prove", pronunciation: "DEM-un-strayt", context: "Showing how something works", exampleSentence: { original: "Let me demonstrate how to use this tool.", translated: "Let me show you how to use this." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "temporary", translation: "lasting for a limited time", pronunciation: "TEM-puh-rer-ee", context: "Not permanent", exampleSentence: { original: "This is only a temporary solution.", translated: "This solution is not permanent." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "emotions", word: "frustrated", translation: "feeling upset or annoyed", pronunciation: "FRUS-tray-tid", context: "Feeling of irritation", exampleSentence: { original: "I feel frustrated when I make mistakes.", translated: "I get upset when I make errors." }, difficulty: 1, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "consequence", translation: "a result or effect", pronunciation: "KON-suh-kwens", context: "Result of an action", exampleSentence: { original: "Every action has a consequence.", translated: "Every action has a result." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "strategy", translation: "a plan of action", pronunciation: "STRAT-uh-jee", context: "Planning approach", exampleSentence: { original: "We need a good strategy to succeed.", translated: "We need a good plan to succeed." }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "appropriate", translation: "suitable or proper", pronunciation: "uh-PRO-pree-it", context: "Being suitable", exampleSentence: { original: "Is this appropriate for the meeting?", translated: "Is this suitable for the meeting?" }, difficulty: 2, frequency: 7 },
    { language: "english", level: "beginner", category: "academic", word: "significant", translation: "important or meaningful", pronunciation: "sig-NIF-ih-kunt", context: "Being important", exampleSentence: { original: "This is a significant discovery.", translated: "This is an important finding." }, difficulty: 2, frequency: 8 },
    { language: "english", level: "beginner", category: "daily", word: "reliable", translation: "consistently dependable", pronunciation: "rih-LY-uh-bul", context: "Being trustworthy", exampleSentence: { original: "She is a very reliable friend.", translated: "She is a very dependable friend." }, difficulty: 1, frequency: 7 },
    { language: "english", level: "beginner", category: "daily", word: "approximately", translation: "close to but not exact", pronunciation: "uh-PROK-sih-mit-lee", context: "Rough estimate", exampleSentence: { original: "It takes approximately two hours.", translated: "It takes about two hours." }, difficulty: 2, frequency: 7 }
  ],
  spanish: [
    { language: "spanish", level: "beginner", category: "greetings", word: "hola", translation: "hello", pronunciation: "OH-lah", context: "A common greeting", exampleSentence: { original: "¡Hola! ¿Cómo estás?", translated: "Hello! How are you?" }, difficulty: 1, frequency: 10 },
    { language: "spanish", level: "beginner", category: "greetings", word: "adiós", translation: "goodbye", pronunciation: "ah-dee-OHS", context: "Used when parting", exampleSentence: { original: "¡Adiós, amigo!", translated: "Goodbye, friend!" }, difficulty: 1, frequency: 9 },
    { language: "spanish", level: "beginner", category: "greetings", word: "gracias", translation: "thank you", pronunciation: "GRAH-see-ahs", context: "Expressing gratitude", exampleSentence: { original: "Muchas gracias por tu ayuda", translated: "Thank you very much for your help" }, difficulty: 1, frequency: 10 },
    { language: "spanish", level: "beginner", category: "greetings", word: "por favor", translation: "please", pronunciation: "por fah-VOR", context: "Being polite", exampleSentence: { original: "Un café, por favor", translated: "A coffee, please" }, difficulty: 1, frequency: 10 },
    { language: "spanish", level: "beginner", category: "daily", word: "casa", translation: "house/home", pronunciation: "KAH-sah", context: "Where you live", exampleSentence: { original: "Mi casa es grande", translated: "My house is big" }, difficulty: 1, frequency: 9 },
    { language: "spanish", level: "beginner", category: "food", word: "comida", translation: "food/meal", pronunciation: "koh-MEE-dah", context: "General term for food", exampleSentence: { original: "La comida está lista", translated: "The food is ready" }, difficulty: 1, frequency: 8 },
    { language: "spanish", level: "beginner", category: "daily", word: "amigo", translation: "friend", pronunciation: "ah-MEE-goh", context: "A close companion", exampleSentence: { original: "Él es mi mejor amigo", translated: "He is my best friend" }, difficulty: 1, frequency: 9 },
    { language: "spanish", level: "beginner", category: "daily", word: "trabajo", translation: "work/job", pronunciation: "trah-BAH-hoh", context: "Employment or task", exampleSentence: { original: "Voy al trabajo", translated: "I'm going to work" }, difficulty: 2, frequency: 8 },
    { language: "spanish", level: "beginner", category: "emotions", word: "feliz", translation: "happy", pronunciation: "feh-LEES", context: "Feeling of joy", exampleSentence: { original: "Estoy muy feliz hoy", translated: "I am very happy today" }, difficulty: 1, frequency: 8 },
    { language: "spanish", level: "beginner", category: "daily", word: "tiempo", translation: "time/weather", pronunciation: "tee-EM-poh", context: "Can mean both time and weather", exampleSentence: { original: "No tengo tiempo", translated: "I don't have time" }, difficulty: 2, frequency: 9 },
    { language: "spanish", level: "beginner", category: "family", word: "familia", translation: "family", pronunciation: "fah-MEE-lee-ah", context: "Your relatives", exampleSentence: { original: "Mi familia es grande", translated: "My family is big" }, difficulty: 1, frequency: 8 },
    { language: "spanish", level: "beginner", category: "food", word: "desayuno", translation: "breakfast", pronunciation: "deh-sah-YOO-noh", context: "Morning meal", exampleSentence: { original: "El desayuno está listo", translated: "Breakfast is ready" }, difficulty: 2, frequency: 7 },
    { language: "spanish", level: "beginner", category: "daily", word: "libro", translation: "book", pronunciation: "LEE-broh", context: "Something to read", exampleSentence: { original: "Me gusta leer libros", translated: "I like to read books" }, difficulty: 1, frequency: 7 },
    { language: "spanish", level: "beginner", category: "emotions", word: "triste", translation: "sad", pronunciation: "TREE-steh", context: "Feeling of sadness", exampleSentence: { original: "Estoy un poco triste", translated: "I am a little sad" }, difficulty: 1, frequency: 6 },
    { language: "spanish", level: "beginner", category: "daily", word: "grande", translation: "big/large", pronunciation: "GRAHN-deh", context: "Size description", exampleSentence: { original: "La ciudad es muy grande", translated: "The city is very big" }, difficulty: 1, frequency: 8 },
    { language: "spanish", level: "beginner", category: "daily", word: "pequeño", translation: "small/little", pronunciation: "peh-KEN-yoh", context: "Size description", exampleSentence: { original: "El gato es pequeño", translated: "The cat is small" }, difficulty: 1, frequency: 7 },
    { language: "spanish", level: "beginner", category: "daily", word: "bonito", translation: "beautiful/pretty", pronunciation: "boh-NEE-toh", context: "Describing appearance", exampleSentence: { original: "El jardín es muy bonito", translated: "The garden is very beautiful" }, difficulty: 1, frequency: 7 },
    { language: "spanish", level: "beginner", category: "food", word: "carne", translation: "meat", pronunciation: "KAR-neh", context: "Protein food", exampleSentence: { original: "No como carne", translated: "I don't eat meat" }, difficulty: 1, frequency: 7 },
    { language: "spanish", level: "beginner", category: "travel", word: "calle", translation: "street", pronunciation: "KAH-yeh", context: "Road in a city", exampleSentence: { original: "La calle está vacía", translated: "The street is empty" }, difficulty: 2, frequency: 7 },
    { language: "spanish", level: "beginner", category: "daily", word: "dinero", translation: "money", pronunciation: "dee-NEH-roh", context: "Currency/cash", exampleSentence: { original: "No tengo mucho dinero", translated: "I don't have much money" }, difficulty: 2, frequency: 8 }
  ],
  french: [
    { language: "french", level: "beginner", category: "greetings", word: "bonjour", translation: "hello/good day", pronunciation: "bohn-ZHOOR", context: "Standard greeting", exampleSentence: { original: "Bonjour, comment allez-vous?", translated: "Hello, how are you?" }, difficulty: 1, frequency: 10 },
    { language: "french", level: "beginner", category: "greetings", word: "merci", translation: "thank you", pronunciation: "mehr-SEE", context: "Expressing thanks", exampleSentence: { original: "Merci beaucoup!", translated: "Thank you very much!" }, difficulty: 1, frequency: 10 },
    { language: "french", level: "beginner", category: "daily", word: "maison", translation: "house", pronunciation: "meh-ZOHN", context: "Where you live", exampleSentence: { original: "Ma maison est belle", translated: "My house is beautiful" }, difficulty: 1, frequency: 9 },
    { language: "french", level: "beginner", category: "food", word: "boulangerie", translation: "bakery", pronunciation: "boo-lahn-zhuh-REE", context: "Where bread is sold", exampleSentence: { original: "Je vais à la boulangerie", translated: "I'm going to the bakery" }, difficulty: 2, frequency: 7 },
    { language: "french", level: "beginner", category: "daily", word: "chat", translation: "cat", pronunciation: "shah", context: "A pet animal", exampleSentence: { original: "Le chat dort sur le canapé", translated: "The cat sleeps on the sofa" }, difficulty: 1, frequency: 7 },
    { language: "french", level: "beginner", category: "daily", word: "chien", translation: "dog", pronunciation: "shee-EN", context: "A pet animal", exampleSentence: { original: "Mon chien est gentil", translated: "My dog is nice" }, difficulty: 1, frequency: 7 },
    { language: "french", level: "beginner", category: "emotions", word: "content", translation: "happy", pronunciation: "kohn-TAHN", context: "Feeling happy", exampleSentence: { original: "Je suis très content", translated: "I am very happy" }, difficulty: 1, frequency: 7 },
    { language: "french", level: "beginner", category: "food", word: "fromage", translation: "cheese", pronunciation: "froh-MAHZH", context: "Dairy product", exampleSentence: { original: "J'adore le fromage", translated: "I love cheese" }, difficulty: 1, frequency: 7 },
    { language: "french", level: "beginner", category: "daily", word: "école", translation: "school", pronunciation: "ay-KOHL", context: "Place of learning", exampleSentence: { original: "L'école commence à huit heures", translated: "School starts at eight o'clock" }, difficulty: 1, frequency: 8 },
    { language: "french", level: "beginner", category: "daily", word: "travail", translation: "work", pronunciation: "trah-VYE", context: "Employment", exampleSentence: { original: "Je vais au travail", translated: "I go to work" }, difficulty: 2, frequency: 8 }
  ],
  german: [
    { language: "german", level: "beginner", category: "greetings", word: "hallo", translation: "hello", pronunciation: "HAH-loh", context: "Informal greeting", exampleSentence: { original: "Hallo, wie geht es dir?", translated: "Hello, how are you?" }, difficulty: 1, frequency: 10 },
    { language: "german", level: "beginner", category: "greetings", word: "danke", translation: "thank you", pronunciation: "DAHN-kuh", context: "Expressing thanks", exampleSentence: { original: "Danke schön!", translated: "Thank you very much!" }, difficulty: 1, frequency: 10 },
    { language: "german", level: "beginner", category: "daily", word: "Buch", translation: "book", pronunciation: "bookh", context: "Something to read", exampleSentence: { original: "Das Buch ist interessant", translated: "The book is interesting" }, difficulty: 1, frequency: 7 },
    { language: "german", level: "beginner", category: "food", word: "Brot", translation: "bread", pronunciation: "broht", context: "Basic food", exampleSentence: { original: "Ich esse gern Brot", translated: "I like to eat bread" }, difficulty: 1, frequency: 8 },
    { language: "german", level: "beginner", category: "daily", word: "Freund", translation: "friend", pronunciation: "froynt", context: "A companion", exampleSentence: { original: "Er ist mein bester Freund", translated: "He is my best friend" }, difficulty: 1, frequency: 8 },
    { language: "german", level: "beginner", category: "daily", word: "Schule", translation: "school", pronunciation: "SHOO-luh", context: "Place of learning", exampleSentence: { original: "Die Schule beginnt um acht Uhr", translated: "School starts at eight o'clock" }, difficulty: 1, frequency: 8 },
    { language: "german", level: "beginner", category: "daily", word: "Wasser", translation: "water", pronunciation: "VAH-ser", context: "A drink", exampleSentence: { original: "Ich trinke Wasser", translated: "I drink water" }, difficulty: 1, frequency: 9 },
    { language: "german", level: "beginner", category: "emotions", word: "glücklich", translation: "happy", pronunciation: "GLOOK-likh", context: "Feeling happy", exampleSentence: { original: "Ich bin glücklich", translated: "I am happy" }, difficulty: 2, frequency: 7 },
    { language: "german", level: "beginner", category: "family", word: "Familie", translation: "family", pronunciation: "fah-MEE-lee-uh", context: "Your relatives", exampleSentence: { original: "Meine Familie ist groß", translated: "My family is big" }, difficulty: 1, frequency: 8 },
    { language: "german", level: "beginner", category: "daily", word: "groß", translation: "big/tall", pronunciation: "grohs", context: "Size description", exampleSentence: { original: "Das Haus ist groß", translated: "The house is big" }, difficulty: 1, frequency: 8 }
  ],
  japanese: [
    { language: "japanese", level: "beginner", category: "greetings", word: "こんにちは", translation: "hello", pronunciation: "kon-ni-chi-wa", context: "Daytime greeting", exampleSentence: { original: "こんにちは、元気ですか？", translated: "Hello, how are you?" }, difficulty: 1, frequency: 10 },
    { language: "japanese", level: "beginner", category: "greetings", word: "ありがとう", translation: "thank you", pronunciation: "a-ri-ga-tou", context: "Expressing thanks", exampleSentence: { original: "ありがとうございます", translated: "Thank you very much" }, difficulty: 1, frequency: 10 },
    { language: "japanese", level: "beginner", category: "food", word: "水 (みず)", translation: "water", pronunciation: "mi-zu", context: "A drink", exampleSentence: { original: "水をください", translated: "Water, please" }, difficulty: 1, frequency: 9 },
    { language: "japanese", level: "beginner", category: "daily", word: "猫 (ねこ)", translation: "cat", pronunciation: "ne-ko", context: "A pet animal", exampleSentence: { original: "猫が好きです", translated: "I like cats" }, difficulty: 1, frequency: 7 },
    { language: "japanese", level: "beginner", category: "daily", word: "本 (ほん)", translation: "book", pronunciation: "hon", context: "Something to read", exampleSentence: { original: "本を読みます", translated: "I read a book" }, difficulty: 1, frequency: 7 },
    { language: "japanese", level: "beginner", category: "daily", word: "友達 (ともだち)", translation: "friend", pronunciation: "to-mo-da-chi", context: "A companion", exampleSentence: { original: "彼は私の友達です", translated: "He is my friend" }, difficulty: 2, frequency: 8 },
    { language: "japanese", level: "beginner", category: "daily", word: "学校 (がっこう)", translation: "school", pronunciation: "gak-kou", context: "Place of learning", exampleSentence: { original: "学校に行きます", translated: "I go to school" }, difficulty: 2, frequency: 8 },
    { language: "japanese", level: "beginner", category: "food", word: "ご飯 (ごはん)", translation: "rice/meal", pronunciation: "go-han", context: "Staple food", exampleSentence: { original: "ご飯を食べます", translated: "I eat rice" }, difficulty: 1, frequency: 9 },
    { language: "japanese", level: "beginner", category: "daily", word: "大きい (おおきい)", translation: "big", pronunciation: "oo-ki-i", context: "Size description", exampleSentence: { original: "大きい犬です", translated: "It's a big dog" }, difficulty: 1, frequency: 7 },
    { language: "japanese", level: "beginner", category: "daily", word: "小さい (ちいさい)", translation: "small", pronunciation: "chi-i-sa-i", context: "Size description", exampleSentence: { original: "小さい猫です", translated: "It's a small cat" }, difficulty: 1, frequency: 7 }
  ],
  korean: [
    { language: "korean", level: "beginner", category: "greetings", word: "안녕하세요", translation: "hello", pronunciation: "an-nyeong-ha-se-yo", context: "Standard greeting", exampleSentence: { original: "안녕하세요, 만나서 반갑습니다", translated: "Hello, nice to meet you" }, difficulty: 1, frequency: 10 },
    { language: "korean", level: "beginner", category: "greetings", word: "감사합니다", translation: "thank you", pronunciation: "gam-sa-ham-ni-da", context: "Expressing thanks", exampleSentence: { original: "도와주셔서 감사합니다", translated: "Thank you for helping" }, difficulty: 1, frequency: 10 },
    { language: "korean", level: "beginner", category: "food", word: "물 (mul)", translation: "water", pronunciation: "mul", context: "A drink", exampleSentence: { original: "물 주세요", translated: "Water, please" }, difficulty: 1, frequency: 9 },
    { language: "korean", level: "beginner", category: "daily", word: "친구 (chingu)", translation: "friend", pronunciation: "chin-gu", context: "A companion", exampleSentence: { original: "그는 제 친구입니다", translated: "He is my friend" }, difficulty: 1, frequency: 8 },
    { language: "korean", level: "beginner", category: "food", word: "밥 (bap)", translation: "rice/meal", pronunciation: "bap", context: "Staple food", exampleSentence: { original: "밥을 먹었어요", translated: "I ate rice" }, difficulty: 1, frequency: 9 },
    { language: "korean", level: "beginner", category: "daily", word: "학교 (hakgyo)", translation: "school", pronunciation: "hak-gyo", context: "Place of learning", exampleSentence: { original: "학교에 갑니다", translated: "I go to school" }, difficulty: 1, frequency: 8 },
    { language: "korean", level: "beginner", category: "daily", word: "집 (jip)", translation: "house/home", pronunciation: "jip", context: "Where you live", exampleSentence: { original: "집에 가고 싶어요", translated: "I want to go home" }, difficulty: 1, frequency: 9 },
    { language: "korean", level: "beginner", category: "daily", word: "책 (chaek)", translation: "book", pronunciation: "chaek", context: "Something to read", exampleSentence: { original: "책을 읽습니다", translated: "I read a book" }, difficulty: 1, frequency: 7 },
    { language: "korean", level: "beginner", category: "family", word: "가족 (gajok)", translation: "family", pronunciation: "ga-jok", context: "Your relatives", exampleSentence: { original: "가족이 보고 싶어요", translated: "I miss my family" }, difficulty: 1, frequency: 8 },
    { language: "korean", level: "beginner", category: "emotions", word: "행복하다", translation: "to be happy", pronunciation: "haeng-bok-ha-da", context: "Feeling happy", exampleSentence: { original: "오늘 행복해요", translated: "I am happy today" }, difficulty: 2, frequency: 7 }
  ]
};

export const VIDEO_SEEDS = {
  english: [
    {
      language: "english", level: "beginner", category: "grammar", title: "English Tenses Explained",
      description: "Master the most common English tenses with clear examples and practice exercises.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 480, difficulty: 1, instructor: { name: "Sarah Johnson", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true, hasQuiz: true },
      keyPhrases: [
        { phrase: "I have been studying", translation: "Present perfect continuous", timestamp: 60 },
        { phrase: "She had already left", translation: "Past perfect", timestamp: 180 },
        { phrase: "They will have finished", translation: "Future perfect", timestamp: 300 }
      ],
      xpReward: 100, coins: 20, tags: ["grammar", "tenses"]
    },
    {
      language: "english", level: "beginner", category: "vocabulary", title: "100 Most Common English Words",
      description: "Learn the 100 most frequently used English words with pronunciation and examples.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 600, difficulty: 1, instructor: { name: "David Chen", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "the, be, to, of, and", translation: "Top 5 most common words", timestamp: 30 },
        { phrase: "have, it, for, not, on", translation: "Words 6-10", timestamp: 120 }
      ],
      xpReward: 80, coins: 15, tags: ["vocabulary", "basics"]
    },
    {
      language: "english", level: "beginner", category: "conversation", title: "English for Daily Conversations",
      description: "Practice everyday English conversations for real-life situations.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 540, difficulty: 2, instructor: { name: "Emily Brown", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true, hasQuiz: true },
      keyPhrases: [
        { phrase: "Could you help me with...?", translation: "Asking for help politely", timestamp: 45 },
        { phrase: "I was wondering if...", translation: "Making polite requests", timestamp: 150 },
        { phrase: "Would you mind...?", translation: "Asking permission", timestamp: 280 }
      ],
      xpReward: 120, coins: 25, tags: ["conversation", "daily"]
    }
  ],
  spanish: [
    {
      language: "spanish", level: "beginner", category: "greetings", title: "Spanish Greetings for Beginners",
      description: "Learn essential Spanish greetings and introductions. Perfect for absolute beginners.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 420, difficulty: 1, instructor: { name: "Maria Garcia", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true, hasQuiz: true },
      keyPhrases: [
        { phrase: "Hola, ¿cómo estás?", translation: "Hello, how are you?", timestamp: 30 },
        { phrase: "Me llamo...", translation: "My name is...", timestamp: 90 },
        { phrase: "Mucho gusto", translation: "Nice to meet you", timestamp: 150 }
      ],
      xpReward: 100, coins: 20, tags: ["greetings", "basics"]
    },
    {
      language: "spanish", level: "beginner", category: "food", title: "Ordering Food in Spanish",
      description: "Learn how to order at a restaurant in Spanish. Essential vocabulary and phrases for dining out.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 540, difficulty: 2, instructor: { name: "Carlos Lopez", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "Quisiera ordenar...", translation: "I would like to order...", timestamp: 45 },
        { phrase: "La cuenta, por favor", translation: "The check, please", timestamp: 180 },
        { phrase: "¿Qué me recomienda?", translation: "What do you recommend?", timestamp: 300 }
      ],
      xpReward: 120, coins: 24, tags: ["food", "restaurant"]
    },
    {
      language: "spanish", level: "beginner", category: "daily", title: "Daily Routines in Spanish",
      description: "Describe your daily routine using common Spanish verbs and phrases.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 480, difficulty: 2, instructor: { name: "Ana Torres", avatar: "" },
      features: { hasSubtitles: true },
      keyPhrases: [
        { phrase: "Me despierto a las siete", translation: "I wake up at seven", timestamp: 60 },
        { phrase: "Desayuno a las ocho", translation: "I have breakfast at eight", timestamp: 120 }
      ],
      xpReward: 80, coins: 16, tags: ["daily", "routines"]
    }
  ],
  french: [
    {
      language: "french", level: "beginner", category: "greetings", title: "French Greetings & Introductions",
      description: "Master basic French greetings and how to introduce yourself.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 390, difficulty: 1, instructor: { name: "Pierre Dubois", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "Bonjour, comment allez-vous?", translation: "Hello, how are you?", timestamp: 30 },
        { phrase: "Je m'appelle...", translation: "My name is...", timestamp: 90 }
      ],
      xpReward: 100, coins: 20, tags: ["greetings", "basics"]
    },
    {
      language: "french", level: "beginner", category: "food", title: "French Café Culture",
      description: "Learn to order at a French café with proper etiquette and vocabulary.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 450, difficulty: 2, instructor: { name: "Sophie Martin", avatar: "" },
      features: { hasSubtitles: true },
      keyPhrases: [
        { phrase: "Un café, s'il vous plaît", translation: "A coffee, please", timestamp: 45 },
        { phrase: "L'addition, s'il vous plaît", translation: "The check, please", timestamp: 200 }
      ],
      xpReward: 110, coins: 22, tags: ["food", "culture"]
    }
  ],
  german: [
    {
      language: "german", level: "beginner", category: "greetings", title: "German for Beginners: Greetings",
      description: "Start your German journey with essential greetings and polite expressions.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 360, difficulty: 1, instructor: { name: "Hans Mueller", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "Guten Tag, wie geht es Ihnen?", translation: "Good day, how are you?", timestamp: 30 },
        { phrase: "Ich heiße...", translation: "My name is...", timestamp: 90 }
      ],
      xpReward: 100, coins: 20, tags: ["greetings", "basics"]
    }
  ],
  japanese: [
    {
      language: "japanese", level: "beginner", category: "greetings", title: "Essential Japanese Greetings",
      description: "Learn the most important Japanese greetings for everyday situations.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 480, difficulty: 1, instructor: { name: "Yuki Tanaka", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "こんにちは (Konnichiwa)", translation: "Hello", timestamp: 30 },
        { phrase: "はじめまして (Hajimemashite)", translation: "Nice to meet you", timestamp: 90 }
      ],
      xpReward: 100, coins: 20, tags: ["greetings", "basics"]
    }
  ],
  korean: [
    {
      language: "korean", level: "beginner", category: "greetings", title: "Korean Greetings 101",
      description: "Master essential Korean greetings and polite expressions.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      duration: 420, difficulty: 1, instructor: { name: "Min-ji Kim", avatar: "" },
      features: { hasSubtitles: true, hasTranscript: true },
      keyPhrases: [
        { phrase: "안녕하세요 (Annyeonghaseyo)", translation: "Hello", timestamp: 30 },
        { phrase: "만나서 반갑습니다 (Mannaseo bangapseumnida)", translation: "Nice to meet you", timestamp: 90 }
      ],
      xpReward: 100, coins: 20, tags: ["greetings", "basics"]
    }
  ]
};
