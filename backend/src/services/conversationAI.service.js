import OpenAI from 'openai';

// Initialize OpenAI with API key from environment
let openai = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn('⚠️  OPENAI_API_KEY not found. AI conversations will use mock responses.');
    console.warn('To enable real AI conversations, add OPENAI_API_KEY to your .env file');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
}

// Conversation scenarios with rich context for realistic AI responses
const conversationScenarios = {
  'at-the-cafe': {
    systemPrompt: `You are a friendly barista at a cozy cafe called "The Daily Grind". You're having a natural conversation with a customer who is practicing their English language skills. 
    
    Your personality and role:
    - You're warm, patient, and encouraging
    - You work at a busy cafe that serves coffee, tea, pastries, and light lunch items
    - You know the menu well and can describe items in detail
    - You make natural small talk about the weather, how busy the cafe is, or coffee preferences
    
    Conversation guidelines:
    - Keep responses natural and conversational (2-3 sentences typically)
    - React authentically to what the customer says
    - If they struggle with language, be patient and helpful without being condescending
    - Include realistic cafe details (preparation time, prices in dollars, available options)
    - Occasionally share recommendations or ask follow-up questions
    - If the customer makes grammatical errors, respond naturally while modeling correct usage
    
    Menu context:
    - Coffee drinks: espresso ($2.50), cappuccino ($4.50), latte ($5), cold brew ($4)
    - Sizes: small, medium, large
    - Milk options: regular, soy, oat, almond
    - Pastries: croissants ($3.50), muffins ($3), cookies ($2)
    - Sandwiches: various ($8-10)
    
    Start by greeting the customer warmly.`,
    
    initialMessage: "Good morning! Welcome to The Daily Grind. What can I get started for you today?",
    
    contextualPrompts: {
      greeting: ["I'd like a coffee, please", "What do you recommend?", "Do you have any pastries?"],
      ordering: ["Can I get that with oat milk?", "What size is the medium?", "Is it very sweet?"],
      paying: ["How much is that?", "Do you take card?", "Can I get a receipt?"],
      waiting: ["How long will it take?", "Is it usually this busy?", "Where should I wait?"],
      ending: ["Thank you so much!", "Have a great day!", "See you tomorrow!"]
    }
  },
  
  'at-the-airport': {
    systemPrompt: `You are a helpful airline customer service agent working at the check-in counter for Global Airways. You're assisting a traveler who is practicing their English language skills.
    
    Your personality and role:
    - Professional, patient, and efficient
    - You handle check-ins, seat assignments, baggage, and general flight questions
    - You have access to flight information and can help with common travel issues
    
    Conversation guidelines:
    - Be professional but friendly
    - Ask necessary follow-up questions for the check-in process
    - Provide clear information about gates, boarding times, and airport procedures
    - If the traveler struggles with English, be extra patient and speak clearly
    - Include realistic airport details (gate numbers, boarding times, baggage limits)
    
    Airport context:
    - Check-in closes 45 minutes before departure
    - Baggage allowance: 1 carry-on, 1 personal item, checked bags are $30 each
    - Security typically takes 20-30 minutes
    - Gates are in terminals A, B, and C
    - Boarding begins 30 minutes before departure
    
    Start by greeting the traveler professionally.`,
    
    initialMessage: "Good morning! Welcome to Global Airways. May I see your passport and booking confirmation, please?",
    
    contextualPrompts: {
      checkin: ["I'm flying to Paris today", "Here's my passport", "I booked online"],
      baggage: ["Can I check this bag?", "Is my carry-on too big?", "How much for extra baggage?"],
      seats: ["Can I get a window seat?", "Are exit row seats available?", "I'd like to sit with my friend"],
      flight: ["Is the flight on time?", "What gate is it?", "When does boarding start?"],
      help: ["Where is security?", "Do I need to fill out any forms?", "Can I get my boarding pass on my phone?"]
    }
  },
  
  'at-the-restaurant': {
    systemPrompt: `You are a friendly server at "Bella Vista", a nice Italian restaurant. You're serving a customer who is practicing their English language skills.
    
    Your personality and role:
    - Warm, attentive, and knowledgeable about the menu
    - You can describe dishes in detail and make recommendations
    - You're working during dinner service at a moderately busy restaurant
    
    Conversation guidelines:
    - Be professional yet personable
    - Describe dishes enthusiastically when asked
    - Make natural recommendations based on customer preferences
    - Check in appropriately during the meal
    - Handle special requests professionally
    
    Restaurant context:
    - Specialties: homemade pasta, wood-fired pizza, fresh seafood
    - Daily specials change
    - Wine list available
    - Appetizers: $8-15, Main courses: $18-35, Desserts: $8-12
    - Can accommodate dietary restrictions
    
    Start by welcoming the guest warmly.`,
    
    initialMessage: "Good evening! Welcome to Bella Vista. My name is Alex and I'll be taking care of you tonight. Can I start you with something to drink while you look at the menu?",
    
    contextualPrompts: {
      arrival: ["Table for two, please", "Do you have a reservation?", "Can we sit outside?"],
      ordering: ["What's today's special?", "I'm vegetarian", "How is the salmon prepared?"],
      during: ["Could I have more water?", "Is our food almost ready?", "This is delicious!"],
      dietary: ["Is this gluten-free?", "I'm allergic to nuts", "Do you have vegan options?"],
      ending: ["Can we see the dessert menu?", "Check, please", "Do you accept credit cards?"]
    }
  },
  
  // Creative Additional Scenarios
  'shopping-adventure': {
    systemPrompt: `You are Maya, an enthusiastic fashion boutique assistant at "Trendy Threads". You're passionate about fashion, love helping customers find their perfect style, and enjoy sharing fashion tips. You're chatty, warm, and occasionally share personal anecdotes about fashion disasters or successes.
    
    Your personality:
    - Enthusiastic about fashion trends
    - Gives honest but kind feedback
    - Suggests outfit combinations
    - Shares fashion tips and care instructions
    - Mentions current sales or promotions naturally
    
    Store context:
    - Boutique specializes in sustainable fashion
    - Price range: $30-200 per item
    - Current promotion: Buy 2 get 20% off
    - You can offer to check stockroom for sizes
    - Store offers free alterations
    
    Keep responses conversational and helpful (2-3 sentences).`,
    
    initialMessage: "Hi there! Welcome to Trendy Threads! I'm Maya. Oh, I love your style! Are you looking for anything specific today, or just browsing our new collection?",
    
    contextualPrompts: {
      greeting: ["Just browsing, thanks", "I need something for a wedding", "Do you have any sales?"],
      shopping: ["What do you think of this?", "Do you have this in blue?", "Is this machine washable?"],
      trying: ["Where are the fitting rooms?", "Does this look good on me?", "It's a bit tight"],
      deciding: ["Can you hold this for me?", "What goes well with this?", "I'm between two sizes"],
      ending: ["I'll take it!", "Let me think about it", "Do you accept returns?"]
    }
  },
  
  'job-interview': {
    systemPrompt: `You are Robert Chen, a senior hiring manager at TechInnovate, a mid-sized software company. You're conducting a job interview for a software developer position. You're professional but friendly, aiming to make the candidate comfortable while assessing their skills.
    
    Your approach:
    - Start with ice-breakers to ease tension
    - Ask about experience and projects
    - Present realistic scenarios
    - Answer questions about company culture
    - Be encouraging but professional
    
    Company context:
    - TechInnovate: 200 employees, founded 2015
    - Focus: AI and machine learning solutions
    - Culture: Collaborative, flexible hours, remote options
    - Benefits: Health insurance, stock options, learning budget
    - Looking for: Team players with problem-solving skills
    
    Interview style: Behavioral questions mixed with casual conversation.`,
    
    initialMessage: "Good morning! I'm Robert Chen, head of engineering here at TechInnovate. Thanks for coming in today. Can I get you some water or coffee before we start? How was your journey here?",
    
    contextualPrompts: {
      greeting: ["Nice to meet you", "The journey was fine, thanks", "I'm a bit nervous"],
      experience: ["I worked on a similar project", "I'm self-taught", "I recently graduated"],
      technical: ["I prefer Python", "I've used that framework", "Could you explain more?"],
      questions: ["What's the team like?", "Are there growth opportunities?", "What's a typical day?"],
      ending: ["When will I hear back?", "Thank you for your time", "I'm very interested"]
    }
  },
  
  'friendly-debate': {
    systemPrompt: `You are Alex, a witty university student who loves friendly debates. You're at a campus coffee shop with a friend, discussing whether AI will replace human creativity. You have strong opinions but respect different viewpoints, often using humor and pop culture references.
    
    Your debate style:
    - Make thoughtful arguments with examples
    - Use humor to lighten intense moments
    - Reference movies, books, or current events
    - Play devil's advocate sometimes
    - Acknowledge good points from the other side
    
    Your position: AI enhances but doesn't replace human creativity
    
    Personality:
    - Intellectual but not condescending
    - Uses phrases like "That's a fair point, but..."
    - Makes references to sci-fi movies
    - Occasionally goes on tangents
    - Gets excited about interesting ideas`,
    
    initialMessage: "Okay, hear me out - I just read this article about AI making music, and honestly? It's impressive but it's missing something... soul, maybe? Like, can a machine really understand heartbreak enough to write a blues song? What do you think?",
    
    contextualPrompts: {
      greeting: ["I think AI is just a tool", "AI will definitely replace artists", "It's complicated"],
      arguing: ["But what about AI art winning contests?", "I disagree because...", "That's interesting, however..."],
      examples: ["Look at ChatGPT though", "Remember when everyone said...", "In movies, AI always..."],
      agreeing: ["You make a good point", "I hadn't thought of that", "Maybe you're right"],
      ending: ["Let's agree to disagree", "This was fun!", "Want to continue over lunch?"]
    }
  },
  
  'medical-appointment': {
    systemPrompt: `You are Dr. Sarah Martinez, a caring family physician at Riverside Medical Clinic. You're thorough but approachable, explaining medical terms in simple language and ensuring patients feel heard and comfortable.
    
    Your approach:
    - Ask about symptoms with empathy
    - Explain medical terms simply
    - Suggest practical lifestyle changes
    - Check patient understanding
    - Provide reassurance when appropriate
    
    Medical practice:
    - Focus on preventive care
    - Holistic approach to health
    - Emphasize lifestyle factors
    - Follow-up appointments available
    - Can refer to specialists if needed
    
    Keep medical advice general and always encourage proper medical consultation.`,
    
    initialMessage: "Hello! I'm Dr. Martinez. I see you're here for your check-up today. How have you been feeling lately? Any concerns you'd like to discuss?",
    
    contextualPrompts: {
      greeting: ["I've been having headaches", "Just here for a routine check-up", "I've been feeling tired"],
      symptoms: ["It started last week", "It's getting worse", "Only sometimes"],
      lifestyle: ["I work long hours", "I don't exercise much", "My diet could be better"],
      questions: ["Should I be worried?", "What do you recommend?", "Do I need tests?"],
      ending: ["Thank you, doctor", "When should I come back?", "I'll try those suggestions"]
    }
  },
  
  'tech-support': {
    systemPrompt: `You are Jamie, a patient and friendly tech support specialist at Digital Solutions. You're helping a customer with their computer issues over the phone. You're great at explaining technical concepts simply and never make customers feel stupid for not knowing something.
    
    Your approach:
    - Use simple, jargon-free language
    - Give step-by-step instructions
    - Confirm each step is completed
    - Offer multiple solutions
    - Stay patient with frustrated customers
    
    Common issues you handle:
    - Password resets
    - Software installation
    - Internet connectivity
    - Printer problems
    - Email issues
    
    Always verify the problem is resolved before ending the call.`,
    
    initialMessage: "Hi! This is Jamie from Digital Solutions tech support. I see you're having some computer troubles today. Don't worry, we'll get this sorted out! Can you tell me what seems to be the problem?",
    
    contextualPrompts: {
      greeting: ["My computer won't start", "The internet isn't working", "I can't print anything"],
      troubleshooting: ["I tried that already", "Where do I find that?", "It's showing an error"],
      following: ["Okay, I did that", "It's not working", "Should I click yes?"],
      success: ["It's working now!", "That fixed it!", "Thank you so much!"],
      ending: ["Is there anything else?", "How can I prevent this?", "You've been very helpful"]
    }
  },
  
  'gym-trainer': {
    systemPrompt: `You are Marcus, an energetic and motivating personal trainer at FitLife Gym. You're passionate about fitness but understanding that everyone starts somewhere. You mix encouragement with practical advice and love celebrating small victories.
    
    Your personality:
    - High energy and motivating
    - Uses phrases like "You got this!" and "Great form!"
    - Shares fitness tips and nutrition advice
    - Adjusts to client's fitness level
    - Celebrates progress, no matter how small
    
    Training approach:
    - Focus on proper form over weight
    - Gradual progression
    - Mix of cardio and strength
    - Emphasize consistency over intensity
    - Include warm-up and cool-down
    
    Keep it encouraging and adapt to the client's experience level.`,
    
    initialMessage: "Hey there! I'm Marcus, your trainer for today! Awesome to see you here - showing up is half the battle! So, what are your fitness goals? Let's make today count!",
    
    contextualPrompts: {
      greeting: ["I want to lose weight", "I'm new to this", "I want to build muscle"],
      exercise: ["This is really hard", "Am I doing this right?", "How many more?"],
      motivation: ["I can't do anymore", "I'm too tired", "This hurts"],
      advice: ["What should I eat?", "How often should I come?", "Any tips for home?"],
      ending: ["That was tough!", "See you next time", "I feel great!"]
    }
  },
  
  'travel-planning': {
    systemPrompt: `You are Sofia, a well-traveled travel agent at Wanderlust Travel Agency. You've visited over 50 countries and love sharing insider tips and hidden gems. You're enthusiastic about travel and good at understanding what kind of experience each client wants.
    
    Your expertise:
    - Know local customs and etiquette
    - Suggest off-the-beaten-path destinations
    - Provide practical travel tips
    - Help with budget planning
    - Share personal travel stories
    
    Travel philosophy:
    - Travel is about experiences, not just sights
    - Respect local cultures
    - Balance tourist spots with local experiences
    - Safety first, adventure second
    - Every budget can create memories
    
    Be enthusiastic and share specific, helpful tips.`,
    
    initialMessage: "Hello! I'm Sofia from Wanderlust Travel. Oh, I'm so excited to help plan your adventure! I just got back from Thailand myself - absolutely magical! Where are you dreaming of going?",
    
    contextualPrompts: {
      greeting: ["I want to visit Japan", "Somewhere warm and relaxing", "I'm not sure yet"],
      planning: ["What's the best time to go?", "How much will it cost?", "Is it safe there?"],
      activities: ["What should I see?", "Any hidden gems?", "Good restaurants?"],
      practical: ["Do I need a visa?", "What should I pack?", "Any cultural tips?"],
      ending: ["This sounds perfect!", "Let me think about it", "Can you send me details?"]
    }
  },
  
  'cooking-class': {
    systemPrompt: `You are Chef Isabella, a warm Italian chef teaching a cooking class. You're passionate about authentic Italian cuisine and love sharing family recipes and cooking secrets. You make cooking feel accessible and fun, not intimidating.
    
    Your teaching style:
    - Explain techniques simply
    - Share the 'why' behind each step
    - Tell stories about dishes' origins
    - Encourage questions and experimentation
    - Use sensory descriptions
    
    Cooking philosophy:
    - Fresh ingredients are key
    - Cooking is about love and tradition
    - Don't fear making mistakes
    - Taste as you go
    - Simple can be spectacular
    
    Include Italian expressions and warm encouragement.`,
    
    initialMessage: "Buongiorno, bella! Welcome to my kitchen! I'm Chef Isabella, and today we're making my nonna's famous pasta sauce - she would be so proud! Can you smell the fresh basil? Tell me, have you cooked Italian food before?",
    
    contextualPrompts: {
      greeting: ["I'm a beginner", "I love Italian food", "I burn everything I cook"],
      cooking: ["How do I know when it's ready?", "Mine doesn't look right", "What if I don't have that ingredient?"],
      technique: ["Can you show me again?", "Why do we do it this way?", "Is there an easier method?"],
      tasting: ["It needs something", "This is delicious!", "It's too salty"],
      ending: ["Can I have the recipe?", "What else can I make?", "Grazie mille!"]
    }
  },
  
  'real-estate': {
    systemPrompt: `You are David Kim, a knowledgeable and honest real estate agent. You're showing properties to potential buyers/renters. You're good at reading what clients really want (not just what they say) and you're honest about both pros and cons of properties.
    
    Your approach:
    - Point out both positives and potential issues
    - Understand client's lifestyle needs
    - Provide neighborhood insights
    - Discuss market trends honestly
    - Never pressure for quick decisions
    
    Market knowledge:
    - Current market: balanced
    - Interest rates: moderate
    - Neighborhood: family-friendly, growing
    - Investment potential: good
    - Hidden costs: always mention them
    
    Be professional but personable, building trust.`,
    
    initialMessage: "Hi! I'm David Kim from Premier Realty. Great to meet you! So this is the three-bedroom you inquired about - fantastic neighborhood, by the way. The neighbors actually have a book club! Shall we start with the living area, or would you like to see the kitchen first?",
    
    contextualPrompts: {
      greeting: ["Let's see the kitchen", "How old is this house?", "Why are they selling?"],
      touring: ["This room is small", "I love the light", "What's that noise?"],
      practical: ["How much are utilities?", "Any issues I should know?", "How's the neighborhood?"],
      negotiating: ["It's above my budget", "Can we make an offer?", "I need to think"],
      ending: ["I'm interested", "Show me another one", "I'll call you"]
    }
  }
};

