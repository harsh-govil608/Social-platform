import mongoose from 'mongoose';
import LearningVideo from '../models/learningVideo.model.js';
import dotenv from 'dotenv';

dotenv.config();

const learningVideos = [
  // SPANISH VIDEOS (6 videos)
  {
    language: 'spanish',
    level: 'beginner',
    category: 'greetings',
    title: 'Spanish Greetings for Beginners',
    description: 'Learn essential Spanish greetings and introductions. Perfect for complete beginners starting their Spanish journey.',
    videoUrl: 'https://www.youtube.com/watch?v=s7I5xWaggqk',
    duration: 480,
    difficulty: 1,
    instructor: {
      name: 'Spanish Learning Academy',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: false,
      hasQuiz: false,
      subtitleLanguages: ['en', 'es']
    },
    keyPhrases: [
      { phrase: 'Hola', translation: 'Hello', timestamp: 45 },
      { phrase: '¿Cómo estás?', translation: 'How are you?', timestamp: 120 },
      { phrase: 'Mucho gusto', translation: 'Nice to meet you', timestamp: 180 }
    ],
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ['beginner', 'essential', 'conversation'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'vocabulary',
    title: 'Spanish Food Vocabulary - Learn 50 Words',
    description: 'Master essential Spanish food vocabulary with native pronunciation. Includes common foods, drinks, and restaurant terms.',
    videoUrl: 'https://www.youtube.com/watch?v=2OLN26yLTWI',
    duration: 720,
    difficulty: 1,
    instructor: {
      name: 'Maria Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en']
    },
    isPremium: false,
    xpReward: 60,
    coins: 15,
    tags: ['vocabulary', 'food', 'practical'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'grammar',
    title: 'Spanish Present Tense Conjugation Explained',
    description: 'Complete guide to conjugating regular and irregular verbs in Spanish present tense. Includes practice exercises.',
    videoUrl: 'https://www.youtube.com/watch?v=fWM8BN8I3kE',
    duration: 900,
    difficulty: 2,
    instructor: {
      name: 'Professor Carlos',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'es']
    },
    quiz: [
      {
        question: 'How do you conjugate "hablar" for "yo"?',
        options: ['hablo', 'habla', 'hablas', 'hablamos'],
        correctAnswer: 'hablo',
        timestamp: 300
      }
    ],
    isPremium: false,
    xpReward: 100,
    coins: 25,
    tags: ['grammar', 'verbs', 'intermediate'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'conversation',
    title: 'Everyday Spanish Conversations',
    description: 'Real-life Spanish dialogues for shopping, ordering food, and making friends. Improve your conversational skills.',
    videoUrl: 'https://www.youtube.com/watch?v=xzkTbqn5x0s',
    duration: 1080,
    difficulty: 2,
    instructor: {
      name: 'Spanish with Ana',
      avatar: 'https://i.pravatar.cc/150?img=25'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en', 'es']
    },
    isPremium: false,
    xpReward: 120,
    coins: 30,
    tags: ['conversation', 'practical', 'daily'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'culture',
    title: 'Understanding Spanish Culture and Traditions',
    description: 'Explore Spanish festivals, customs, and cultural nuances. Learn to communicate like a native speaker.',
    videoUrl: 'https://www.youtube.com/watch?v=qJ5rdPzPs7o',
    duration: 1200,
    difficulty: 4,
    instructor: {
      name: 'Cultural Insights',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en']
    },
    isPremium: false,
    xpReward: 150,
    coins: 40,
    tags: ['culture', 'advanced', 'traditions'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'business',
    title: 'Business Spanish for Professionals',
    description: 'Master professional Spanish vocabulary and business etiquette. Perfect for career advancement.',
    videoUrl: 'https://www.youtube.com/watch?v=7EY9A4Witg4',
    duration: 1500,
    difficulty: 4,
    instructor: {
      name: 'Business Language Institute',
      avatar: 'https://i.pravatar.cc/150?img=40'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'es']
    },
    isPremium: true,
    xpReward: 200,
    coins: 50,
    tags: ['business', 'professional', 'advanced'],
    isActive: true
  },

  // FRENCH VIDEOS (5 videos)
  {
    language: 'french',
    level: 'beginner',
    category: 'greetings',
    title: 'French Basics: Greetings and Politeness',
    description: 'Learn to greet people in French and use polite expressions. Essential phrases for every beginner.',
    videoUrl: 'https://www.youtube.com/watch?v=FHAIPHYnFgk',
    duration: 540,
    difficulty: 1,
    instructor: {
      name: 'French with Sophie',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: false,
      hasQuiz: false,
      subtitleLanguages: ['en', 'fr']
    },
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ['beginner', 'greetings', 'essential'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'pronunciation',
    title: 'French Pronunciation Guide for Beginners',
    description: 'Master French pronunciation with this comprehensive guide. Learn vowels, consonants, and common combinations.',
    videoUrl: 'https://www.youtube.com/watch?v=RXFJcZC7-pU',
    duration: 840,
    difficulty: 2,
    instructor: {
      name: 'Pierre French',
      avatar: 'https://i.pravatar.cc/150?img=14'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en']
    },
    isPremium: false,
    xpReward: 70,
    coins: 20,
    tags: ['pronunciation', 'phonetics', 'beginner'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'grammar',
    title: 'French Past Tenses: Passé Composé vs Imparfait',
    description: 'Understand when to use passé composé and imparfait. Clear explanations with many examples.',
    videoUrl: 'https://www.youtube.com/watch?v=a44e6bvDSTE',
    duration: 960,
    difficulty: 3,
    instructor: {
      name: 'French Grammar Academy',
      avatar: 'https://i.pravatar.cc/150?img=18'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'fr']
    },
    quiz: [
      {
        question: 'Which tense describes completed actions?',
        options: ['Passé Composé', 'Imparfait', 'Both', 'Neither'],
        correctAnswer: 'Passé Composé',
        timestamp: 400
      }
    ],
    isPremium: false,
    xpReward: 120,
    coins: 30,
    tags: ['grammar', 'tenses', 'intermediate'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'travel',
    title: 'French for Travelers: Essential Phrases',
    description: 'Navigate France confidently with these travel phrases. Hotels, restaurants, transportation, and emergencies.',
    videoUrl: 'https://www.youtube.com/watch?v=fTJvE6kI7AQ',
    duration: 720,
    difficulty: 2,
    instructor: {
      name: 'Travel French',
      avatar: 'https://i.pravatar.cc/150?img=22'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en']
    },
    isPremium: false,
    xpReward: 100,
    coins: 25,
    tags: ['travel', 'practical', 'conversation'],
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    category: 'culture',
    title: 'French Literature and Philosophy',
    description: 'Explore French literary classics and philosophical movements. Deepen your cultural understanding.',
    videoUrl: 'https://www.youtube.com/watch?v=PkXBzXlOK9k',
    duration: 1800,
    difficulty: 5,
    instructor: {
      name: 'Dr. Isabelle Dubois',
      avatar: 'https://i.pravatar.cc/150?img=28'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'fr']
    },
    isPremium: true,
    xpReward: 200,
    coins: 50,
    tags: ['literature', 'culture', 'advanced'],
    isActive: true
  },

  // GERMAN VIDEOS (5 videos)
  {
    language: 'german',
    level: 'beginner',
    category: 'greetings',
    title: 'German Greetings and Basic Phrases',
    description: 'Start speaking German from day one! Learn essential greetings and everyday expressions.',
    videoUrl: 'https://www.youtube.com/watch?v=RuGmc662HDg',
    duration: 480,
    difficulty: 1,
    instructor: {
      name: 'Learn German with Anja',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: false,
      hasQuiz: false,
      subtitleLanguages: ['en', 'de']
    },
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ['beginner', 'greetings', 'essential'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'grammar',
    title: 'German Articles: Der, Die, Das Explained',
    description: 'Master German genders and articles. Learn tricks to remember noun genders easily.',
    videoUrl: 'https://www.youtube.com/watch?v=z7kZzTzo6C4',
    duration: 720,
    difficulty: 2,
    instructor: {
      name: 'Easy German',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'de']
    },
    isPremium: false,
    xpReward: 80,
    coins: 20,
    tags: ['grammar', 'articles', 'beginner'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'grammar',
    title: 'German Cases System Simplified',
    description: 'Demystify the German cases: Nominative, Accusative, Dative, and Genitive with clear examples.',
    videoUrl: 'https://www.youtube.com/watch?v=PXI3G0uGFE8',
    duration: 1200,
    difficulty: 3,
    instructor: {
      name: 'German Grammar Pro',
      avatar: 'https://i.pravatar.cc/150?img=16'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'de']
    },
    quiz: [
      {
        question: 'Which case is used for the direct object?',
        options: ['Nominative', 'Accusative', 'Dative', 'Genitive'],
        correctAnswer: 'Accusative',
        timestamp: 500
      }
    ],
    isPremium: false,
    xpReward: 130,
    coins: 35,
    tags: ['grammar', 'cases', 'intermediate'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'conversation',
    title: 'Conversational German for Everyday Life',
    description: 'Practice real German conversations. Learn slang, idioms, and natural expressions.',
    videoUrl: 'https://www.youtube.com/watch?v=X2GZpHGK8y0',
    duration: 900,
    difficulty: 2,
    instructor: {
      name: 'Street German',
      avatar: 'https://i.pravatar.cc/150?img=20'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en', 'de']
    },
    isPremium: false,
    xpReward: 110,
    coins: 28,
    tags: ['conversation', 'slang', 'practical'],
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    category: 'business',
    title: 'Business German: Professional Communication',
    description: 'Excel in German business environments. Learn formal communication, meetings, and presentations.',
    videoUrl: 'https://www.youtube.com/watch?v=Ts2A5PFCBZc',
    duration: 1440,
    difficulty: 4,
    instructor: {
      name: 'Business German Institute',
      avatar: 'https://i.pravatar.cc/150?img=35'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'de']
    },
    isPremium: true,
    xpReward: 180,
    coins: 45,
    tags: ['business', 'professional', 'advanced'],
    isActive: true
  },

  // ITALIAN VIDEOS (4 videos)
  {
    language: 'italian',
    level: 'beginner',
    category: 'greetings',
    title: 'Italian Basics: Greetings and Introductions',
    description: 'Say "Ciao" like a native! Learn essential Italian greetings and how to introduce yourself.',
    videoUrl: 'https://www.youtube.com/watch?v=9-5A7OLaEzM',
    duration: 420,
    difficulty: 1,
    instructor: {
      name: 'Learn Italian with Lucrezia',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: false,
      hasQuiz: false,
      subtitleLanguages: ['en', 'it']
    },
    isPremium: false,
    xpReward: 50,
    coins: 10,
    tags: ['beginner', 'greetings', 'essential'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    title: 'Italian Food Vocabulary and Ordering',
    description: 'Order like an Italian! Learn food vocabulary and restaurant phrases.',
    videoUrl: 'https://www.youtube.com/watch?v=YMZn4JTYj1k',
    duration: 600,
    difficulty: 1,
    instructor: {
      name: 'Italian Bites',
      avatar: 'https://i.pravatar.cc/150?img=13'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en']
    },
    isPremium: false,
    xpReward: 60,
    coins: 15,
    tags: ['food', 'vocabulary', 'practical'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'grammar',
    title: 'Italian Verb Conjugation Made Easy',
    description: 'Master Italian verb conjugations with simple rules and memory tricks.',
    videoUrl: 'https://www.youtube.com/watch?v=c8n6e1qMzKE',
    duration: 840,
    difficulty: 2,
    instructor: {
      name: 'Italian Grammar Master',
      avatar: 'https://i.pravatar.cc/150?img=17'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: true,
      subtitleLanguages: ['en', 'it']
    },
    isPremium: false,
    xpReward: 100,
    coins: 25,
    tags: ['grammar', 'verbs', 'intermediate'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'advanced',
    category: 'culture',
    title: 'Italian Art and Renaissance History',
    description: 'Explore Italy\'s artistic heritage. Learn about Renaissance masters and Italian cultural treasures.',
    videoUrl: 'https://www.youtube.com/watch?v=qmGVYki-O-A',
    duration: 1500,
    difficulty: 4,
    instructor: {
      name: 'Dr. Marco Rossi',
      avatar: 'https://i.pravatar.cc/150?img=30'
    },
    features: {
      hasSubtitles: true,
      hasTranscript: true,
      hasQuiz: false,
      subtitleLanguages: ['en', 'it']
    },
    isPremium: true,
    xpReward: 160,
    coins: 40,
    tags: ['culture', 'art', 'history'],
    isActive: true
  }
];

const seedVideos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing videos (optional - uncomment to replace all videos)
    // await LearningVideo.deleteMany({});
    // console.log('🗑️  Cleared existing videos');

    // Insert videos
    const insertedVideos = await LearningVideo.insertMany(learningVideos);
    console.log(`✅ Successfully added ${insertedVideos.length} learning videos to MongoDB`);

    // Show summary
    const spanish = insertedVideos.filter(v => v.language === 'spanish').length;
    const french = insertedVideos.filter(v => v.language === 'french').length;
    const german = insertedVideos.filter(v => v.language === 'german').length;
    const italian = insertedVideos.filter(v => v.language === 'italian').length;

    const beginner = insertedVideos.filter(v => v.level === 'beginner').length;
    const intermediate = insertedVideos.filter(v => v.level === 'intermediate').length;
    const advanced = insertedVideos.filter(v => v.level === 'advanced').length;

    const premium = insertedVideos.filter(v => v.isPremium).length;
    const free = insertedVideos.filter(v => !v.isPremium).length;

    console.log('\n📊 Video Summary:');
    console.log('  By Language:');
    console.log(`    Spanish: ${spanish}`);
    console.log(`    French: ${french}`);
    console.log(`    German: ${german}`);
    console.log(`    Italian: ${italian}`);
    console.log('  By Level:');
    console.log(`    Beginner: ${beginner}`);
    console.log(`    Intermediate: ${intermediate}`);
    console.log(`    Advanced: ${advanced}`);
    console.log('  By Access:');
    console.log(`    Free: ${free}`);
    console.log(`    Premium: ${premium}`);
    console.log(`  Total: ${insertedVideos.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    process.exit(1);
  }
};

seedVideos();
