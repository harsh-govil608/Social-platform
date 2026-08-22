import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  TrophyIcon, 
  UsersIcon, 
  SparklesIcon,
  RocketIcon,
  StarIcon,
  CalendarIcon,
  FlameIcon,
  TargetIcon,
  HeadphonesIcon,
  VideoIcon,
  MessageSquareIcon,
  GlobeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  LockIcon,
  ClockIcon,
  TrendingUpIcon,
  ZapIcon,
  PlusIcon
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { LANGUAGES } from "../constants";
import {
  getLearningProgress,
  completeLesson,
  getDailyChallenges,
  completeDailyChallenge,
  getSuggestedPartners,
  updateLearningPath,
  addVocabularyWord,
  getAchievements,
  recordPracticeSession
} from "../lib/api";
import PronunciationPractice from "../components/PronunciationPractice";
import GrammarExercises from "../components/GrammarExercises";
import DynamicConversation from "../components/DynamicConversation";

const LanguageJourneyPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", translation: "" });
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  // activeLesson: { pathName, modIdx, cardIdx, picks, phase:'playing'|'result' }
  const [activeLesson, setActiveLesson] = useState(null);

  // Fetch learning progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["learningProgress"],
    queryFn: getLearningProgress
  });

  // Fetch daily challenges
  const { data: dailyChallenges = [], refetch: refetchChallenges } = useQuery({
    queryKey: ["dailyChallenges"],
    queryFn: getDailyChallenges
  });

  // Fetch suggested partners
  const { data: suggestedPartners = [] } = useQuery({
    queryKey: ["suggestedPartners"],
    queryFn: getSuggestedPartners
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements
  });

  // Complete lesson mutation
  const { mutate: completeLessonMutation } = useMutation({
    mutationFn: ({ lessonId, xpEarned }) => completeLesson(lessonId, xpEarned),
    onSuccess: (data) => {
      toast.success(`Lesson completed! +${data.xpResult.xpAdded} XP`);
      if (data.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${data.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      queryClient.invalidateQueries(["learningProgress"]);
      setPlayingVideo(null);
    }
  });

  // Complete challenge mutation
  const { mutate: completeChallengeMutation } = useMutation({
    mutationFn: completeDailyChallenge,
    onSuccess: (data) => {
      toast.success(`Challenge completed! +${data.xpResult.xpAdded} XP`);
      queryClient.invalidateQueries(["learningProgress"]);
      queryClient.invalidateQueries(["dailyChallenges"]);
    }
  });

  // Update learning path mutation
  const { mutate: updatePathMutation, isPending: pathUpdating } = useMutation({
    mutationFn: updateLearningPath,
    onSuccess: () => {
      toast.success("Module completed! +20 XP");
      queryClient.invalidateQueries(["learningProgress"]);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update path")
  });

  // Add vocabulary word mutation
  const { mutate: addVocabMutation } = useMutation({
    mutationFn: ({ word, translation }) => 
      addVocabularyWord(word, translation, authUser?.learningLanguage),
    onSuccess: (data) => {
      toast.success(`Word added! +${data.xpResult.xpAdded} XP`);
      queryClient.invalidateQueries(["learningProgress"]);
      setShowVocabModal(false);
      setNewWord({ word: "", translation: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add word");
    }
  });

  // Sample video lessons data
  const videoLessons = [
    {
      id: "lesson-1",
      title: "Basic Greetings & Introductions",
      thumbnail: "https://img.youtube.com/vi/7xQMz1DgRaU/maxresdefault.jpg",
      duration: "5:30",
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/7xQMz1DgRaU",
      description: "Learn essential greetings and how to introduce yourself",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-1"),
      xp: 50
    },
    {
      id: "lesson-2",
      title: "Daily Conversations",
      thumbnail: "https://img.youtube.com/vi/aNdWL7NJ5Cs/maxresdefault.jpg",
      duration: "8:45",
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/aNdWL7NJ5Cs",
      description: "Master everyday conversations with native speakers",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-2"),
      xp: 75
    },
    {
      id: "lesson-3",
      title: "Shopping & Directions",
      thumbnail: "https://img.youtube.com/vi/fNMd0R1xFsk/maxresdefault.jpg",
      duration: "10:20",
      level: "Intermediate",
      videoUrl: "https://www.youtube.com/embed/fNMd0R1xFsk",
      description: "Navigate shops and ask for directions confidently",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-3"),
      xp: 100
    },
    {
      id: "lesson-4",
      title: "Business Communication",
      thumbnail: "https://img.youtube.com/vi/cFOm7aURcSU/maxresdefault.jpg",
      duration: "12:15",
      level: "Advanced",
      videoUrl: "https://www.youtube.com/embed/cFOm7aURcSU",
      description: "Professional language for business settings",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-4"),
      locked: progress?.completedLessons?.length < 2,
      xp: 150
    }
  ];

  const TOTAL_MODULES = 6;

  // Learning paths with real progress — all normalised to 6 modules
  const learningPaths = [
    {
      name: "Tourist Essentials",
      icon: <GlobeIcon className="w-6 h-6" />,
      progress: Math.min(progress?.learningPaths?.find(p => p.pathName === "Tourist Essentials")?.progress || 0, 100),
      modules: TOTAL_MODULES,
      completedModules: Math.min(progress?.learningPaths?.find(p => p.pathName === "Tourist Essentials")?.completedModules || 0, TOTAL_MODULES),
    },
    {
      name: "Business Professional",
      icon: <TrendingUpIcon className="w-6 h-6" />,
      progress: Math.min(progress?.learningPaths?.find(p => p.pathName === "Business Professional")?.progress || 0, 100),
      modules: TOTAL_MODULES,
      completedModules: Math.min(progress?.learningPaths?.find(p => p.pathName === "Business Professional")?.completedModules || 0, TOTAL_MODULES),
    },
    {
      name: "Cultural Immersion",
      icon: <SparklesIcon className="w-6 h-6" />,
      progress: Math.min(progress?.learningPaths?.find(p => p.pathName === "Cultural Immersion")?.progress || 0, 100),
      modules: TOTAL_MODULES,
      completedModules: Math.min(progress?.learningPaths?.find(p => p.pathName === "Cultural Immersion")?.completedModules || 0, TOTAL_MODULES),
    }
  ];

  const learningLanguage = LANGUAGES.find(lang => lang.value === authUser?.learningLanguage);

  // Each module = a "Good vs Bad" scenario challenge — no navigation, fully self-contained
  // 4 scenario cards per module: user picks 👍 Good or 👎 Bad approach, gets instant feedback
  const LESSON_CONTENT = {
    "Tourist Essentials": [
      {
        title: "First Contact", emoji: "👋",
        intro: "Would you handle this situation well? Swipe each scenario.",
        cards: [
          { s: "You enter a small shop abroad. The owner looks up at you.", phrase: "You make eye contact, smile and say a basic greeting in their language.", good: true,  why: "Even a small effort in the local language creates instant warmth." },
          { s: "A local tries to give you directions but you don't understand.", phrase: "You nod along pretending to understand so they don't feel bad.", good: false, why: "Always be honest — ask them to slow down or point on a map." },
          { s: "You want to take a photo of someone interesting.", phrase: "You gesture with your camera, smile, and wait for a nod before shooting.", good: true,  why: "Always ask permission. A gesture + smile works across language barriers." },
          { s: "You hear someone speaking your language in a foreign city.", phrase: "You interrupt their conversation and immediately launch into your question.", good: false, why: "Still say excuse me first — same courtesy rules apply everywhere." },
        ],
      },
      {
        title: "Finding Your Way", emoji: "🗺️",
        intro: "Navigation situations — good move or rookie mistake?",
        cards: [
          { s: "You are lost and need to find the train station.", phrase: "You show your phone with the station name typed out to a local.", good: true,  why: "Showing a written word removes the pronunciation barrier entirely." },
          { s: "Someone gives you directions with 6 turns.",  phrase: "You walk away immediately and try to remember all 6 steps.", good: false, why: "Repeat back only the first 2 steps, then ask again. Chunk it." },
          { s: "Your map shows the place 200m away but you can't find it.", phrase: "You enter a nearby shop and show them your map pointing to the destination.", good: true,  why: "Locals inside shops are usually happy to help with quick directions." },
          { s: "A local gives you directions using landmarks.", phrase: "You ask them to tell you street names instead because landmarks confuse you.", good: false, why: "Landmarks are easier to spot than street signs in foreign cities — embrace them." },
        ],
      },
      {
        title: "Money & Bargaining", emoji: "💰",
        intro: "Markets and money — savvy traveller or easy target?",
        cards: [
          { s: "A market vendor quotes a price that seems very high.", phrase: "You smile, pause, and say 'Hmm…' while looking thoughtful — waiting.", good: true,  why: "Silence and hesitation signal you won't pay the tourist price without negotiation." },
          { s: "You don't have exact change for a small purchase.", phrase: "You hand over a large note and walk away before getting change.", good: false, why: "Always wait for your change — handing over large bills can cause confusion or shortchanging." },
          { s: "A vendor gives you a price. You type a lower counter-offer on your phone calculator and show it.", phrase: "The vendor sees your number, smiles, and names a middle price.", good: true,  why: "Calculator bargaining is universally understood and keeps things friendly." },
          { s: "You agree to a price, then find the same item cheaper 5 minutes later.", phrase: "You go back to the first vendor demanding a refund or price match.", good: false, why: "An agreed deal is a deal. Going back creates bad faith — move on." },
        ],
      },
      {
        title: "Dining Out", emoji: "🍽️",
        intro: "At the table — polite guest or accidental offender?",
        cards: [
          { s: "The menu has no English and the waiter speaks no English.", phrase: "You point at a photo on the menu and say 'One, please' with a finger raised.", good: true,  why: "Pointing + number fingers is universal ordering — simple and effective." },
          { s: "You have a food allergy and the waiter doesn't understand 'allergy'.", phrase: "You say 'No [ingredient]' and mime getting sick — cross arms over stomach.", good: true,  why: "Visible miming combined with clear 'no' gets the message across safely." },
          { s: "The food takes 30 minutes and you are in a hurry.", phrase: "You snap your fingers at the waiter to get attention.", good: false, why: "Snapping fingers is rude in most cultures. Gentle eye contact or a raised hand works." },
          { s: "You finish your meal and want the bill.",   phrase: "You mime writing on your palm — the universal 'cheque please' gesture.", good: true,  why: "The air-scribble gesture for the bill is understood in almost every country." },
        ],
      },
      {
        title: "Getting Around", emoji: "🚌",
        intro: "Transport situations — smooth journey or common pitfall?",
        cards: [
          { s: "You board a bus and aren't sure if it goes to your stop.", phrase: "You show the driver a piece of paper with your destination written on it.", good: true,  why: "Drivers recognise stop names in writing even without a shared language." },
          { s: "Your train seat is taken by someone else.", phrase: "You stand awkwardly nearby hoping they notice rather than say anything.", good: false, why: "Politely show your ticket and point to the seat number — it's universally understood." },
          { s: "A taxi driver takes an obviously longer route.",phrase: "You calmly say 'direct route, please' and point to the map on your phone.", good: true,  why: "Showing the route on a map signals you know the area — usually course-corrects immediately." },
          { s: "You miss your bus stop.",                    phrase: "You shout at the driver to stop immediately and push to the front.", good: false, why: "Press the stop button or calmly walk to the front — panicking creates danger." },
        ],
      },
      {
        title: "When Things Go Wrong", emoji: "🆘",
        intro: "Emergencies and problems — prepared or panicking?",
        cards: [
          { s: "Your bag is stolen in a busy market.",       phrase: "You go straight to the nearest police station with your passport and note the time/location.", good: true,  why: "Official report + time logged is needed for insurance and any follow-up." },
          { s: "You feel very unwell abroad at night.",      phrase: "You wait until morning to see if it passes before doing anything.", good: false, why: "Don't delay — use your travel insurance hotline or go to a clinic/ER immediately." },
          { s: "You lose your passport.",                    phrase: "You contact your country's embassy and report the loss — you memorised the embassy number before travelling.", good: true,  why: "Always save the embassy number before you travel. It's the fastest path to emergency documents." },
          { s: "A local aggressively demands money from you in a quiet alley.", phrase: "You calmly hand over a small amount of cash from your front pocket and walk toward a busy street.", good: true,  why: "Keep decoy cash in front pocket. De-escalate calmly and move toward crowds." },
        ],
      },
    ],

    "Business Professional": [
      {
        title: "The First Impression", emoji: "🤝",
        intro: "Professional first meetings — strong start or awkward opener?",
        cards: [
          { s: "You meet a senior executive for the first time at a conference.", phrase: "You introduce yourself with your full name and company, then ask about their role.", good: true,  why: "Name + company + genuine question — a confident, structured opener." },
          { s: "You are introduced to someone whose name you immediately forget.", phrase: "You avoid using their name for the rest of the meeting.", good: false, why: "Politely ask them to repeat it — people appreciate honesty over awkward name-avoidance." },
          { s: "A client extends their hand for a handshake.",phrase: "You match their grip firmness — not crushing, not limp.", good: true,  why: "Mirroring handshake strength signals equality and attentiveness." },
          { s: "You arrive 10 minutes late to a first meeting.", phrase: "You walk in, sit down quietly, and wait for a pause to apologise briefly and move on.", good: true,  why: "Brief, genuine apology without over-explaining — then redirect to business." },
        ],
      },
      {
        title: "Email Etiquette", emoji: "📧",
        intro: "Professional writing — polished or problematic?",
        cards: [
          { s: "You need a response quickly from a colleague.", phrase: "You send an email with subject: 'URGENT URGENT URGENT - Need Reply NOW'", good: false, why: "All-caps urgency creates anxiety and looks unprofessional. Use 'Action needed by [date]' instead." },
          { s: "You're emailing a senior manager you've never met.", phrase: "You start with: 'Dear Ms. Chen, I hope this message finds you well.'", good: true,  why: "Formal salutation + pleasantry — sets a respectful, professional tone." },
          { s: "You need to say no to a request politely.",   phrase: "You write: 'Unfortunately I won't be able to take this on, but perhaps [colleague] could help?'", good: true,  why: "Soft refusal + redirect to a solution — professional and constructive." },
          { s: "You're replying to a long chain of 20 people.", phrase: "You hit Reply All to say 'Thanks, got it!'", good: false, why: "Reply-All for acknowledgements floods 20 inboxes. Reply only to the sender." },
        ],
      },
      {
        title: "Meeting Mastery", emoji: "📋",
        intro: "In the meeting room — leader or liability?",
        cards: [
          { s: "A meeting has gone 10 minutes over time with no conclusion.", phrase: "You say: 'We're running over — should we schedule a follow-up or make a quick decision now?'", good: true,  why: "Naming the problem and offering two options keeps things moving professionally." },
          { s: "Someone talks over you while you are making a point.", phrase: "You go silent and wait until they are completely done, then never return to your point.", good: false, why: "Gently reclaim the floor: 'I'd like to finish my thought — [your point].' Assert yourself calmly." },
          { s: "You disagree with a proposal in a group meeting.", phrase: "You say: 'I see the value here — could we also consider [alternative] to address [concern]?'", good: true,  why: "Acknowledge the idea first, then introduce your alternative. Reduces defensiveness." },
          { s: "You don't understand a term someone used in the meeting.", phrase: "You nod and figure you'll google it later rather than slow things down.", good: false, why: "Ask: 'Could you clarify what you mean by X?' — clarifying shows engagement, not weakness." },
        ],
      },
      {
        title: "Negotiation Skills", emoji: "⚖️",
        intro: "Deals and compromises — sharp negotiator or pushover?",
        cards: [
          { s: "A supplier names their price first in a negotiation.", phrase: "You let them name the first number — you say nothing for 3 seconds before responding.", good: true,  why: "Silence after a number is a powerful tool. It signals you're thinking, not accepting." },
          { s: "The other party says 'That's our final offer.'", phrase: "You immediately accept since it sounds definitive.", good: false, why: "'Final offer' is often a tactic. Calmly test it: 'I understand — is there any flexibility on timeline instead?'" },
          { s: "You need to make a concession but want something in return.", phrase: "You say: 'I can move on price if we can agree on delivery terms.'", good: true,  why: "Conditional concessions — 'if you… then I…' — keep exchanges balanced." },
          { s: "Negotiations get emotional and the other party raises their voice.", phrase: "You lower your own voice and slow your speech down deliberately.", good: true,  why: "Calm, slow speech is contagious. It de-escalates tension faster than matching their energy." },
        ],
      },
      {
        title: "Networking Know-how", emoji: "🌐",
        intro: "Professional connections — natural networker or awkward encounter?",
        cards: [
          { s: "You're at a conference and don't know anyone.",phrase: "You approach a small group who look relaxed and wait for a natural pause to introduce yourself.", good: true,  why: "Relaxed groups are easier to join. Wait for a pause — never interrupt mid-story." },
          { s: "You collect 15 business cards at an event.",  phrase: "You go home and email each person a personal one-line note referencing your conversation.", good: true,  why: "Personalised follow-up within 24 hours is the difference between a contact and a connection." },
          { s: "Someone asks 'What do you do?' at a networking event.", phrase: "You recite your full job title and list of responsibilities for 2 minutes.", good: false, why: "One sentence + a hook: 'I help companies cut onboarding time in half.' Create curiosity." },
          { s: "You want to stay in touch with someone you just met.", phrase: "You say: 'I'd love to continue this — would you be open to a 20-minute call next week?'", good: true,  why: "Specific, low-commitment ask. Much better than 'let's stay in touch' (which means nothing)." },
        ],
      },
      {
        title: "Cross-cultural Savvy", emoji: "🌍",
        intro: "Working globally — culturally aware or culturally clumsy?",
        cards: [
          { s: "Your Japanese colleague stays quiet during a brainstorm.", phrase: "You assume they have nothing to contribute and move on quickly.", good: false, why: "In many cultures, silence = deep consideration. Invite them directly: 'Kenji, what's your view?'" },
          { s: "You're negotiating with a team that spends the first hour on small talk and food.", phrase: "You patiently engage, knowing relationship-building often precedes business in many cultures.", good: true,  why: "In relationship-first cultures, rushing to business before rapport is a deal-killer." },
          { s: "A colleague from another culture gives very indirect feedback.", phrase: "You listen carefully for what they're NOT saying as much as what they are.", good: true,  why: "High-context communication means meaning lives between the lines — tune in." },
          { s: "You're unsure about a cultural norm in an unfamiliar country.", phrase: "You quietly ask a local colleague: 'Is there anything I should know before the client meeting?'", good: true,  why: "Asking a trusted local is the smartest move — shows respect and prevents missteps." },
        ],
      },
    ],

    "Cultural Immersion": [
      {
        title: "Festivals & Traditions", emoji: "🎉",
        intro: "Joining local celebrations — gracious guest or cultural misstep?",
        cards: [
          { s: "You're invited to a local religious festival you know nothing about.", phrase: "You arrive in casual shorts and a t-shirt since it's outdoors.", good: false, why: "Always research dress codes for religious or cultural events — err on the side of conservative." },
          { s: "A local offers you traditional food during a celebration.",phrase: "You try a small amount, express genuine appreciation even if it's unfamiliar.", good: true,  why: "Trying local food is one of the highest forms of cultural respect." },
          { s: "You want to photograph a sacred ceremony.",   phrase: "You watch first, notice whether locals allow photos, and ask before raising your camera.", good: true,  why: "Some rituals are private or sacred — observe first, ask second." },
          { s: "A custom seems strange or uncomfortable to you.", phrase: "You make a face and loudly comment that it's 'weird' to your travel companion.", good: false, why: "Cultural judgement is visible. Maintain an open, curious expression even if you're unsure." },
        ],
      },
      {
        title: "Food Culture", emoji: "🍜",
        intro: "Eating like a local — cultural curiosity or faux pas?",
        cards: [
          { s: "Your host serves you a large portion of food as a gesture of hospitality.", phrase: "You eat what you can and leave a little — it signals you've had enough in many cultures.", good: true,  why: "In many Asian and Middle Eastern cultures, finishing everything signals you're still hungry." },
          { s: "You're eating at a street food stall and it looks unhygienic.", phrase: "You loudly comment on the hygiene to your friend in front of the vendor.", good: false, why: "Disrespectful and embarrassing for the vendor. Move on quietly if you're uncomfortable." },
          { s: "You're eating in Japan and start to talk with your chopsticks pointing at someone.", phrase: "You lower your chopsticks immediately — pointing is considered very rude.", good: true,  why: "Chopstick etiquette is serious — no pointing, no sticking upright in rice, no passing food." },
          { s: "A host keeps refilling your glass even though you've had enough.", phrase: "You cover your glass with your hand or turn it face down — universal 'no more' signal.", good: true,  why: "Covering the glass is universally understood as politely declining more." },
        ],
      },
      {
        title: "Social Etiquette", emoji: "🤲",
        intro: "Social situations — graceful or gauche?",
        cards: [
          { s: "You enter someone's home and notice a pile of shoes at the door.", phrase: "You remove your shoes without being asked — the pile is a clear signal.", good: true,  why: "Shoe piles at entrances are universal signals. Remove yours before being asked." },
          { s: "You meet an elder in a culture that values seniority.", phrase: "You greet them first before younger people in the group.", good: true,  why: "In many Asian, African and Middle Eastern cultures, greeting elders first shows deep respect." },
          { s: "You need to decline an invitation from a local family.", phrase: "You say: 'I'm so grateful for the invitation, unfortunately I have a prior commitment.'", good: true,  why: "Warm gratitude + brief reason — always better than just 'no' or a vague excuse." },
          { s: "You're in a conversation and accidentally use an offensive hand gesture you didn't know about.", phrase: "You apologise immediately, explain you didn't know, and ask what it means.", good: true,  why: "Honest, immediate acknowledgement defuses awkwardness — curiosity is always forgiven." },
        ],
      },
      {
        title: "Arts & Heritage", emoji: "🎨",
        intro: "Engaging with art and history — curious explorer or accidental offender?",
        cards: [
          { s: "You visit a museum and find the exhibits presented from a colonial perspective.", phrase: "You engage with the exhibits critically but respectfully, asking a local guide for their perspective.", good: true,  why: "Seeking local context enriches your understanding and shows cultural intelligence." },
          { s: "A local artist offers to show you their studio.", phrase: "You accept enthusiastically, ask questions about their process, and buy something small if you can.", good: true,  why: "Supporting local artists creates genuine connection and cultural exchange." },
          { s: "You touch a sculpture in a museum because it looks interesting.", phrase: "You reach out and touch it despite no visible 'do not touch' sign.", good: false, why: "Unless explicitly invited, never touch artworks or artefacts. When in doubt, don't." },
          { s: "Someone tells you their country's historical narrative is different from what you learned in school.", phrase: "You listen with genuine curiosity and ask questions rather than arguing your version.", good: true,  why: "History is perspective. Listening openly is cultural intelligence at its best." },
        ],
      },
      {
        title: "Family & Social Life", emoji: "👨‍👩‍👧",
        intro: "Family dynamics — socially smooth or unknowingly rude?",
        cards: [
          { s: "You're introduced to someone's parents in a culture with strong family hierarchy.", phrase: "You stand, bow slightly or nod respectfully, and address them formally until invited otherwise.", good: true,  why: "Formal respect toward parents, then waiting to be invited to be casual — universally safe." },
          { s: "A friend's parent asks you a very personal question about your income or relationship status.", phrase: "You answer politely but briefly and redirect the conversation with a question about them.", good: true,  why: "In many cultures, such questions are warmth not intrusion. A graceful, brief answer works." },
          { s: "You're invited to a family dinner and you only want to talk to your friend, not the family.", phrase: "You spend the evening mostly on your phone or talking only to your friend.", good: false, why: "An invitation to a family dinner is an invitation to the whole family. Engage everyone." },
          { s: "A child in the family draws you a picture as a gift.", phrase: "You react with genuine delight and keep it — making a big deal of it in front of the family.", good: true,  why: "Enthusiastic appreciation of a child's gift is universally magical for the whole family." },
        ],
      },
      {
        title: "Modern Local Life", emoji: "📱",
        intro: "Navigating contemporary culture — in touch or out of touch?",
        cards: [
          { s: "Local slang or internet humour is flying over your head in a conversation.", phrase: "You say 'I'm still learning the local internet — what does that mean?' with a smile.", good: true,  why: "Admitting you don't get local slang with humour is charming and invites explanation." },
          { s: "You share a meme from your home country that seems universally funny to you.", phrase: "You check whether cultural references will translate before sharing — if unsure, add context.", good: true,  why: "Humour is one of the hardest things to translate — context saves the joke." },
          { s: "A local asks your opinion on a sensitive political topic in their country.", phrase: "You share a strong opinion based on what you've read in foreign news outlets.", good: false, why: "You're a guest. Share curiosity, not verdict: 'I'm still learning — what's your take?'" },
          { s: "You see something on social media that portrays locals in a stereotypical way.", phrase: "You don't share it, and you're more critical of content that reduces a culture to a cliché.", good: true,  why: "Cultural sensitivity online matters as much as in person. Amplifying stereotypes causes real harm." },
        ],
      },
    ],
  };

  const handleLessonComplete = (lesson) => {
    if (!lesson.completed) {
      completeLessonMutation({ lessonId: lesson.id, xpEarned: lesson.xp });
    }
  };

  const handleChallengeStart = (challenge) => {
    if (challenge.completed) return;

    // Navigate to the actual activity for each challenge type
    if (challenge.challengeId === 'chat-5min') {
      // Mark started and go to AI conversation practice
      completeChallengeMutation(challenge.challengeId);
      navigate('/conversation-practice');
    } else if (challenge.challengeId === 'learn-10-words') {
      // Mark started and go to daily vocabulary task
      completeChallengeMutation(challenge.challengeId);
      navigate('/daily-task');
    } else if (challenge.challengeId === 'watch-lesson') {
      // Switch to the video lessons tab on this page
      completeChallengeMutation(challenge.challengeId);
      setActiveTab('lessons');
      toast.success('Watch a lesson below to complete this challenge!');
    } else {
      // Generic: mark complete and refresh
      completeChallengeMutation(challenge.challengeId);
    }
  };

  const handleCompleteModule = (path, moduleIndex) => {
    const newCompletedModules = Math.min(moduleIndex + 1, path.modules);
    const newProgress = Math.round((newCompletedModules / path.modules) * 100);
    updatePathMutation({ pathName: path.name, progress: newProgress, completedModules: newCompletedModules, totalModules: path.modules });
    setActiveLesson(null);
  };

  const handleResetPath = (path) => {
    updatePathMutation({ pathName: path.name, progress: 0, completedModules: 0, totalModules: path.modules, skipXP: true });
    setActiveLesson(null);
  };

  const startLesson = (pathName, modIdx) => {
    setActiveLesson({ pathName, modIdx, cardIdx: 0, picks: [], phase: 'playing' });
  };

  const pickCard = (isGood) => {
    if (!activeLesson) return;
    const cards = LESSON_CONTENT[activeLesson.pathName]?.[activeLesson.modIdx]?.cards || [];
    const newPicks = [...activeLesson.picks, isGood];
    if (newPicks.length >= cards.length) {
      setActiveLesson(prev => ({ ...prev, picks: newPicks, phase: 'result' }));
    } else {
      setActiveLesson(prev => ({ ...prev, picks: newPicks, cardIdx: prev.cardIdx + 1 }));
    }
  };

  const handleAddVocabulary = () => {
    if (newWord.word && newWord.translation) {
      addVocabMutation(newWord);
    }
  };

  // Handle practice session completion
  const handlePronunciationComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'pronunciation',
        sessionData.score,
        5, // duration in minutes
        { phrasesCompleted: sessionData.phrasesCompleted }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowPronunciation(false);
    } catch (error) {
      console.error('Error recording pronunciation session:', error);
    }
  };

  const handleGrammarComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'grammar',
        sessionData.score,
        5, // duration in minutes
        { 
          correctAnswers: sessionData.correctAnswers,
          totalQuestions: sessionData.totalQuestions,
          accuracy: sessionData.accuracy
        }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowGrammar(false);
    } catch (error) {
      console.error('Error recording grammar session:', error);
    }
  };

  const handleConversationComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'conversation',
        sessionData.score,
        10, // duration in minutes
        { 
          topic: sessionData.topic,
          scenariosCompleted: sessionData.scenariosCompleted,
          totalScenarios: sessionData.totalScenarios
        }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowConversation(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error('Error recording conversation session:', error);
    }
  };

  const startConversation = (topic) => {
    setSelectedTopic(topic);
    setShowConversation(true);
  };

  if (loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      {/* Hero Section with Video Background Effect */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 py-12 px-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4">
                Your <span className="text-primary">Language Journey</span>
              </h1>
              <p className="text-xl opacity-90 mb-6">
                Learning {learningLanguage?.label || "a new language"} with interactive lessons and real conversations
              </p>
              
              {/* Stats Overview */}
              <div className="stats stats-horizontal shadow-xl bg-base-100/90 backdrop-blur">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FlameIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-primary">{authUser?.streak || 0}</div>
                  <div className="stat-title">Day Streak</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <TrophyIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-secondary">{progress?.totalXP || 0}</div>
                  <div className="stat-title">XP Earned</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-accent">
                    <StarIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-accent">Level {progress?.currentLevel || 1}</div>
                  <div className="stat-title">Current Level</div>
                </div>
              </div>
            </div>

            {/* Featured Video Card */}
            <div className="card bg-base-100 shadow-2xl w-full lg:w-96">
              <figure className="relative">
                <img 
                  src="https://img.youtube.com/vi/7xQMz1DgRaU/maxresdefault.jpg" 
                  alt="Featured lesson" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    className="btn btn-circle btn-primary btn-lg"
                    onClick={() => setPlayingVideo(videoLessons[0])}
                  >
                    <PlayCircleIcon className="w-8 h-8" />
                  </button>
                </div>
              </figure>
              <div className="card-body">
                <h2 className="card-title">Today's Featured Lesson</h2>
                <p>Master greetings in {learningLanguage?.label}</p>
                <div className="card-actions justify-end">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setPlayingVideo(videoLessons[0])}
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
        <div className="container mx-auto max-w-7xl">
          <div className="tabs tabs-boxed bg-transparent">
            <button 
              className={`tab tab-lg ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <RocketIcon className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'lessons' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              Video Lessons
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'practice' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              Practice
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'partners' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('partners')}
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Partners
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'progress' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              <TrophyIcon className="w-4 h-4 mr-2" />
              Progress
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Daily Challenges */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ZapIcon className="w-6 h-6 mr-2 text-primary" />
                Daily Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailyChallenges.map(challenge => (
                  <div key={challenge.challengeId} className={`card ${challenge.completed ? 'bg-success/10 border-success' : 'bg-base-100'} shadow-lg border`}>
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{challenge.title}</h3>
                          <p className="text-sm opacity-70 mt-2">Complete to earn XP</p>
                        </div>
                        {challenge.completed && <CheckCircleIcon className="w-6 h-6 text-success" />}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">+{challenge.xpEarned} XP</span>
                          {!challenge.completed && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleChallengeStart(challenge)}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Paths — Scenario Challenge Board */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TargetIcon className="w-6 h-6 text-secondary" />
                  Learning Paths
                </h2>
                <span className="text-sm text-base-content/50">
                  {learningPaths.filter(p => p.progress >= 100).length}/{learningPaths.length} mastered
                </span>
              </div>

              {(() => {
                const THEMES = {
                  "Tourist Essentials":    { bg: "from-amber-500/15 to-orange-500/10",  border: "border-amber-500/30",  dotDone: "bg-amber-500",    dotCur: "bg-amber-400",  emoji: "🗺️", accent: "text-amber-600"  },
                  "Business Professional": { bg: "from-blue-500/15 to-indigo-500/10",   border: "border-blue-500/30",   dotDone: "bg-blue-500",     dotCur: "bg-blue-400",   emoji: "💼", accent: "text-blue-600"   },
                  "Cultural Immersion":    { bg: "from-purple-500/15 to-pink-500/10",   border: "border-purple-500/30", dotDone: "bg-purple-500",   dotCur: "bg-purple-400", emoji: "🌸", accent: "text-purple-600" },
                };

                return (
                  <div className="space-y-4">
                    {learningPaths.map((path) => {
                      const theme      = THEMES[path.name];
                      const lessons    = LESSON_CONTENT[path.name] || [];
                      const isOpen     = selectedPath?.name === path.name;
                      const isComplete = path.completedModules >= path.modules;
                      const curIdx     = Math.min(path.completedModules, lessons.length - 1);
                      const lesson     = lessons[curIdx];
                      const isPlaying  = activeLesson?.pathName === path.name && activeLesson?.modIdx === curIdx;
                      const card       = isPlaying ? lesson?.cards?.[activeLesson.cardIdx] : null;
                      const lastPick   = isPlaying && activeLesson.picks.length > activeLesson.cardIdx
                                         ? activeLesson.picks[activeLesson.cardIdx - 1] : null;

                      return (
                        <div key={path.name} className={`rounded-2xl border bg-gradient-to-r ${theme.bg} ${theme.border} overflow-hidden`}>

                          {/* ── Header ── */}
                          <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-base-content/5 transition-colors"
                            onClick={() => { setSelectedPath(isOpen ? null : path); setActiveLesson(null); }}>
                            <span className="text-3xl select-none">{theme.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{path.name}</span>
                                {isComplete && <span className="badge badge-success badge-xs">Mastered ✓</span>}
                              </div>
                              {/* dot trail */}
                              <div className="flex items-center gap-0.5 mt-2">
                                {lessons.map((_, i) => (
                                  <div key={i} className="flex items-center gap-0.5">
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                                      i < path.completedModules ? theme.dotDone :
                                      i === path.completedModules ? `${theme.dotCur} ring-2 ring-offset-1 ring-offset-transparent animate-pulse` :
                                      'bg-base-content/15'}`} />
                                    {i < lessons.length - 1 && <div className={`w-4 h-px ${i < path.completedModules ? theme.dotDone : 'bg-base-content/10'}`} />}
                                  </div>
                                ))}
                                <span className="ml-2 text-xs text-base-content/40">{path.completedModules}/{path.modules}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`text-xl font-black ${theme.accent}`}>{Math.round(path.progress)}%</div>
                              <div className="text-xs text-base-content/30">{isOpen ? '▲' : '▼'}</div>
                            </div>
                          </button>

                          {/* ── Expanded body ── */}
                          {isOpen && (
                            <div className="border-t border-base-content/10 bg-base-100/70 p-5">
                              {isComplete ? (
                                <div className="text-center py-6">
                                  <div className="text-5xl mb-3">🏆</div>
                                  <p className="font-bold text-success text-lg">Path Mastered!</p>
                                  <p className="text-sm text-base-content/50 mt-1">All {lessons.length} scenarios cleared. Incredible awareness!</p>
                                  <button className="btn btn-xs btn-ghost mt-4 text-base-content/40"
                                    onClick={() => handleResetPath(path)}>↺ Reset & replay</button>
                                </div>
                              ) : !isPlaying ? (
                                /* Mission intro card */
                                <div>
                                  <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-3">
                                    Mission {curIdx + 1} of {lessons.length}
                                  </p>
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{lesson?.emoji}</span>
                                    <div>
                                      <p className="font-bold text-base">{lesson?.title}</p>
                                      <p className="text-sm text-base-content/60">{lesson?.intro}</p>
                                    </div>
                                    <span className="badge badge-outline badge-sm ml-auto">+20 XP</span>
                                  </div>
                                  <p className="text-xs text-base-content/40 mb-4">
                                    {lesson?.cards?.length} scenario cards · tap 👍 Good or 👎 Bad for each
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button className="btn btn-sm btn-primary"
                                      onClick={() => startLesson(path.name, curIdx)}>
                                      ▶ Start Challenge
                                    </button>
                                    {path.completedModules > 0 && (
                                      <button className="btn btn-xs btn-ghost text-base-content/40"
                                        onClick={() => handleResetPath(path)}>↺ Reset path</button>
                                    )}
                                  </div>
                                </div>
                              ) : activeLesson?.phase === 'result' ? (
                                /* Result screen */
                                (() => {
                                  const cards   = lesson?.cards || [];
                                  const correct = activeLesson.picks.filter((p, i) => p === cards[i]?.good).length;
                                  const passed  = correct >= Math.ceil(cards.length * 0.5);
                                  return (
                                    <div className="text-center py-4">
                                      <div className="text-4xl mb-2">{passed ? '🎉' : '🤔'}</div>
                                      <p className="font-bold text-lg">{passed ? 'Great awareness!' : 'Keep learning!'}</p>
                                      <p className="text-sm text-base-content/60 mt-1 mb-4">
                                        You got <strong>{correct}/{cards.length}</strong> scenarios right
                                      </p>
                                      {passed ? (
                                        <button className="btn btn-success btn-sm"
                                          disabled={pathUpdating}
                                          onClick={() => handleCompleteModule(path, curIdx)}>
                                          ✓ Complete Mission · Claim +20 XP
                                        </button>
                                      ) : (
                                        <button className="btn btn-primary btn-sm"
                                          onClick={() => startLesson(path.name, curIdx)}>
                                          ↺ Try Again
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : card ? (
                                /* Active scenario card */
                                <div>
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs text-base-content/40">
                                      Card {activeLesson.cardIdx + 1} / {lesson?.cards?.length}
                                    </span>
                                    <div className="flex gap-1">
                                      {lesson?.cards?.map((c, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${
                                          i < activeLesson.picks.length
                                            ? activeLesson.picks[i] === c.good ? 'bg-success' : 'bg-error'
                                            : i === activeLesson.cardIdx ? 'bg-primary' : 'bg-base-300'}`} />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="bg-base-200 rounded-xl p-4 mb-4">
                                    <p className="text-xs text-base-content/50 mb-1">Situation</p>
                                    <p className="font-medium text-sm">{card.s}</p>
                                  </div>

                                  <div className="bg-base-100 border-2 border-primary/20 rounded-xl p-4 mb-5">
                                    <p className="text-xs text-base-content/50 mb-1">Response</p>
                                    <p className="text-sm italic">"{card.phrase}"</p>
                                  </div>

                                  <div className="flex gap-3">
                                    <button className="flex-1 btn btn-success gap-2" onClick={() => pickCard(true)}>
                                      👍 Good Move
                                    </button>
                                    <button className="flex-1 btn btn-error gap-2" onClick={() => pickCard(false)}>
                                      👎 Bad Move
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  className="btn btn-lg btn-outline btn-primary"
                  onClick={() => setActiveTab('practice')}
                >
                  <HeadphonesIcon className="w-5 h-5" />
                  Listening Practice
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-secondary"
                  onClick={() => setShowVocabModal(true)}
                >
                  <BookOpenIcon className="w-5 h-5" />
                  Add Vocabulary
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-accent"
                  onClick={() => setActiveTab('lessons')}
                >
                  <VideoIcon className="w-5 h-5" />
                  Watch Lesson
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-success"
                  onClick={() => setActiveTab('partners')}
                >
                  <UsersIcon className="w-5 h-5" />
                  Find Partner
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Level Selector */}
            <div className="flex gap-2 mb-6">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`btn ${selectedLevel === level ? 'btn-primary' : 'btn-outline'}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            {/* Video Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoLessons
                .filter(lesson => lesson.level.toLowerCase() === selectedLevel || selectedLevel === 'all')
                .map(lesson => (
                <div key={lesson.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                  <figure className="relative">
                    <img 
                      src={lesson.thumbnail} 
                      alt={lesson.title}
                      className="w-full h-48 object-cover"
                    />
                    {lesson.locked ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <LockIcon className="w-12 h-12 text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          className="btn btn-circle btn-primary btn-lg"
                          onClick={() => setPlayingVideo(lesson)}
                        >
                          <PlayCircleIcon className="w-8 h-8" />
                        </button>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`badge ${lesson.level === 'Beginner' ? 'badge-success' : lesson.level === 'Intermediate' ? 'badge-warning' : 'badge-error'}`}>
                        {lesson.level}
                      </span>
                    </div>
                    {lesson.completed && (
                      <div className="absolute top-2 left-2">
                        <CheckCircleIcon className="w-6 h-6 text-success" />
                      </div>
                    )}
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-lg">{lesson.title}</h3>
                    <p className="text-sm opacity-70">{lesson.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        +{lesson.xp} XP
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      {lesson.locked ? (
                        <button className="btn btn-sm btn-disabled">Locked</button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setPlayingVideo(lesson)}
                        >
                          {lesson.completed ? 'Review' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-8">
            {/* Vocabulary Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Vocabulary</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowVocabModal(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Word
                </button>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-lg">
                    You've learned <span className="font-bold text-primary">{progress?.wordsLearned || 0}</span> words!
                  </p>
                  {progress?.vocabulary?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {progress.vocabulary.slice(-8).map((word, idx) => (
                        <div key={idx} className="badge badge-lg badge-outline">
                          {word.word} - {word.translation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Interactive Exercises */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Interactive Exercises</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="card-body">
                    <h3 className="card-title">
                      <HeadphonesIcon className="w-6 h-6" />
                      Pronunciation Practice
                    </h3>
                    <p>Master native pronunciation with AI feedback</p>
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowPronunciation(true)}
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                  <div className="card-body">
                    <h3 className="card-title">
                      <BookOpenIcon className="w-6 h-6" />
                      Grammar Exercises
                    </h3>
                    <p>Master grammar rules with interactive quizzes</p>
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowGrammar(true)}
                      >
                        Practice Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Conversation Topics */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Conversation Topics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Travel', 'Food', 'Culture', 'Business', 'Sports', 'Music', 'Technology', 'Daily Life'].map(topic => (
                  <button 
                    key={topic} 
                    className="card bg-base-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                    onClick={() => startConversation(topic)}
                  >
                    <div className="card-body items-center text-center p-4">
                      <MessageSquareIcon className="w-8 h-8 text-primary mb-2" />
                      <p className="font-semibold">{topic}</p>
                      <p className="text-xs opacity-70 mt-1">Practice real conversations</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Recommended Language Partners</h2>
            {suggestedPartners.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <p className="text-lg opacity-70">No matching partners found yet.</p>
                  <p className="text-sm">Try updating your language preferences in your profile.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedPartners.map(partner => (
                  <div key={partner._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div className={`avatar ${partner.isOnline ? 'online' : 'offline'}`}>
                          <div className="w-16 rounded-full">
                            <img src={partner.profilePic || "/vite.svg"} alt={partner.fullName} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{partner.fullName}</h3>
                          <p className="text-sm opacity-70">
                            {LANGUAGES.find(l => l.value === partner.nativeLanguage)?.flag} → {LANGUAGES.find(l => l.value === partner.learningLanguage)?.flag}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 text-warning fill-warning" />
                              <span className="text-sm ml-1">{partner.rating?.toFixed(1)}</span>
                            </div>
                            <span className="text-sm opacity-70">• {partner.sessionsCompleted} sessions</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <Link to={`/chat/${partner._id}`} className="btn btn-sm btn-primary">
                          <MessageSquareIcon className="w-4 h-4" />
                          Message
                        </Link>
                        <Link to={`/profile/${partner._id}`} className="btn btn-sm btn-outline">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Achievements */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`card ${achievement.unlocked ? 'bg-base-100' : 'bg-base-200 opacity-50'} shadow-lg`}
                  >
                    <div className="card-body items-center text-center p-4">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <p className="font-semibold text-sm">{achievement.name}</p>
                      <p className="text-xs opacity-70">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-success mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progress Chart */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Learning Journey</h2>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat">
                      <div className="stat-title">Total Study Time</div>
                      <div className="stat-value text-primary">{Math.floor((progress?.totalStudyTime || 0) / 60)} Hours</div>
                      <div className="stat-desc">Keep learning every day!</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Words Learned</div>
                      <div className="stat-value text-secondary">{progress?.wordsLearned || 0}</div>
                      <div className="stat-desc">Expand your vocabulary</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Conversations</div>
                      <div className="stat-value text-accent">{progress?.conversationsCompleted || 0}</div>
                      <div className="stat-desc">Practice makes perfect</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Longest Streak</h3>
                    <div className="flex items-center gap-2">
                      <FlameIcon className="w-6 h-6 text-orange-500" />
                      <span className="text-2xl font-bold">{progress?.longestStreak || 0} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">{playingVideo.title}</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={playingVideo.videoUrl}
                title={playingVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-action">
              {!playingVideo.completed && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleLessonComplete(playingVideo)}
                >
                  Mark as Complete (+{playingVideo.xp} XP)
                </button>
              )}
              <button className="btn" onClick={() => setPlayingVideo(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPlayingVideo(null)}></div>
        </div>
      )}

      {/* Add Vocabulary Modal */}
      {showVocabModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Vocabulary</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Word in {learningLanguage?.label}</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter word"
                className="input input-bordered"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Translation</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter translation"
                className="input input-bordered"
                value={newWord.translation}
                onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
              />
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={handleAddVocabulary}
                disabled={!newWord.word || !newWord.translation}
              >
                Add Word (+5 XP)
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setShowVocabModal(false);
                  setNewWord({ word: "", translation: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowVocabModal(false)}></div>
        </div>
      )}

      {/* Pronunciation Practice Modal */}
      {showPronunciation && (
        <PronunciationPractice
          language={authUser?.learningLanguage}
          onClose={() => setShowPronunciation(false)}
          onComplete={handlePronunciationComplete}
        />
      )}

      {/* Grammar Exercises Modal */}
      {showGrammar && (
        <GrammarExercises
          language={authUser?.learningLanguage}
          onClose={() => setShowGrammar(false)}
          onComplete={handleGrammarComplete}
        />
      )}

      {/* Conversation Practice Modal */}
      {showConversation && selectedTopic && (
        <DynamicConversation
          topic={selectedTopic}
          onClose={() => {
            setShowConversation(false);
            setSelectedTopic(null);
          }}
          onComplete={handleConversationComplete}
        />
      )}
    </div>
  );
};

export default LanguageJourneyPage;