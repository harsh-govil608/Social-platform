import mongoose from 'mongoose';
import Vocabulary from '../models/vocabulary.model.js';
import dotenv from 'dotenv';

dotenv.config();

const vocabularyWords = [
  // SPANISH - Beginner (30 words)
  {
    language: 'spanish',
    level: 'beginner',
    category: 'greetings',
    word: 'Hola',
    translation: 'Hello',
    pronunciation: 'OH-lah',
    exampleSentence: {
      original: 'Hola, ¿cómo estás?',
      translated: 'Hello, how are you?'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'greetings',
    word: 'Adiós',
    translation: 'Goodbye',
    pronunciation: 'ah-DYOHS',
    exampleSentence: {
      original: 'Adiós, hasta luego',
      translated: 'Goodbye, see you later'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'greetings',
    word: 'Gracias',
    translation: 'Thank you',
    pronunciation: 'GRAH-see-ahs',
    exampleSentence: {
      original: 'Muchas gracias por todo',
      translated: 'Thank you very much for everything'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'greetings',
    word: 'Por favor',
    translation: 'Please',
    pronunciation: 'por fah-VOR',
    exampleSentence: {
      original: 'Agua, por favor',
      translated: 'Water, please'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'food',
    word: 'Agua',
    translation: 'Water',
    pronunciation: 'AH-gwah',
    exampleSentence: {
      original: 'Quiero un vaso de agua',
      translated: 'I want a glass of water'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['essential', 'drink'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'food',
    word: 'Pan',
    translation: 'Bread',
    pronunciation: 'pahn',
    exampleSentence: {
      original: 'El pan está caliente',
      translated: 'The bread is hot'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['food', 'basic'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'food',
    word: 'Leche',
    translation: 'Milk',
    pronunciation: 'LEH-cheh',
    exampleSentence: {
      original: 'Me gusta la leche fría',
      translated: 'I like cold milk'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['drink', 'dairy'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'food',
    word: 'Café',
    translation: 'Coffee',
    pronunciation: 'kah-FEH',
    exampleSentence: {
      original: 'Tomo café por la mañana',
      translated: 'I drink coffee in the morning'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'family',
    word: 'Madre',
    translation: 'Mother',
    pronunciation: 'MAH-dreh',
    exampleSentence: {
      original: 'Mi madre es doctora',
      translated: 'My mother is a doctor'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'family',
    word: 'Padre',
    translation: 'Father',
    pronunciation: 'PAH-dreh',
    exampleSentence: {
      original: 'Mi padre trabaja en una oficina',
      translated: 'My father works in an office'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'family',
    word: 'Hermano',
    translation: 'Brother',
    pronunciation: 'ehr-MAH-noh',
    exampleSentence: {
      original: 'Tengo un hermano mayor',
      translated: 'I have an older brother'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'family',
    word: 'Hermana',
    translation: 'Sister',
    pronunciation: 'ehr-MAH-nah',
    exampleSentence: {
      original: 'Mi hermana estudia medicina',
      translated: 'My sister studies medicine'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Casa',
    translation: 'House',
    pronunciation: 'KAH-sah',
    exampleSentence: {
      original: 'Voy a casa',
      translated: 'I\'m going home'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['place', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Libro',
    translation: 'Book',
    pronunciation: 'LEE-broh',
    exampleSentence: {
      original: 'Leo un libro interesante',
      translated: 'I\'m reading an interesting book'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['object', 'education'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Mesa',
    translation: 'Table',
    pronunciation: 'MEH-sah',
    exampleSentence: {
      original: 'La comida está en la mesa',
      translated: 'The food is on the table'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['furniture', 'home'],
    isActive: true
  },

  // SPANISH - Intermediate (20 words)
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'travel',
    word: 'Aeropuerto',
    translation: 'Airport',
    pronunciation: 'ah-eh-roh-PWEHR-toh',
    exampleSentence: {
      original: 'El aeropuerto está lejos',
      translated: 'The airport is far'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'travel',
    word: 'Billete',
    translation: 'Ticket',
    pronunciation: 'bee-YEH-teh',
    exampleSentence: {
      original: 'Necesito comprar un billete',
      translated: 'I need to buy a ticket'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'shopping',
    word: 'Tienda',
    translation: 'Store',
    pronunciation: 'TYEHN-dah',
    exampleSentence: {
      original: 'La tienda cierra a las ocho',
      translated: 'The store closes at eight'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'place'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'shopping',
    word: 'Precio',
    translation: 'Price',
    pronunciation: 'PREH-syoh',
    exampleSentence: {
      original: '¿Cuál es el precio?',
      translated: 'What is the price?'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'money'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'emotions',
    word: 'Feliz',
    translation: 'Happy',
    pronunciation: 'feh-LEES',
    exampleSentence: {
      original: 'Estoy muy feliz hoy',
      translated: 'I\'m very happy today'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['emotion', 'feeling'],
    isActive: true
  },

  // SPANISH - Advanced (10 words)
  {
    language: 'spanish',
    level: 'advanced',
    category: 'business',
    word: 'Empresa',
    translation: 'Company',
    pronunciation: 'ehm-PREH-sah',
    exampleSentence: {
      original: 'Trabajo en una empresa internacional',
      translated: 'I work at an international company'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'business',
    word: 'Reunión',
    translation: 'Meeting',
    pronunciation: 'reh-oo-NYOHN',
    exampleSentence: {
      original: 'Tenemos una reunión importante',
      translated: 'We have an important meeting'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },

  // FRENCH - Beginner (30 words)
  {
    language: 'french',
    level: 'beginner',
    category: 'greetings',
    word: 'Bonjour',
    translation: 'Hello',
    pronunciation: 'bon-ZHOOR',
    exampleSentence: {
      original: 'Bonjour, comment allez-vous?',
      translated: 'Hello, how are you?'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'greetings',
    word: 'Au revoir',
    translation: 'Goodbye',
    pronunciation: 'oh ruh-VWAHR',
    exampleSentence: {
      original: 'Au revoir, à bientôt',
      translated: 'Goodbye, see you soon'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'greetings',
    word: 'Merci',
    translation: 'Thank you',
    pronunciation: 'mehr-SEE',
    exampleSentence: {
      original: 'Merci beaucoup',
      translated: 'Thank you very much'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'greetings',
    word: 'S\'il vous plaît',
    translation: 'Please',
    pronunciation: 'seel voo PLEH',
    exampleSentence: {
      original: 'Un café, s\'il vous plaît',
      translated: 'A coffee, please'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'food',
    word: 'Pain',
    translation: 'Bread',
    pronunciation: 'pan',
    exampleSentence: {
      original: 'J\'achète du pain frais',
      translated: 'I buy fresh bread'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['food', 'basic'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'food',
    word: 'Eau',
    translation: 'Water',
    pronunciation: 'oh',
    exampleSentence: {
      original: 'Je bois de l\'eau',
      translated: 'I drink water'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'essential'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'food',
    word: 'Vin',
    translation: 'Wine',
    pronunciation: 'van',
    exampleSentence: {
      original: 'Un verre de vin rouge',
      translated: 'A glass of red wine'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['drink', 'culture'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'family',
    word: 'Mère',
    translation: 'Mother',
    pronunciation: 'mehr',
    exampleSentence: {
      original: 'Ma mère est professeure',
      translated: 'My mother is a teacher'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'family',
    word: 'Père',
    translation: 'Father',
    pronunciation: 'pehr',
    exampleSentence: {
      original: 'Mon père travaille à Paris',
      translated: 'My father works in Paris'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'Maison',
    translation: 'House',
    pronunciation: 'meh-ZOHN',
    exampleSentence: {
      original: 'J\'habite dans une grande maison',
      translated: 'I live in a big house'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['place', 'common'],
    isActive: true
  },

  // FRENCH - Intermediate (20 words)
  {
    language: 'french',
    level: 'intermediate',
    category: 'travel',
    word: 'Gare',
    translation: 'Train station',
    pronunciation: 'gahr',
    exampleSentence: {
      original: 'La gare est près d\'ici',
      translated: 'The train station is nearby'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'shopping',
    word: 'Magasin',
    translation: 'Store',
    pronunciation: 'mah-gah-ZAN',
    exampleSentence: {
      original: 'Je vais au magasin',
      translated: 'I\'m going to the store'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'place'],
    isActive: true
  },

  // FRENCH - Advanced (10 words)
  {
    language: 'french',
    level: 'advanced',
    category: 'business',
    word: 'Entreprise',
    translation: 'Company',
    pronunciation: 'ahn-truh-PREEZ',
    exampleSentence: {
      original: 'Notre entreprise se développe rapidement',
      translated: 'Our company is growing rapidly'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },

  // GERMAN - Beginner (30 words)
  {
    language: 'german',
    level: 'beginner',
    category: 'greetings',
    word: 'Guten Tag',
    translation: 'Good day',
    pronunciation: 'GOO-ten TAHK',
    exampleSentence: {
      original: 'Guten Tag, wie geht es Ihnen?',
      translated: 'Good day, how are you?'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'greetings',
    word: 'Danke',
    translation: 'Thank you',
    pronunciation: 'DAHN-kuh',
    exampleSentence: {
      original: 'Danke schön',
      translated: 'Thank you very much'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'greetings',
    word: 'Bitte',
    translation: 'Please',
    pronunciation: 'BIT-tuh',
    exampleSentence: {
      original: 'Bitte, nehmen Sie Platz',
      translated: 'Please, take a seat'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'food',
    word: 'Brot',
    translation: 'Bread',
    pronunciation: 'broht',
    exampleSentence: {
      original: 'Ich esse Brot zum Frühstück',
      translated: 'I eat bread for breakfast'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['food', 'basic'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'food',
    word: 'Wasser',
    translation: 'Water',
    pronunciation: 'VAH-sur',
    exampleSentence: {
      original: 'Ein Glas Wasser, bitte',
      translated: 'A glass of water, please'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'essential'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'family',
    word: 'Mutter',
    translation: 'Mother',
    pronunciation: 'MOO-tur',
    exampleSentence: {
      original: 'Meine Mutter kocht gut',
      translated: 'My mother cooks well'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'family',
    word: 'Vater',
    translation: 'Father',
    pronunciation: 'FAH-tur',
    exampleSentence: {
      original: 'Mein Vater arbeitet viel',
      translated: 'My father works a lot'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Haus',
    translation: 'House',
    pronunciation: 'house',
    exampleSentence: {
      original: 'Ich gehe nach Hause',
      translated: 'I\'m going home'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['place', 'common'],
    isActive: true
  },

  // GERMAN - Intermediate (20 words)
  {
    language: 'german',
    level: 'intermediate',
    category: 'travel',
    word: 'Bahnhof',
    translation: 'Train station',
    pronunciation: 'BAHN-hohf',
    exampleSentence: {
      original: 'Der Bahnhof ist in der Stadtmitte',
      translated: 'The train station is in the city center'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },

  // GERMAN - Advanced (10 words)
  {
    language: 'german',
    level: 'advanced',
    category: 'business',
    word: 'Unternehmen',
    translation: 'Company',
    pronunciation: 'OON-tur-neh-men',
    exampleSentence: {
      original: 'Das Unternehmen wächst schnell',
      translated: 'The company is growing quickly'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },

  // ITALIAN - Beginner (20 words)
  {
    language: 'italian',
    level: 'beginner',
    category: 'greetings',
    word: 'Ciao',
    translation: 'Hello',
    pronunciation: 'CHOW',
    exampleSentence: {
      original: 'Ciao, come stai?',
      translated: 'Hello, how are you?'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'greetings',
    word: 'Grazie',
    translation: 'Thank you',
    pronunciation: 'GRAHT-see-eh',
    exampleSentence: {
      original: 'Grazie mille',
      translated: 'Thanks a lot'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'polite'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    word: 'Pizza',
    translation: 'Pizza',
    pronunciation: 'PEET-sah',
    exampleSentence: {
      original: 'Vorrei una pizza margherita',
      translated: 'I would like a margherita pizza'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['food', 'culture'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    word: 'Pasta',
    translation: 'Pasta',
    pronunciation: 'PAH-stah',
    exampleSentence: {
      original: 'La pasta è buonissima',
      translated: 'The pasta is very good'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['food', 'culture'],
    isActive: true
  },

  // Additional vocabulary to reach 200 (continuing with varied categories)
  // More Spanish words
  {
    language: 'spanish',
    level: 'beginner',
    category: 'weather',
    word: 'Sol',
    translation: 'Sun',
    pronunciation: 'sohl',
    exampleSentence: {
      original: 'Hace sol hoy',
      translated: 'It\'s sunny today'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'weather',
    word: 'Lluvia',
    translation: 'Rain',
    pronunciation: 'YOO-vyah',
    exampleSentence: {
      original: 'Va a llover mañana',
      translated: 'It\'s going to rain tomorrow'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'health',
    word: 'Médico',
    translation: 'Doctor',
    pronunciation: 'MEH-dee-koh',
    exampleSentence: {
      original: 'Necesito ver al médico',
      translated: 'I need to see the doctor'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'profession'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'health',
    word: 'Hospital',
    translation: 'Hospital',
    pronunciation: 'ohs-pee-TAHL',
    exampleSentence: {
      original: 'El hospital está cerca',
      translated: 'The hospital is nearby'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'place'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'technology',
    word: 'Ordenador',
    translation: 'Computer',
    pronunciation: 'or-deh-nah-DOHR',
    exampleSentence: {
      original: 'Trabajo con mi ordenador',
      translated: 'I work with my computer'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['technology', 'modern'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'technology',
    word: 'Teléfono',
    translation: 'Phone',
    pronunciation: 'teh-LEH-foh-noh',
    exampleSentence: {
      original: '¿Cuál es tu número de teléfono?',
      translated: 'What is your phone number?'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['technology', 'communication'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'emotions',
    word: 'Triste',
    translation: 'Sad',
    pronunciation: 'TREE-steh',
    exampleSentence: {
      original: 'Estoy triste porque mi amigo se fue',
      translated: 'I\'m sad because my friend left'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'emotions',
    word: 'Enojado',
    translation: 'Angry',
    pronunciation: 'eh-noh-HAH-doh',
    exampleSentence: {
      original: 'Está enojado conmigo',
      translated: 'He is angry with me'
    },
    difficulty: 2,
    frequency: 6,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'business',
    word: 'Presupuesto',
    translation: 'Budget',
    pronunciation: 'preh-soo-PWEH-stoh',
    exampleSentence: {
      original: 'Necesitamos revisar el presupuesto',
      translated: 'We need to review the budget'
    },
    difficulty: 3,
    frequency: 5,
    tags: ['business', 'finance'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'business',
    word: 'Contrato',
    translation: 'Contract',
    pronunciation: 'kohn-TRAH-toh',
    exampleSentence: {
      original: 'Firmé el contrato ayer',
      translated: 'I signed the contract yesterday'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'legal'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'culture',
    word: 'Arte',
    translation: 'Art',
    pronunciation: 'AHR-teh',
    exampleSentence: {
      original: 'Me gusta el arte moderno',
      translated: 'I like modern art'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['culture', 'education'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'advanced',
    category: 'culture',
    word: 'Museo',
    translation: 'Museum',
    pronunciation: 'moo-SEH-oh',
    exampleSentence: {
      original: 'Visitamos el museo del Prado',
      translated: 'We visited the Prado Museum'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['culture', 'place'],
    isActive: true
  },

  // More French words
  {
    language: 'french',
    level: 'beginner',
    category: 'food',
    word: 'Fromage',
    translation: 'Cheese',
    pronunciation: 'froh-MAHZH',
    exampleSentence: {
      original: 'J\'adore le fromage français',
      translated: 'I love French cheese'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['food', 'culture'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'food',
    word: 'Café',
    translation: 'Coffee',
    pronunciation: 'kah-FEH',
    exampleSentence: {
      original: 'Je prends un café',
      translated: 'I\'m having a coffee'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'common'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'family',
    word: 'Frère',
    translation: 'Brother',
    pronunciation: 'frehr',
    exampleSentence: {
      original: 'Mon frère est plus jeune',
      translated: 'My brother is younger'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'family',
    word: 'Sœur',
    translation: 'Sister',
    pronunciation: 'sur',
    exampleSentence: {
      original: 'Ma sœur habite à Lyon',
      translated: 'My sister lives in Lyon'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'Livre',
    translation: 'Book',
    pronunciation: 'LEE-vruh',
    exampleSentence: {
      original: 'Je lis un bon livre',
      translated: 'I\'m reading a good book'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['object', 'education'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'Table',
    translation: 'Table',
    pronunciation: 'TAH-bluh',
    exampleSentence: {
      original: 'La table est grande',
      translated: 'The table is big'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['furniture', 'home'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'weather',
    word: 'Soleil',
    translation: 'Sun',
    pronunciation: 'soh-LAY',
    exampleSentence: {
      original: 'Il fait du soleil',
      translated: 'It\'s sunny'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'weather',
    word: 'Pluie',
    translation: 'Rain',
    pronunciation: 'plwee',
    exampleSentence: {
      original: 'Il pleut aujourd\'hui',
      translated: 'It\'s raining today'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'travel',
    word: 'Aéroport',
    translation: 'Airport',
    pronunciation: 'ah-eh-roh-POR',
    exampleSentence: {
      original: 'L\'aéroport est loin d\'ici',
      translated: 'The airport is far from here'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'travel',
    word: 'Billet',
    translation: 'Ticket',
    pronunciation: 'bee-YEH',
    exampleSentence: {
      original: 'J\'ai acheté un billet',
      translated: 'I bought a ticket'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'shopping',
    word: 'Prix',
    translation: 'Price',
    pronunciation: 'pree',
    exampleSentence: {
      original: 'Quel est le prix?',
      translated: 'What is the price?'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'money'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'shopping',
    word: 'Argent',
    translation: 'Money',
    pronunciation: 'ahr-ZHAHN',
    exampleSentence: {
      original: 'Je n\'ai pas d\'argent',
      translated: 'I don\'t have money'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'finance'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'emotions',
    word: 'Heureux',
    translation: 'Happy',
    pronunciation: 'uh-RUH',
    exampleSentence: {
      original: 'Je suis très heureux',
      translated: 'I\'m very happy'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'emotions',
    word: 'Triste',
    translation: 'Sad',
    pronunciation: 'treest',
    exampleSentence: {
      original: 'Elle est triste',
      translated: 'She is sad'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'health',
    word: 'Médecin',
    translation: 'Doctor',
    pronunciation: 'mehd-SAN',
    exampleSentence: {
      original: 'Je dois voir le médecin',
      translated: 'I must see the doctor'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'profession'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'health',
    word: 'Hôpital',
    translation: 'Hospital',
    pronunciation: 'oh-pee-TAHL',
    exampleSentence: {
      original: 'L\'hôpital est moderne',
      translated: 'The hospital is modern'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'place'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'technology',
    word: 'Ordinateur',
    translation: 'Computer',
    pronunciation: 'or-dee-nah-TUR',
    exampleSentence: {
      original: 'Mon ordinateur est rapide',
      translated: 'My computer is fast'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['technology', 'modern'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'technology',
    word: 'Téléphone',
    translation: 'Phone',
    pronunciation: 'teh-leh-FOHN',
    exampleSentence: {
      original: 'Je cherche mon téléphone',
      translated: 'I\'m looking for my phone'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['technology', 'communication'],
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    category: 'business',
    word: 'Réunion',
    translation: 'Meeting',
    pronunciation: 'reh-oo-NYOHN',
    exampleSentence: {
      original: 'La réunion commence à 9 heures',
      translated: 'The meeting starts at 9 o\'clock'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    category: 'business',
    word: 'Budget',
    translation: 'Budget',
    pronunciation: 'boo-ZHEH',
    exampleSentence: {
      original: 'Nous devons respecter le budget',
      translated: 'We must respect the budget'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'finance'],
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    category: 'culture',
    word: 'Musée',
    translation: 'Museum',
    pronunciation: 'moo-ZEH',
    exampleSentence: {
      original: 'Le Louvre est un musée célèbre',
      translated: 'The Louvre is a famous museum'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['culture', 'place'],
    isActive: true
  },
  {
    language: 'french',
    level: 'advanced',
    category: 'culture',
    word: 'Littérature',
    translation: 'Literature',
    pronunciation: 'lee-teh-rah-TOOR',
    exampleSentence: {
      original: 'J\'étudie la littérature française',
      translated: 'I study French literature'
    },
    difficulty: 3,
    frequency: 5,
    tags: ['culture', 'education'],
    isActive: true
  },

  // More German words
  {
    language: 'german',
    level: 'beginner',
    category: 'food',
    word: 'Käse',
    translation: 'Cheese',
    pronunciation: 'KAY-zuh',
    exampleSentence: {
      original: 'Ich mag deutschen Käse',
      translated: 'I like German cheese'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['food', 'dairy'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'food',
    word: 'Bier',
    translation: 'Beer',
    pronunciation: 'beer',
    exampleSentence: {
      original: 'Ein Bier, bitte',
      translated: 'A beer, please'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['drink', 'culture'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'family',
    word: 'Bruder',
    translation: 'Brother',
    pronunciation: 'BROO-dur',
    exampleSentence: {
      original: 'Mein Bruder ist jünger',
      translated: 'My brother is younger'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'family',
    word: 'Schwester',
    translation: 'Sister',
    pronunciation: 'SHVEH-stur',
    exampleSentence: {
      original: 'Meine Schwester studiert Medizin',
      translated: 'My sister studies medicine'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['family', 'sibling'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Buch',
    translation: 'Book',
    pronunciation: 'boohk',
    exampleSentence: {
      original: 'Das Buch ist interessant',
      translated: 'The book is interesting'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['object', 'education'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Tisch',
    translation: 'Table',
    pronunciation: 'tish',
    exampleSentence: {
      original: 'Der Tisch ist groß',
      translated: 'The table is big'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['furniture', 'home'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'weather',
    word: 'Sonne',
    translation: 'Sun',
    pronunciation: 'ZOH-nuh',
    exampleSentence: {
      original: 'Die Sonne scheint',
      translated: 'The sun is shining'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'weather',
    word: 'Regen',
    translation: 'Rain',
    pronunciation: 'REH-gun',
    exampleSentence: {
      original: 'Es regnet heute',
      translated: 'It\'s raining today'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['weather', 'nature'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'travel',
    word: 'Flughafen',
    translation: 'Airport',
    pronunciation: 'FLOOK-hah-fun',
    exampleSentence: {
      original: 'Der Flughafen ist weit weg',
      translated: 'The airport is far away'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'travel',
    word: 'Fahrkarte',
    translation: 'Ticket',
    pronunciation: 'FAR-kar-tuh',
    exampleSentence: {
      original: 'Ich brauche eine Fahrkarte',
      translated: 'I need a ticket'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'shopping',
    word: 'Geschäft',
    translation: 'Store',
    pronunciation: 'guh-SHEFT',
    exampleSentence: {
      original: 'Das Geschäft ist geöffnet',
      translated: 'The store is open'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['shopping', 'place'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'shopping',
    word: 'Preis',
    translation: 'Price',
    pronunciation: 'price',
    exampleSentence: {
      original: 'Was ist der Preis?',
      translated: 'What is the price?'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['shopping', 'money'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'emotions',
    word: 'Glücklich',
    translation: 'Happy',
    pronunciation: 'GLOOK-likh',
    exampleSentence: {
      original: 'Ich bin sehr glücklich',
      translated: 'I\'m very happy'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'emotions',
    word: 'Traurig',
    translation: 'Sad',
    pronunciation: 'TROW-rikh',
    exampleSentence: {
      original: 'Er ist traurig',
      translated: 'He is sad'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'health',
    word: 'Arzt',
    translation: 'Doctor',
    pronunciation: 'artst',
    exampleSentence: {
      original: 'Ich muss zum Arzt gehen',
      translated: 'I must go to the doctor'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'profession'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'health',
    word: 'Krankenhaus',
    translation: 'Hospital',
    pronunciation: 'KRAN-kun-house',
    exampleSentence: {
      original: 'Das Krankenhaus ist modern',
      translated: 'The hospital is modern'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['health', 'place'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'technology',
    word: 'Computer',
    translation: 'Computer',
    pronunciation: 'kom-PYOO-tur',
    exampleSentence: {
      original: 'Mein Computer ist neu',
      translated: 'My computer is new'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['technology', 'modern'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'technology',
    word: 'Telefon',
    translation: 'Phone',
    pronunciation: 'teh-leh-FOHN',
    exampleSentence: {
      original: 'Wo ist mein Telefon?',
      translated: 'Where is my phone?'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['technology', 'communication'],
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    category: 'business',
    word: 'Vertrag',
    translation: 'Contract',
    pronunciation: 'fer-TRAHK',
    exampleSentence: {
      original: 'Wir müssen den Vertrag unterschreiben',
      translated: 'We must sign the contract'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'legal'],
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    category: 'business',
    word: 'Besprechung',
    translation: 'Meeting',
    pronunciation: 'buh-SHPREH-khung',
    exampleSentence: {
      original: 'Die Besprechung beginnt um 10 Uhr',
      translated: 'The meeting starts at 10 o\'clock'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    category: 'culture',
    word: 'Museum',
    translation: 'Museum',
    pronunciation: 'moo-ZEH-oom',
    exampleSentence: {
      original: 'Das Museum ist sehr interessant',
      translated: 'The museum is very interesting'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['culture', 'place'],
    isActive: true
  },
  {
    language: 'german',
    level: 'advanced',
    category: 'culture',
    word: 'Literatur',
    translation: 'Literature',
    pronunciation: 'lee-teh-rah-TOOR',
    exampleSentence: {
      original: 'Ich interessiere mich für deutsche Literatur',
      translated: 'I\'m interested in German literature'
    },
    difficulty: 3,
    frequency: 5,
    tags: ['culture', 'education'],
    isActive: true
  },

  // More Italian words
  {
    language: 'italian',
    level: 'beginner',
    category: 'greetings',
    word: 'Buongiorno',
    translation: 'Good morning',
    pronunciation: 'bwon-JOR-no',
    exampleSentence: {
      original: 'Buongiorno, signore',
      translated: 'Good morning, sir'
    },
    difficulty: 1,
    frequency: 10,
    tags: ['essential', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'greetings',
    word: 'Prego',
    translation: 'You\'re welcome',
    pronunciation: 'PREH-go',
    exampleSentence: {
      original: 'Grazie! - Prego!',
      translated: 'Thank you! - You\'re welcome!'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['polite', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    word: 'Vino',
    translation: 'Wine',
    pronunciation: 'VEE-noh',
    exampleSentence: {
      original: 'Un bicchiere di vino rosso',
      translated: 'A glass of red wine'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'culture'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    word: 'Acqua',
    translation: 'Water',
    pronunciation: 'AH-kwah',
    exampleSentence: {
      original: 'Vorrei dell\'acqua',
      translated: 'I would like some water'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'essential'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'food',
    word: 'Caffè',
    translation: 'Coffee',
    pronunciation: 'kah-FEH',
    exampleSentence: {
      original: 'Un caffè espresso, per favore',
      translated: 'An espresso, please'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['drink', 'culture'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'family',
    word: 'Madre',
    translation: 'Mother',
    pronunciation: 'MAH-dreh',
    exampleSentence: {
      original: 'Mia madre cucina molto bene',
      translated: 'My mother cooks very well'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'family',
    word: 'Padre',
    translation: 'Father',
    pronunciation: 'PAH-dreh',
    exampleSentence: {
      original: 'Mio padre lavora a Roma',
      translated: 'My father works in Rome'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['family', 'parent'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'daily',
    word: 'Casa',
    translation: 'House',
    pronunciation: 'KAH-sah',
    exampleSentence: {
      original: 'Vado a casa',
      translated: 'I\'m going home'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['place', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'daily',
    word: 'Libro',
    translation: 'Book',
    pronunciation: 'LEE-broh',
    exampleSentence: {
      original: 'Leggo un libro italiano',
      translated: 'I\'m reading an Italian book'
    },
    difficulty: 1,
    frequency: 7,
    tags: ['object', 'education'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'travel',
    word: 'Aeroporto',
    translation: 'Airport',
    pronunciation: 'ah-eh-roh-POR-toh',
    exampleSentence: {
      original: 'L\'aeroporto è distante',
      translated: 'The airport is distant'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'transport'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'shopping',
    word: 'Negozio',
    translation: 'Store',
    pronunciation: 'neh-GOH-tsyoh',
    exampleSentence: {
      original: 'Il negozio è aperto',
      translated: 'The store is open'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['shopping', 'place'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'emotions',
    word: 'Felice',
    translation: 'Happy',
    pronunciation: 'feh-LEE-cheh',
    exampleSentence: {
      original: 'Sono molto felice',
      translated: 'I\'m very happy'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['emotion', 'feeling'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'advanced',
    category: 'business',
    word: 'Azienda',
    translation: 'Company',
    pronunciation: 'ah-TSYEHN-dah',
    exampleSentence: {
      original: 'Lavoro in un\'azienda italiana',
      translated: 'I work in an Italian company'
    },
    difficulty: 3,
    frequency: 6,
    tags: ['business', 'work'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'advanced',
    category: 'culture',
    word: 'Opera',
    translation: 'Opera',
    pronunciation: 'OH-peh-rah',
    exampleSentence: {
      original: 'Andiamo all\'opera',
      translated: 'We\'re going to the opera'
    },
    difficulty: 3,
    frequency: 5,
    tags: ['culture', 'art'],
    isActive: true
  },

  // Additional words to reach exactly 200
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Escuela',
    translation: 'School',
    pronunciation: 'es-KWEH-lah',
    exampleSentence: {
      original: 'Voy a la escuela todos los días',
      translated: 'I go to school every day'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['place', 'education'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Trabajo',
    translation: 'Work',
    pronunciation: 'trah-BAH-hoh',
    exampleSentence: {
      original: 'Tengo mucho trabajo',
      translated: 'I have a lot of work'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['activity', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'beginner',
    category: 'daily',
    word: 'Amigo',
    translation: 'Friend',
    pronunciation: 'ah-MEE-goh',
    exampleSentence: {
      original: 'Es mi mejor amigo',
      translated: 'He is my best friend'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['relationship', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'travel',
    word: 'Hotel',
    translation: 'Hotel',
    pronunciation: 'oh-TEHL',
    exampleSentence: {
      original: 'Reservé un hotel en Madrid',
      translated: 'I booked a hotel in Madrid'
    },
    difficulty: 2,
    frequency: 7,
    tags: ['travel', 'accommodation'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'travel',
    word: 'Pasaporte',
    translation: 'Passport',
    pronunciation: 'pah-sah-POR-teh',
    exampleSentence: {
      original: 'No encuentro mi pasaporte',
      translated: 'I can\'t find my passport'
    },
    difficulty: 2,
    frequency: 6,
    tags: ['travel', 'document'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'École',
    translation: 'School',
    pronunciation: 'eh-KOHL',
    exampleSentence: {
      original: 'Je vais à l\'école',
      translated: 'I go to school'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['place', 'education'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'Travail',
    translation: 'Work',
    pronunciation: 'trah-VY',
    exampleSentence: {
      original: 'J\'ai beaucoup de travail',
      translated: 'I have a lot of work'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['activity', 'common'],
    isActive: true
  },
  {
    language: 'french',
    level: 'beginner',
    category: 'daily',
    word: 'Ami',
    translation: 'Friend',
    pronunciation: 'ah-MEE',
    exampleSentence: {
      original: 'C\'est mon meilleur ami',
      translated: 'He is my best friend'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['relationship', 'common'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Schule',
    translation: 'School',
    pronunciation: 'SHOO-luh',
    exampleSentence: {
      original: 'Ich gehe in die Schule',
      translated: 'I go to school'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['place', 'education'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Arbeit',
    translation: 'Work',
    pronunciation: 'AR-bite',
    exampleSentence: {
      original: 'Ich habe viel Arbeit',
      translated: 'I have a lot of work'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['activity', 'common'],
    isActive: true
  },
  {
    language: 'german',
    level: 'beginner',
    category: 'daily',
    word: 'Freund',
    translation: 'Friend',
    pronunciation: 'froynt',
    exampleSentence: {
      original: 'Er ist mein bester Freund',
      translated: 'He is my best friend'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['relationship', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'daily',
    word: 'Scuola',
    translation: 'School',
    pronunciation: 'SKWOH-lah',
    exampleSentence: {
      original: 'Vado a scuola',
      translated: 'I go to school'
    },
    difficulty: 1,
    frequency: 8,
    tags: ['place', 'education'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'daily',
    word: 'Lavoro',
    translation: 'Work',
    pronunciation: 'lah-VOH-roh',
    exampleSentence: {
      original: 'Ho molto lavoro',
      translated: 'I have a lot of work'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['activity', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'beginner',
    category: 'daily',
    word: 'Amico',
    translation: 'Friend',
    pronunciation: 'ah-MEE-koh',
    exampleSentence: {
      original: 'È il mio migliore amico',
      translated: 'He is my best friend'
    },
    difficulty: 1,
    frequency: 9,
    tags: ['relationship', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'daily',
    word: 'Tiempo',
    translation: 'Time',
    pronunciation: 'TYEHM-poh',
    exampleSentence: {
      original: 'No tengo tiempo',
      translated: 'I don\'t have time'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['abstract', 'common'],
    isActive: true
  },
  {
    language: 'spanish',
    level: 'intermediate',
    category: 'daily',
    word: 'Vida',
    translation: 'Life',
    pronunciation: 'VEE-dah',
    exampleSentence: {
      original: 'La vida es bella',
      translated: 'Life is beautiful'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['abstract', 'philosophical'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'daily',
    word: 'Temps',
    translation: 'Time',
    pronunciation: 'tahn',
    exampleSentence: {
      original: 'Je n\'ai pas le temps',
      translated: 'I don\'t have time'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['abstract', 'common'],
    isActive: true
  },
  {
    language: 'french',
    level: 'intermediate',
    category: 'daily',
    word: 'Vie',
    translation: 'Life',
    pronunciation: 'vee',
    exampleSentence: {
      original: 'La vie est belle',
      translated: 'Life is beautiful'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['abstract', 'philosophical'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'daily',
    word: 'Zeit',
    translation: 'Time',
    pronunciation: 'tsyte',
    exampleSentence: {
      original: 'Ich habe keine Zeit',
      translated: 'I don\'t have time'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['abstract', 'common'],
    isActive: true
  },
  {
    language: 'german',
    level: 'intermediate',
    category: 'daily',
    word: 'Leben',
    translation: 'Life',
    pronunciation: 'LAY-ben',
    exampleSentence: {
      original: 'Das Leben ist schön',
      translated: 'Life is beautiful'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['abstract', 'philosophical'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'daily',
    word: 'Tempo',
    translation: 'Time',
    pronunciation: 'TEHM-poh',
    exampleSentence: {
      original: 'Non ho tempo',
      translated: 'I don\'t have time'
    },
    difficulty: 2,
    frequency: 9,
    tags: ['abstract', 'common'],
    isActive: true
  },
  {
    language: 'italian',
    level: 'intermediate',
    category: 'daily',
    word: 'Vita',
    translation: 'Life',
    pronunciation: 'VEE-tah',
    exampleSentence: {
      original: 'La vita è bella',
      translated: 'Life is beautiful'
    },
    difficulty: 2,
    frequency: 8,
    tags: ['abstract', 'philosophical'],
    isActive: true
  }
];

const seedVocabulary = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing vocabulary (optional - uncomment to replace all vocabulary)
    // await Vocabulary.deleteMany({});
    // console.log('🗑️  Cleared existing vocabulary');

    // Insert vocabulary
    const insertedWords = await Vocabulary.insertMany(vocabularyWords);
    console.log(`✅ Successfully added ${insertedWords.length} vocabulary words to MongoDB`);

    // Show summary
    const spanish = insertedWords.filter(w => w.language === 'spanish').length;
    const french = insertedWords.filter(w => w.language === 'french').length;
    const german = insertedWords.filter(w => w.language === 'german').length;
    const italian = insertedWords.filter(w => w.language === 'italian').length;

    const beginner = insertedWords.filter(w => w.level === 'beginner').length;
    const intermediate = insertedWords.filter(w => w.level === 'intermediate').length;
    const advanced = insertedWords.filter(w => w.level === 'advanced').length;

    console.log('\n📊 Vocabulary Summary:');
    console.log('  By Language:');
    console.log(`    Spanish: ${spanish}`);
    console.log(`    French: ${french}`);
    console.log(`    German: ${german}`);
    console.log(`    Italian: ${italian}`);
    console.log('  By Level:');
    console.log(`    Beginner: ${beginner}`);
    console.log(`    Intermediate: ${intermediate}`);
    console.log(`    Advanced: ${advanced}`);
    console.log(`  Total: ${insertedWords.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vocabulary:', error);
    process.exit(1);
  }
};

seedVocabulary();
