import mongoose from 'mongoose';
import DailyChallenge from '../models/dailyChallenge.model.js';
import dotenv from 'dotenv';

dotenv.config();

const challenges = [
  // BEGINNER - Spanish (15 challenges)
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Basic Greetings',
    description: 'Learn essential Spanish greetings',
    content: {
      words: [
        { word: 'Hola', translation: 'Hello', pronunciation: 'OH-lah' },
        { word: 'Adiós', translation: 'Goodbye', pronunciation: 'ah-DYOHS' },
        { word: 'Buenos días', translation: 'Good morning', pronunciation: 'BWEH-nohs DEE-ahs' },
        { word: 'Buenas tardes', translation: 'Good afternoon', pronunciation: 'BWEH-nahs TAR-dehs' },
        { word: 'Buenas noches', translation: 'Good night', pronunciation: 'BWEH-nahs NOH-chehs' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'grammar',
    title: 'Subject Pronouns',
    description: 'Master Spanish subject pronouns',
    content: {
      rules: 'I=Yo, You=Tú, He/She=Él/Ella, We=Nosotros, They=Ellos',
      examples: [
        { spanish: 'Yo soy estudiante', english: 'I am a student' },
        { spanish: 'Tú eres amable', english: 'You are kind' },
        { spanish: 'Ella es doctora', english: 'She is a doctor' }
      ]
    },
    xpReward: 75,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Numbers 1-20',
    description: 'Count from 1 to 20 in Spanish',
    content: {
      words: [
        { word: 'uno', translation: '1' },
        { word: 'dos', translation: '2' },
        { word: 'tres', translation: '3' },
        { word: 'cuatro', translation: '4' },
        { word: 'cinco', translation: '5' },
        { word: 'diez', translation: '10' },
        { word: 'veinte', translation: '20' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Family Members',
    description: 'Learn to talk about your family',
    content: {
      words: [
        { word: 'madre', translation: 'mother', pronunciation: 'MAH-dreh' },
        { word: 'padre', translation: 'father', pronunciation: 'PAH-dreh' },
        { word: 'hermano', translation: 'brother', pronunciation: 'ehr-MAH-noh' },
        { word: 'hermana', translation: 'sister', pronunciation: 'ehr-MAH-nah' },
        { word: 'abuelo', translation: 'grandfather', pronunciation: 'ah-BWEH-loh' }
      ]
    },
    xpReward: 60,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Colors',
    description: 'Describe the world in Spanish colors',
    content: {
      words: [
        { word: 'rojo', translation: 'red' },
        { word: 'azul', translation: 'blue' },
        { word: 'verde', translation: 'green' },
        { word: 'amarillo', translation: 'yellow' },
        { word: 'negro', translation: 'black' },
        { word: 'blanco', translation: 'white' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },

  // INTERMEDIATE - Spanish (15 challenges)
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'grammar',
    title: 'Present Tense Regular Verbs',
    description: 'Conjugate -ar, -er, -ir verbs in present tense',
    content: {
      rules: 'AR: -o, -as, -a, -amos, -áis, -an | ER/IR: -o, -es, -e, -emos/imos, -éis/ís, -en',
      examples: [
        { spanish: 'Yo hablo español', english: 'I speak Spanish' },
        { spanish: 'Tú comes manzanas', english: 'You eat apples' },
        { spanish: 'Nosotros vivimos aquí', english: 'We live here' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'vocabulary',
    title: 'Restaurant Vocabulary',
    description: 'Order food like a native',
    content: {
      words: [
        { word: 'el menú', translation: 'the menu' },
        { word: 'el camarero', translation: 'the waiter' },
        { word: 'la cuenta', translation: 'the bill' },
        { word: 'una mesa', translation: 'a table' },
        { word: 'la propina', translation: 'the tip' }
      ]
    },
    xpReward: 80,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'conversation',
    title: 'Making Plans',
    description: 'Invite friends and make social plans',
    content: {
      phrases: [
        { spanish: '¿Quieres salir esta noche?', english: 'Do you want to go out tonight?' },
        { spanish: '¿A qué hora nos vemos?', english: 'What time shall we meet?' },
        { spanish: 'Nos vemos a las ocho', english: 'See you at eight' }
      ]
    },
    xpReward: 90,
    difficulty: 2,
    duration: 600,
    isActive: true
  },

  // ADVANCED - Spanish (10 challenges)
  {
    language: 'spanish',
    level: 'advanced',
    type: 'grammar',
    title: 'Subjunctive Mood',
    description: 'Master the Spanish subjunctive',
    content: {
      rules: 'Used for wishes, doubts, and hypotheticals. Triggers: querer que, dudar que, es posible que',
      examples: [
        { spanish: 'Espero que tengas un buen día', english: 'I hope you have a good day' },
        { spanish: 'Dudo que venga mañana', english: 'I doubt he will come tomorrow' },
        { spanish: 'Es importante que estudies', english: 'It\'s important that you study' }
      ]
    },
    xpReward: 150,
    difficulty: 4,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    type: 'vocabulary',
    title: 'Business Spanish',
    description: 'Professional vocabulary for work',
    content: {
      words: [
        { word: 'la empresa', translation: 'the company' },
        { word: 'el contrato', translation: 'the contract' },
        { word: 'la reunión', translation: 'the meeting' },
        { word: 'el presupuesto', translation: 'the budget' },
        { word: 'el plazo', translation: 'the deadline' }
      ]
    },
    xpReward: 120,
    difficulty: 4,
    duration: 600,
    isActive: true
  },

  // BEGINNER - French (10 challenges)
  {
    language: 'french',
    level: 'beginner',
    type: 'vocabulary',
    title: 'French Greetings',
    description: 'Say bonjour like a Parisian',
    content: {
      words: [
        { word: 'Bonjour', translation: 'Hello', pronunciation: 'bon-ZHOOR' },
        { word: 'Au revoir', translation: 'Goodbye', pronunciation: 'oh ruh-VWAHR' },
        { word: 'Merci', translation: 'Thank you', pronunciation: 'mehr-SEE' },
        { word: "S'il vous plaît", translation: 'Please', pronunciation: 'seel voo PLEH' },
        { word: 'Excusez-moi', translation: 'Excuse me', pronunciation: 'ex-kew-zay MWAH' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Numbers in French',
    description: 'Count in French from 1 to 20',
    content: {
      words: [
        { word: 'un', translation: '1' },
        { word: 'deux', translation: '2' },
        { word: 'trois', translation: '3' },
        { word: 'dix', translation: '10' },
        { word: 'vingt', translation: '20' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },

  // INTERMEDIATE - French (5 challenges)
  {
    language: 'french',
    level: 'intermediate',
    type: 'grammar',
    title: 'Passé Composé',
    description: 'Talk about the past in French',
    content: {
      rules: 'Use avoir/être + past participle. Example: J\'ai mangé (I ate)',
      examples: [
        { french: 'J\'ai parlé français', english: 'I spoke French' },
        { french: 'Elle est allée au marché', english: 'She went to the market' },
        { french: 'Nous avons fini', english: 'We finished' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },

  // ADVANCED - French (5 challenges)
  {
    language: 'french',
    level: 'advanced',
    type: 'vocabulary',
    title: 'Idiomatic Expressions',
    description: 'Sound like a native with French idioms',
    content: {
      phrases: [
        { french: 'Avoir la moutarde qui monte au nez', english: 'To get angry (lit: have mustard rising to nose)' },
        { french: 'Coûter les yeux de la tête', english: 'To cost an arm and a leg (lit: cost the eyes from the head)' },
        { french: 'Tomber dans les pommes', english: 'To faint (lit: fall in the apples)' }
      ]
    },
    xpReward: 130,
    difficulty: 4,
    duration: 600,
    isActive: true
  },

  // BEGINNER - German (5 challenges)
  {
    language: 'german',
    level: 'beginner',
    type: 'vocabulary',
    title: 'German Greetings',
    description: 'Greet people in German',
    content: {
      words: [
        { word: 'Guten Morgen', translation: 'Good morning', pronunciation: 'GOO-ten MOR-gen' },
        { word: 'Guten Tag', translation: 'Good day', pronunciation: 'GOO-ten TAHK' },
        { word: 'Auf Wiedersehen', translation: 'Goodbye', pronunciation: 'owf VEE-der-zay-en' },
        { word: 'Danke', translation: 'Thank you', pronunciation: 'DAHN-kuh' },
        { word: 'Bitte', translation: 'Please/You\'re welcome', pronunciation: 'BIT-tuh' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },

  // More challenges for variety...
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Days of the Week',
    description: 'Learn the days in Spanish',
    content: {
      words: [
        { word: 'lunes', translation: 'Monday' },
        { word: 'martes', translation: 'Tuesday' },
        { word: 'miércoles', translation: 'Wednesday' },
        { word: 'jueves', translation: 'Thursday' },
        { word: 'viernes', translation: 'Friday' },
        { word: 'sábado', translation: 'Saturday' },
        { word: 'domingo', translation: 'Sunday' }
      ]
    },
    xpReward: 60,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Common Verbs',
    description: 'Essential Spanish action words',
    content: {
      words: [
        { word: 'ser', translation: 'to be (permanent)' },
        { word: 'estar', translation: 'to be (temporary)' },
        { word: 'hacer', translation: 'to do/make' },
        { word: 'tener', translation: 'to have' },
        { word: 'ir', translation: 'to go' },
        { word: 'ver', translation: 'to see' }
      ]
    },
    xpReward: 70,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'vocabulary',
    title: 'Travel Vocabulary',
    description: 'Navigate Spain and Latin America',
    content: {
      words: [
        { word: 'el aeropuerto', translation: 'the airport' },
        { word: 'el hotel', translation: 'the hotel' },
        { word: 'la estación', translation: 'the station' },
        { word: 'el billete', translation: 'the ticket' },
        { word: 'la maleta', translation: 'the suitcase' }
      ]
    },
    xpReward: 85,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'grammar',
    title: 'Preterite vs Imperfect',
    description: 'Two ways to talk about the past',
    content: {
      rules: 'Preterite = completed actions. Imperfect = ongoing/habitual past',
      examples: [
        { spanish: 'Ayer comí pizza (preterite)', english: 'Yesterday I ate pizza' },
        { spanish: 'Cuando era niño, comía pizza (imperfect)', english: 'When I was a child, I used to eat pizza' }
      ]
    },
    xpReward: 110,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Months and Seasons',
    description: 'Talk about time of year',
    content: {
      words: [
        { word: 'enero', translation: 'January' },
        { word: 'primavera', translation: 'spring' },
        { word: 'verano', translation: 'summer' },
        { word: 'otoño', translation: 'autumn' },
        { word: 'invierno', translation: 'winter' }
      ]
    },
    xpReward: 55,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Food and Drinks',
    description: 'Basic food vocabulary',
    content: {
      words: [
        { word: 'agua', translation: 'water' },
        { word: 'pan', translation: 'bread' },
        { word: 'carne', translation: 'meat' },
        { word: 'fruta', translation: 'fruit' },
        { word: 'leche', translation: 'milk' }
      ]
    },
    xpReward: 60,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'conversation',
    title: 'Asking for Directions',
    description: 'Navigate like a local',
    content: {
      phrases: [
        { spanish: '¿Dónde está...?', english: 'Where is...?' },
        { spanish: 'Gire a la derecha', english: 'Turn right' },
        { spanish: 'Siga todo recto', english: 'Go straight ahead' },
        { spanish: 'Está cerca', english: 'It\'s nearby' }
      ]
    },
    xpReward: 85,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    type: 'grammar',
    title: 'Por vs Para',
    description: 'Master these tricky prepositions',
    content: {
      rules: 'Por = reason, duration, exchange. Para = purpose, destination, deadline',
      examples: [
        { spanish: 'Estudio por tres horas', english: 'I study for three hours' },
        { spanish: 'Estudio para el examen', english: 'I study for the exam' },
        { spanish: 'Gracias por todo', english: 'Thanks for everything' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    type: 'conversation',
    title: 'Debating and Opinions',
    description: 'Express complex viewpoints',
    content: {
      phrases: [
        { spanish: 'Desde mi punto de vista', english: 'From my point of view' },
        { spanish: 'No estoy de acuerdo', english: 'I disagree' },
        { spanish: 'Por un lado... por otro lado', english: 'On one hand... on the other hand' },
        { spanish: 'En resumen', english: 'In summary' }
      ]
    },
    xpReward: 140,
    difficulty: 4,
    duration: 600,
    isActive: true
  },

  // FRENCH - Additional Challenges
  {
    language: 'french',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Colors and Shapes',
    description: 'Describe the world in French',
    content: {
      words: [
        { word: 'rouge', translation: 'red' },
        { word: 'bleu', translation: 'blue' },
        { word: 'vert', translation: 'green' },
        { word: 'jaune', translation: 'yellow' },
        { word: 'rond', translation: 'round' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Family in French',
    description: 'Talk about your famille',
    content: {
      words: [
        { word: 'mère', translation: 'mother' },
        { word: 'père', translation: 'father' },
        { word: 'frère', translation: 'brother' },
        { word: 'sœur', translation: 'sister' },
        { word: 'enfant', translation: 'child' }
      ]
    },
    xpReward: 55,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    type: 'grammar',
    title: 'Articles: Le, La, Les',
    description: 'Master French articles',
    content: {
      rules: 'Le = masculine, La = feminine, Les = plural, L\' before vowel',
      examples: [
        { french: 'le chat', english: 'the cat (m)' },
        { french: 'la maison', english: 'the house (f)' },
        { french: 'les enfants', english: 'the children' },
        { french: 'l\'ami', english: 'the friend' }
      ]
    },
    xpReward: 70,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    type: 'vocabulary',
    title: 'Shopping and Stores',
    description: 'Navigate French shops',
    content: {
      words: [
        { word: 'le magasin', translation: 'the store' },
        { word: 'la boulangerie', translation: 'the bakery' },
        { word: 'le prix', translation: 'the price' },
        { word: 'acheter', translation: 'to buy' },
        { word: 'vendre', translation: 'to sell' }
      ]
    },
    xpReward: 80,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    type: 'conversation',
    title: 'At the Restaurant',
    description: 'Order meals in French',
    content: {
      phrases: [
        { french: 'Je voudrais commander', english: 'I would like to order' },
        { french: 'L\'addition, s\'il vous plaît', english: 'The bill, please' },
        { french: 'C\'est délicieux', english: 'It\'s delicious' },
        { french: 'Un verre de vin', english: 'A glass of wine' }
      ]
    },
    xpReward: 90,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    type: 'grammar',
    title: 'Future Tense',
    description: 'Talk about future plans',
    content: {
      rules: 'Add endings: -ai, -as, -a, -ons, -ez, -ont to infinitive',
      examples: [
        { french: 'Je parlerai français', english: 'I will speak French' },
        { french: 'Tu voyageras en France', english: 'You will travel to France' },
        { french: 'Nous mangerons ensemble', english: 'We will eat together' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    type: 'grammar',
    title: 'Subjunctive in French',
    description: 'Express doubt and emotion',
    content: {
      rules: 'Use after: il faut que, bien que, pour que, avant que',
      examples: [
        { french: 'Il faut que tu viennes', english: 'You must come' },
        { french: 'Je doute qu\'il soit là', english: 'I doubt he is there' },
        { french: 'Bien qu\'il pleuve', english: 'Although it\'s raining' }
      ]
    },
    xpReward: 150,
    difficulty: 4,
    duration: 600,
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    type: 'vocabulary',
    title: 'French Literature Terms',
    description: 'Discuss books and writing',
    content: {
      words: [
        { word: 'l\'écrivain', translation: 'the writer' },
        { word: 'le roman', translation: 'the novel' },
        { word: 'la poésie', translation: 'poetry' },
        { word: 'le récit', translation: 'the narrative' },
        { word: 'l\'intrigue', translation: 'the plot' }
      ]
    },
    xpReward: 130,
    difficulty: 4,
    duration: 600,
    isActive: true
  },

  // GERMAN - Additional Challenges
  {
    language: 'german',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Numbers in German',
    description: 'Count from 1 to 20',
    content: {
      words: [
        { word: 'eins', translation: '1' },
        { word: 'zwei', translation: '2' },
        { word: 'drei', translation: '3' },
        { word: 'zehn', translation: '10' },
        { word: 'zwanzig', translation: '20' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Family Members',
    description: 'German family vocabulary',
    content: {
      words: [
        { word: 'die Mutter', translation: 'mother' },
        { word: 'der Vater', translation: 'father' },
        { word: 'der Bruder', translation: 'brother' },
        { word: 'die Schwester', translation: 'sister' },
        { word: 'das Kind', translation: 'child' }
      ]
    },
    xpReward: 60,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    type: 'grammar',
    title: 'German Articles',
    description: 'Der, Die, Das explained',
    content: {
      rules: 'Der = masculine, Die = feminine, Das = neuter. All nouns are capitalized!',
      examples: [
        { german: 'der Mann', english: 'the man' },
        { german: 'die Frau', english: 'the woman' },
        { german: 'das Kind', english: 'the child' }
      ]
    },
    xpReward: 75,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Days and Time',
    description: 'Tell time in German',
    content: {
      words: [
        { word: 'Montag', translation: 'Monday' },
        { word: 'heute', translation: 'today' },
        { word: 'morgen', translation: 'tomorrow' },
        { word: 'die Uhr', translation: 'clock/hour' },
        { word: 'die Zeit', translation: 'time' }
      ]
    },
    xpReward: 55,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    type: 'grammar',
    title: 'German Cases',
    description: 'Nominative, Accusative, Dative, Genitive',
    content: {
      rules: 'Nominative (subject), Accusative (direct object), Dative (indirect object), Genitive (possession)',
      examples: [
        { german: 'Der Mann gibt dem Kind das Buch', english: 'The man gives the child the book' },
        { german: 'Ich sehe den Mann', english: 'I see the man (accusative)' }
      ]
    },
    xpReward: 120,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    type: 'vocabulary',
    title: 'At the Train Station',
    description: 'Travel vocabulary',
    content: {
      words: [
        { word: 'der Bahnhof', translation: 'train station' },
        { word: 'die Fahrkarte', translation: 'ticket' },
        { word: 'der Zug', translation: 'train' },
        { word: 'das Gleis', translation: 'platform' },
        { word: 'abfahren', translation: 'to depart' }
      ]
    },
    xpReward: 85,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    type: 'conversation',
    title: 'Making Small Talk',
    description: 'Casual German conversations',
    content: {
      phrases: [
        { german: 'Wie geht es Ihnen?', english: 'How are you? (formal)' },
        { german: 'Es geht mir gut', english: 'I\'m doing well' },
        { german: 'Was machst du?', english: 'What are you doing?' },
        { german: 'Das Wetter ist schön', english: 'The weather is nice' }
      ]
    },
    xpReward: 90,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    type: 'grammar',
    title: 'Modal Verbs',
    description: 'Können, müssen, wollen, sollen',
    content: {
      rules: 'Modal verbs express ability, necessity, desire. Main verb goes to end.',
      examples: [
        { german: 'Ich kann Deutsch sprechen', english: 'I can speak German' },
        { german: 'Du musst lernen', english: 'You must learn' },
        { german: 'Wir wollen gehen', english: 'We want to go' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    type: 'grammar',
    title: 'Konjunktiv II',
    description: 'Subjunctive mood for hypotheticals',
    content: {
      rules: 'Used for wishes, hypotheticals, polite requests. Often uses würde + infinitive',
      examples: [
        { german: 'Wenn ich reich wäre, würde ich reisen', english: 'If I were rich, I would travel' },
        { german: 'Ich hätte gern ein Bier', english: 'I would like a beer' }
      ]
    },
    xpReward: 150,
    difficulty: 4,
    duration: 600,
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    type: 'vocabulary',
    title: 'Business German',
    description: 'Professional workplace vocabulary',
    content: {
      words: [
        { word: 'das Unternehmen', translation: 'the company' },
        { word: 'der Vertrag', translation: 'the contract' },
        { word: 'die Besprechung', translation: 'the meeting' },
        { word: 'der Termin', translation: 'the appointment' },
        { word: 'die Bewerbung', translation: 'the application' }
      ]
    },
    xpReward: 130,
    difficulty: 4,
    duration: 600,
    isActive: true
  },

  // ITALIAN - Bonus Language
  {
    language: 'italian',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Italian Greetings',
    description: 'Say ciao like a native',
    content: {
      words: [
        { word: 'Ciao', translation: 'Hello/Bye (informal)', pronunciation: 'CHOW' },
        { word: 'Buongiorno', translation: 'Good morning', pronunciation: 'bwon-JOR-no' },
        { word: 'Grazie', translation: 'Thank you', pronunciation: 'GRAHT-see-eh' },
        { word: 'Prego', translation: 'You\'re welcome', pronunciation: 'PREH-go' },
        { word: 'Arrivederci', translation: 'Goodbye', pronunciation: 'ah-ree-veh-DEHR-chee' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    type: 'vocabulary',
    title: 'Italian Food',
    description: 'Essential food vocabulary',
    content: {
      words: [
        { word: 'la pasta', translation: 'pasta' },
        { word: 'la pizza', translation: 'pizza' },
        { word: 'il vino', translation: 'wine' },
        { word: 'l\'acqua', translation: 'water' },
        { word: 'il caffè', translation: 'coffee' }
      ]
    },
    xpReward: 50,
    difficulty: 1,
    duration: 600,
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    type: 'grammar',
    title: 'Italian Present Tense',
    description: 'Regular verb conjugations',
    content: {
      rules: 'ARE: -o, -i, -a, -iamo, -ate, -ano | ERE: -o, -i, -e, -iamo, -ete, -ono',
      examples: [
        { italian: 'Io parlo italiano', english: 'I speak Italian' },
        { italian: 'Tu mangi la pizza', english: 'You eat pizza' },
        { italian: 'Noi viviamo in Italia', english: 'We live in Italy' }
      ]
    },
    xpReward: 100,
    difficulty: 2,
    duration: 600,
    isActive: true
  },
  {
    language: 'italian',
    level: 'advanced',
    type: 'vocabulary',
    title: 'Italian Art and Culture',
    description: 'Discuss Italian culture',
    content: {
      words: [
        { word: 'il museo', translation: 'the museum' },
        { word: 'la galleria', translation: 'the gallery' },
        { word: 'l\'opera', translation: 'the opera' },
        { word: 'il Rinascimento', translation: 'the Renaissance' },
        { word: 'la cultura', translation: 'the culture' }
      ]
    },
    xpReward: 120,
    difficulty: 4,
    duration: 600,
    isActive: true
  }
];

const seedChallenges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing challenges (optional - comment out to keep existing)
    // await DailyChallenge.deleteMany({});
    // console.log('🗑️  Cleared existing challenges');

    // Insert challenges
    const insertedChallenges = await DailyChallenge.insertMany(challenges);
    console.log(`✅ Successfully added ${insertedChallenges.length} challenges to MongoDB`);

    // Show summary
    const spanish = insertedChallenges.filter(c => c.language === 'spanish').length;
    const french = insertedChallenges.filter(c => c.language === 'french').length;
    const german = insertedChallenges.filter(c => c.language === 'german').length;
    const italian = insertedChallenges.filter(c => c.language === 'italian').length;

    console.log('\n📊 Challenge Summary:');
    console.log(`   Spanish: ${spanish}`);
    console.log(`   French: ${french}`);
    console.log(`   German: ${german}`);
    console.log(`   Italian: ${italian}`);
    console.log(`   Total: ${insertedChallenges.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    process.exit(1);
  }
};

seedChallenges();