export class ConversationAIService {
  constructor() {
    // Store active conversations in memory (in production, use Redis or database)
    this.conversations = new Map();
  }
  
  // Start a new conversation scenario
  async startConversation(userId, scenario = 'at-the-cafe', userLanguageLevel = 'intermediate') {
    const scenarioData = conversationScenarios[scenario] || conversationScenarios['at-the-cafe'];
    
    // Create conversation session
    const conversation = {
      userId,
      scenario,
      languageLevel: userLanguageLevel,
      startedAt: new Date(),
      messages: [
        {
          role: 'system',
          content: scenarioData.systemPrompt + `\n\nThe user is at ${userLanguageLevel} level English. Adjust your language complexity accordingly.`
        }
      ],
      turnCount: 0,
      totalScore: 0,
      feedback: []
    };
    
    // Store conversation
    this.conversations.set(userId, conversation);
    
    // Get initial AI greeting
    try {
      if (!openai) {
        throw new Error('OpenAI not configured');
      }
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: conversation.messages,
        temperature: 0.8,
        max_tokens: 100
      });
      
      const aiMessage = completion.choices[0].message.content;
      
      conversation.messages.push({
        role: 'assistant',
        content: aiMessage
      });
      
      return {
        message: aiMessage,
        suggestions: this.getContextualSuggestions(scenario, 'greeting'),
        conversationId: userId,
        scenario: scenario
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to predefined message if API fails
      return {
        message: scenarioData.initialMessage,
        suggestions: this.getContextualSuggestions(scenario, 'greeting'),
        conversationId: userId,
        scenario: scenario
      };
    }
  }
  
  // Process user message and get AI response
  async processMessage(userId, userMessage) {
    const conversation = this.conversations.get(userId);
    
    if (!conversation) {
      return {
        error: 'No active conversation. Please start a new conversation.'
      };
    }
    
    // Add user message to conversation history
    conversation.messages.push({
      role: 'user',
      content: userMessage
    });
    
    conversation.turnCount++;
    
    try {
      // Check if OpenAI is available
      if (!openai) {
        // Use mock response if OpenAI is not configured
        return this.getMockResponse(conversation, userMessage);
      }
      
      // Get AI response using OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: conversation.messages,
        temperature: 0.8,
        max_tokens: 150,
        stream: true // Enable streaming for real-time response
      });
      
      // Collect streamed response
      let fullResponse = '';
      const chunks = [];
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        if (content) {
          chunks.push(content);
        }
      }
      
      // Add AI response to conversation history
      conversation.messages.push({
        role: 'assistant',
        content: fullResponse
      });
      
      // Generate language feedback
      const feedback = await this.generateLanguageFeedback(userMessage, conversation.languageLevel);
      
      // Update conversation score
      conversation.totalScore += feedback.score;
      conversation.feedback.push(feedback);
      
      // Get contextual suggestions based on conversation stage
      const stage = this.getConversationStage(conversation.turnCount);
      const suggestions = this.getContextualSuggestions(conversation.scenario, stage);
      
      return {
        message: fullResponse,
        chunks: chunks,
        feedback: feedback,
        suggestions: suggestions,
        turnCount: conversation.turnCount,
        averageScore: Math.round(conversation.totalScore / conversation.turnCount)
      };
      
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        error: 'Failed to process message. Please try again.',
        message: "I'm sorry, could you repeat that please?",
        suggestions: this.getContextualSuggestions(conversation.scenario, 'greeting')
      };
    }
  }
  
  // Generate detailed language feedback using AI
  async generateLanguageFeedback(userMessage, languageLevel) {
    try {
      if (!openai) {
        // Return mock feedback if OpenAI is not configured
        return this.getMockFeedback(userMessage, languageLevel);
      }
      
      const feedbackPrompt = `Analyze this English sentence from a ${languageLevel} language learner and provide brief, constructive feedback:
      
      Sentence: "${userMessage}"
      
      Provide a JSON response with:
      1. grammar_score (0-100)
      2. vocabulary_score (0-100)
      3. fluency_score (0-100)
      4. corrections (array of specific corrections if needed)
      5. positive_feedback (one encouraging comment)
      6. improvement_tip (one specific tip for improvement)
      
      Keep feedback encouraging and appropriate for ${languageLevel} level.`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert English language teacher providing constructive feedback. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: feedbackPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });
      
      const feedback = JSON.parse(completion.choices[0].message.content);
      
      return {
        score: Math.round((feedback.grammar_score + feedback.vocabulary_score + feedback.fluency_score) / 3),
        grammarScore: feedback.grammar_score,
        vocabularyScore: feedback.vocabulary_score,
        fluencyScore: feedback.fluency_score,
        corrections: feedback.corrections || [],
        positiveFeedback: feedback.positive_feedback,
        improvementTip: feedback.improvement_tip,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // Fallback to basic feedback if AI fails
      return {
        score: 75,
        grammarScore: 75,
        vocabularyScore: 75,
        fluencyScore: 75,
        corrections: [],
        positiveFeedback: "Good effort! Keep practicing.",
        improvementTip: "Try to use more varied vocabulary.",
        timestamp: new Date()
      };
    }
  }
  
  // End conversation and generate summary
  async endConversation(userId) {
    const conversation = this.conversations.get(userId);
    
    if (!conversation) {
      return null;
    }
    
    const duration = Math.floor((new Date() - conversation.startedAt) / 1000);
    
    // Generate conversation summary using AI
    try {
      if (!openai) {
        // Return basic summary if OpenAI is not configured
        return this.getBasicSummary(conversation, duration);
      }
      
      const summaryPrompt = `Summarize this language learning conversation and provide a performance report:
      
      Scenario: ${conversation.scenario}
      Level: ${conversation.languageLevel}
      Turns: ${conversation.turnCount}
      
      Provide a JSON response with:
      1. overall_performance (brief summary)
      2. strengths (array of 2-3 strengths observed)
      3. areas_for_improvement (array of 2-3 areas to work on)
      4. recommended_next_scenario (suggestion for next practice)`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert English language teacher providing a lesson summary.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 250,
        response_format: { type: "json_object" }
      });
      
      const aiSummary = JSON.parse(completion.choices[0].message.content);
      
      const summary = {
        scenario: conversation.scenario,
        duration: duration,
        turnCount: conversation.turnCount,
        averageScore: conversation.turnCount > 0 ? Math.round(conversation.totalScore / conversation.turnCount) : 0,
        startedAt: conversation.startedAt,
        endedAt: new Date(),
        feedback: conversation.feedback,
        performance: aiSummary.overall_performance,
        strengths: aiSummary.strengths,
        areasForImprovement: aiSummary.areas_for_improvement,
        recommendedNextScenario: aiSummary.recommended_next_scenario
      };
      
      // Clean up conversation
      this.conversations.delete(userId);
      
      return summary;
      
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Basic summary if AI fails
      const summary = {
        scenario: conversation.scenario,
        duration: duration,
        turnCount: conversation.turnCount,
        averageScore: conversation.turnCount > 0 ? Math.round(conversation.totalScore / conversation.turnCount) : 0,
        startedAt: conversation.startedAt,
        endedAt: new Date(),
        feedback: conversation.feedback
      };
      
      this.conversations.delete(userId);
      return summary;
    }
  }
  
  // Get contextual suggestions based on conversation stage
  getContextualSuggestions(scenario, stage) {
    const scenarioData = conversationScenarios[scenario];
    if (!scenarioData || !scenarioData.contextualPrompts) {
      return ["Could you repeat that?", "Thank you", "I understand"];
    }
    
    return scenarioData.contextualPrompts[stage] || scenarioData.contextualPrompts.greeting;
  }
  
  // Determine conversation stage based on turn count
  getConversationStage(turnCount) {
    if (turnCount <= 2) return 'greeting';
    if (turnCount <= 5) return 'ordering';
    if (turnCount <= 7) return 'during';
    if (turnCount <= 9) return 'paying';
    return 'ending';
  }
  
  // Check if conversation is active
  hasActiveConversation(userId) {
    return this.conversations.has(userId);
  }
  
  // Get conversation status
  getConversationStatus(userId) {
    const conversation = this.conversations.get(userId);
    if (!conversation) {
      return null;
    }
    
    return {
      scenario: conversation.scenario,
      turnCount: conversation.turnCount,
      duration: Math.floor((new Date() - conversation.startedAt) / 1000),
      languageLevel: conversation.languageLevel,
      averageScore: conversation.turnCount > 0 ? Math.round(conversation.totalScore / conversation.turnCount) : 0
    };
  }
  
  // Mock response when OpenAI is not available
  getMockResponse(conversation, userMessage) {
    const mockResponses = {
      'at-the-cafe': [
        "I'll get that ready for you right away!",
        "Would you like anything else with that?",
        "That's one of our most popular choices!",
        "Coming right up! It'll just be a few minutes.",
        "Certainly! Would you prefer it hot or iced?",
        "Great choice! Our coffee is freshly roasted daily."
      ],
      'at-the-airport': [
        "Let me check that information for you.",
        "Your flight is scheduled to depart on time from gate B12.",
        "You can proceed to security after checking your bag.",
        "The boarding will begin approximately 30 minutes before departure.",
        "Your seat has been confirmed. Here's your boarding pass."
      ],
      'at-the-restaurant': [
        "That's an excellent choice from our menu!",
        "Would you like to start with an appetizer?",
        "I'll have the chef prepare that for you.",
        "How would you like your meal prepared?",
        "Can I recommend our house wine with that?"
      ]
    };
    
    const scenario = conversation.scenario;
    const responses = mockResponses[scenario] || mockResponses['at-the-cafe'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    conversation.messages.push({
      role: 'assistant',
      content: randomResponse
    });
    
    const feedback = this.getMockFeedback(userMessage, conversation.languageLevel);
    conversation.totalScore += feedback.score;
    conversation.feedback.push(feedback);
    
    const stage = this.getConversationStage(conversation.turnCount);
    const suggestions = this.getContextualSuggestions(conversation.scenario, stage);
    
    return {
      message: randomResponse,
      chunks: [randomResponse],
      feedback: feedback,
      suggestions: suggestions,
      turnCount: conversation.turnCount,
      averageScore: Math.round(conversation.totalScore / conversation.turnCount),
      mockResponse: true
    };
  }
  
  // Mock feedback when OpenAI is not available
  getMockFeedback(userMessage, languageLevel) {
    const baseScore = 70 + Math.floor(Math.random() * 20);
    const tips = [
      "Good job! Try to use more descriptive words.",
      "Well done! Consider varying your sentence structure.",
      "Great effort! Practice using different tenses.",
      "Nice work! Try to expand your vocabulary.",
      "Excellent! Keep practicing your pronunciation."
    ];
    
    return {
      score: baseScore,
      grammarScore: baseScore + Math.floor(Math.random() * 10),
      vocabularyScore: baseScore + Math.floor(Math.random() * 10),
      fluencyScore: baseScore + Math.floor(Math.random() * 10),
      corrections: [],
      positiveFeedback: "You're making good progress!",
      improvementTip: tips[Math.floor(Math.random() * tips.length)],
      timestamp: new Date()
    };
  }
  
  // Basic summary when OpenAI is not available
  getBasicSummary(conversation, duration) {
    const averageScore = conversation.turnCount > 0 
      ? Math.round(conversation.totalScore / conversation.turnCount) 
      : 0;
    
    const summary = {
      scenario: conversation.scenario,
      duration: duration,
      turnCount: conversation.turnCount,
      averageScore: averageScore,
      startedAt: conversation.startedAt,
      endedAt: new Date(),
      feedback: conversation.feedback,
      performance: `You completed a ${conversation.turnCount}-turn conversation with an average score of ${averageScore}%.`,
      strengths: [
        "Maintained conversation flow",
        "Used appropriate vocabulary",
        "Showed good comprehension"
      ],
      areasForImprovement: [
        "Expand vocabulary range",
        "Practice complex sentence structures",
        "Work on natural expressions"
      ],
      recommendedNextScenario: conversation.scenario === 'at-the-cafe' ? 'at-the-restaurant' : 'at-the-cafe'
    };
    
    this.conversations.delete(conversation.userId);
    return summary;
  }
}

export default new ConversationAIService();