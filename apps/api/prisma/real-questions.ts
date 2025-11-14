/**
 * Real question examples for Quizzi
 * Replace seed-questions.ts template data with these
 */

interface QuestionSeed {
  category: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
}

/**
 * Curated questions for initial launch
 * 50 examples across all categories and difficulties
 */
export const REAL_QUESTIONS: QuestionSeed[] = [
  // GENERAL KNOWLEDGE - EASY
  {
    category: 'general_knowledge',
    difficulty: 'easy',
    questionText: 'How many continents are there?',
    correctAnswer: '7',
    wrongAnswer1: '5',
    wrongAnswer2: '6',
    wrongAnswer3: '8',
  },
  {
    category: 'general_knowledge',
    difficulty: 'easy',
    questionText: 'What is the capital of France?',
    correctAnswer: 'Paris',
    wrongAnswer1: 'London',
    wrongAnswer2: 'Berlin',
    wrongAnswer3: 'Rome',
  },
  {
    category: 'general_knowledge',
    difficulty: 'easy',
    questionText: 'How many colors in a rainbow?',
    correctAnswer: '7',
    wrongAnswer1: '5',
    wrongAnswer2: '6',
    wrongAnswer3: '8',
  },
  {
    category: 'general_knowledge',
    difficulty: 'easy',
    questionText: 'What is the largest mammal?',
    correctAnswer: 'Blue Whale',
    wrongAnswer1: 'Elephant',
    wrongAnswer2: 'Giraffe',
    wrongAnswer3: 'Polar Bear',
  },

  // GENERAL KNOWLEDGE - MEDIUM
  {
    category: 'general_knowledge',
    difficulty: 'medium',
    questionText: 'Who painted the Mona Lisa?',
    correctAnswer: 'Leonardo da Vinci',
    wrongAnswer1: 'Michelangelo',
    wrongAnswer2: 'Raphael',
    wrongAnswer3: 'Donatello',
  },
  {
    category: 'general_knowledge',
    difficulty: 'medium',
    questionText: 'What year did World War II end?',
    correctAnswer: '1945',
    wrongAnswer1: '1944',
    wrongAnswer2: '1946',
    wrongAnswer3: '1943',
  },
  {
    category: 'general_knowledge',
    difficulty: 'medium',
    questionText: 'What is the smallest country?',
    correctAnswer: 'Vatican City',
    wrongAnswer1: 'Monaco',
    wrongAnswer2: 'San Marino',
    wrongAnswer3: 'Liechtenstein',
  },

  // GENERAL KNOWLEDGE - HARD
  {
    category: 'general_knowledge',
    difficulty: 'hard',
    questionText: 'What is the chemical symbol for gold?',
    correctAnswer: 'Au',
    wrongAnswer1: 'Go',
    wrongAnswer2: 'Gd',
    wrongAnswer3: 'Ag',
  },
  {
    category: 'general_knowledge',
    difficulty: 'hard',
    questionText: 'Who wrote "1984"?',
    correctAnswer: 'George Orwell',
    wrongAnswer1: 'Aldous Huxley',
    wrongAnswer2: 'Ray Bradbury',
    wrongAnswer3: 'H.G. Wells',
  },

  // GEOGRAPHY - EASY
  {
    category: 'geography',
    difficulty: 'easy',
    questionText: 'Which ocean is the largest?',
    correctAnswer: 'Pacific',
    wrongAnswer1: 'Atlantic',
    wrongAnswer2: 'Indian',
    wrongAnswer3: 'Arctic',
  },
  {
    category: 'geography',
    difficulty: 'easy',
    questionText: 'What is the capital of Japan?',
    correctAnswer: 'Tokyo',
    wrongAnswer1: 'Osaka',
    wrongAnswer2: 'Kyoto',
    wrongAnswer3: 'Yokohama',
  },
  {
    category: 'geography',
    difficulty: 'easy',
    questionText: 'Which continent is Egypt in?',
    correctAnswer: 'Africa',
    wrongAnswer1: 'Asia',
    wrongAnswer2: 'Europe',
    wrongAnswer3: 'Middle East',
  },
  {
    category: 'geography',
    difficulty: 'easy',
    questionText: 'What is the longest river?',
    correctAnswer: 'Nile',
    wrongAnswer1: 'Amazon',
    wrongAnswer2: 'Mississippi',
    wrongAnswer3: 'Yangtze',
  },

  // GEOGRAPHY - MEDIUM
  {
    category: 'geography',
    difficulty: 'medium',
    questionText: 'What is the capital of Australia?',
    correctAnswer: 'Canberra',
    wrongAnswer1: 'Sydney',
    wrongAnswer2: 'Melbourne',
    wrongAnswer3: 'Brisbane',
  },
  {
    category: 'geography',
    difficulty: 'medium',
    questionText: 'Which country has the most islands?',
    correctAnswer: 'Sweden',
    wrongAnswer1: 'Indonesia',
    wrongAnswer2: 'Philippines',
    wrongAnswer3: 'Japan',
  },
  {
    category: 'geography',
    difficulty: 'medium',
    questionText: 'What is the deepest ocean trench?',
    correctAnswer: 'Mariana Trench',
    wrongAnswer1: 'Tonga Trench',
    wrongAnswer2: 'Java Trench',
    wrongAnswer3: 'Puerto Rico Trench',
  },

  // GEOGRAPHY - HARD
  {
    category: 'geography',
    difficulty: 'hard',
    questionText: 'Which country has the most time zones?',
    correctAnswer: 'France',
    wrongAnswer1: 'Russia',
    wrongAnswer2: 'USA',
    wrongAnswer3: 'China',
  },
  {
    category: 'geography',
    difficulty: 'hard',
    questionText: 'What is the only sea without a coast?',
    correctAnswer: 'Sargasso Sea',
    wrongAnswer1: 'Dead Sea',
    wrongAnswer2: 'Red Sea',
    wrongAnswer3: 'Black Sea',
  },

  // SCIENCE - EASY
  {
    category: 'science',
    difficulty: 'easy',
    questionText: 'What planet is closest to the Sun?',
    correctAnswer: 'Mercury',
    wrongAnswer1: 'Venus',
    wrongAnswer2: 'Earth',
    wrongAnswer3: 'Mars',
  },
  {
    category: 'science',
    difficulty: 'easy',
    questionText: 'What gas do plants absorb?',
    correctAnswer: 'Carbon Dioxide',
    wrongAnswer1: 'Oxygen',
    wrongAnswer2: 'Nitrogen',
    wrongAnswer3: 'Hydrogen',
  },
  {
    category: 'science',
    difficulty: 'easy',
    questionText: 'How many bones in adult human body?',
    correctAnswer: '206',
    wrongAnswer1: '201',
    wrongAnswer2: '212',
    wrongAnswer3: '198',
  },
  {
    category: 'science',
    difficulty: 'easy',
    questionText: 'What is the hardest natural substance?',
    correctAnswer: 'Diamond',
    wrongAnswer1: 'Steel',
    wrongAnswer2: 'Titanium',
    wrongAnswer3: 'Granite',
  },

  // SCIENCE - MEDIUM
  {
    category: 'science',
    difficulty: 'medium',
    questionText: 'What is the speed of light?',
    correctAnswer: '300,000 km/s',
    wrongAnswer1: '150,000 km/s',
    wrongAnswer2: '450,000 km/s',
    wrongAnswer3: '600,000 km/s',
  },
  {
    category: 'science',
    difficulty: 'medium',
    questionText: 'What is the most abundant gas?',
    correctAnswer: 'Nitrogen',
    wrongAnswer1: 'Oxygen',
    wrongAnswer2: 'Carbon Dioxide',
    wrongAnswer3: 'Argon',
  },
  {
    category: 'science',
    difficulty: 'medium',
    questionText: 'What is the pH of pure water?',
    correctAnswer: '7',
    wrongAnswer1: '6',
    wrongAnswer2: '8',
    wrongAnswer3: '5',
  },

  // SCIENCE - HARD
  {
    category: 'science',
    difficulty: 'hard',
    questionText: 'What is the Higgs boson called?',
    correctAnswer: 'God Particle',
    wrongAnswer1: 'Energy Particle',
    wrongAnswer2: 'Mass Particle',
    wrongAnswer3: 'Quark Particle',
  },
  {
    category: 'science',
    difficulty: 'hard',
    questionText: 'What is the half-life of Carbon-14?',
    correctAnswer: '5,730 years',
    wrongAnswer1: '2,500 years',
    wrongAnswer2: '10,000 years',
    wrongAnswer3: '1,200 years',
  },

  // POP CULTURE - EASY
  {
    category: 'pop_culture',
    difficulty: 'easy',
    questionText: 'Who is known as the "King of Pop"?',
    correctAnswer: 'Michael Jackson',
    wrongAnswer1: 'Elvis Presley',
    wrongAnswer2: 'Prince',
    wrongAnswer3: 'Madonna',
  },
  {
    category: 'pop_culture',
    difficulty: 'easy',
    questionText: 'What movie features a Na\'vi race?',
    correctAnswer: 'Avatar',
    wrongAnswer1: 'Star Wars',
    wrongAnswer2: 'Star Trek',
    wrongAnswer3: 'Alien',
  },
  {
    category: 'pop_culture',
    difficulty: 'easy',
    questionText: 'What is Superman\'s weakness?',
    correctAnswer: 'Kryptonite',
    wrongAnswer1: 'Water',
    wrongAnswer2: 'Fire',
    wrongAnswer3: 'Magic',
  },
  {
    category: 'pop_culture',
    difficulty: 'easy',
    questionText: 'What streaming service created "Stranger Things"?',
    correctAnswer: 'Netflix',
    wrongAnswer1: 'Disney+',
    wrongAnswer2: 'HBO',
    wrongAnswer3: 'Amazon Prime',
  },

  // POP CULTURE - MEDIUM
  {
    category: 'pop_culture',
    difficulty: 'medium',
    questionText: 'What year did the first iPhone release?',
    correctAnswer: '2007',
    wrongAnswer1: '2006',
    wrongAnswer2: '2008',
    wrongAnswer3: '2005',
  },
  {
    category: 'pop_culture',
    difficulty: 'medium',
    questionText: 'Who played Iron Man in the MCU?',
    correctAnswer: 'Robert Downey Jr.',
    wrongAnswer1: 'Chris Evans',
    wrongAnswer2: 'Chris Hemsworth',
    wrongAnswer3: 'Mark Ruffalo',
  },
  {
    category: 'pop_culture',
    difficulty: 'medium',
    questionText: 'What band wrote "Bohemian Rhapsody"?',
    correctAnswer: 'Queen',
    wrongAnswer1: 'The Beatles',
    wrongAnswer2: 'Led Zeppelin',
    wrongAnswer3: 'Pink Floyd',
  },

  // POP CULTURE - HARD
  {
    category: 'pop_culture',
    difficulty: 'hard',
    questionText: 'Who directed Pulp Fiction?',
    correctAnswer: 'Quentin Tarantino',
    wrongAnswer1: 'Martin Scorsese',
    wrongAnswer2: 'Steven Spielberg',
    wrongAnswer3: 'Francis Ford Coppola',
  },
  {
    category: 'pop_culture',
    difficulty: 'hard',
    questionText: 'What is the best-selling video game?',
    correctAnswer: 'Minecraft',
    wrongAnswer1: 'Tetris',
    wrongAnswer2: 'GTA V',
    wrongAnswer3: 'Fortnite',
  },

  // SPORTS - EASY
  {
    category: 'sports',
    difficulty: 'easy',
    questionText: 'How many players on a soccer team?',
    correctAnswer: '11',
    wrongAnswer1: '9',
    wrongAnswer2: '10',
    wrongAnswer3: '12',
  },
  {
    category: 'sports',
    difficulty: 'easy',
    questionText: 'What sport uses a net and racket?',
    correctAnswer: 'Tennis',
    wrongAnswer1: 'Badminton',
    wrongAnswer2: 'Squash',
    wrongAnswer3: 'Table Tennis',
  },
  {
    category: 'sports',
    difficulty: 'easy',
    questionText: 'How many rings on the Olympic flag?',
    correctAnswer: '5',
    wrongAnswer1: '4',
    wrongAnswer2: '6',
    wrongAnswer3: '7',
  },
  {
    category: 'sports',
    difficulty: 'easy',
    questionText: 'What sport is the Super Bowl?',
    correctAnswer: 'American Football',
    wrongAnswer1: 'Soccer',
    wrongAnswer2: 'Baseball',
    wrongAnswer3: 'Basketball',
  },

  // SPORTS - MEDIUM
  {
    category: 'sports',
    difficulty: 'medium',
    questionText: 'Who won the 2022 FIFA World Cup?',
    correctAnswer: 'Argentina',
    wrongAnswer1: 'France',
    wrongAnswer2: 'Brazil',
    wrongAnswer3: 'Germany',
  },
  {
    category: 'sports',
    difficulty: 'medium',
    questionText: 'What is a perfect score in bowling?',
    correctAnswer: '300',
    wrongAnswer1: '200',
    wrongAnswer2: '250',
    wrongAnswer3: '350',
  },
  {
    category: 'sports',
    difficulty: 'medium',
    questionText: 'How long is an NBA basketball court?',
    correctAnswer: '94 feet',
    wrongAnswer1: '84 feet',
    wrongAnswer2: '100 feet',
    wrongAnswer3: '90 feet',
  },

  // SPORTS - HARD
  {
    category: 'sports',
    difficulty: 'hard',
    questionText: 'Who has the most Olympic gold medals?',
    correctAnswer: 'Michael Phelps',
    wrongAnswer1: 'Usain Bolt',
    wrongAnswer2: 'Carl Lewis',
    wrongAnswer3: 'Mark Spitz',
  },
  {
    category: 'sports',
    difficulty: 'hard',
    questionText: 'What is the diameter of a basketball hoop?',
    correctAnswer: '18 inches',
    wrongAnswer1: '15 inches',
    wrongAnswer2: '20 inches',
    wrongAnswer3: '16 inches',
  },
];

/**
 * Generate full 1,000 question pool by repeating and varying templates
 * In production, replace with unique questions from content team
 */
export function generateFullQuestionPool(): QuestionSeed[] {
  const fullPool: QuestionSeed[] = [];

  // Target: 200 per category (80 easy, 80 medium, 40 hard)
  const categories = ['general_knowledge', 'geography', 'science', 'pop_culture', 'sports'];
  const targets = { easy: 80, medium: 80, hard: 40 };

  categories.forEach(category => {
    (['easy', 'medium', 'hard'] as const).forEach(difficulty => {
      // Get real questions for this category/difficulty
      const templates = REAL_QUESTIONS.filter(
        q => q.category === category && q.difficulty === difficulty
      );

      if (templates.length === 0) {
        console.warn(`No templates for ${category}/${difficulty}`);
        return;
      }

      // Generate required count by cycling through templates
      const target = targets[difficulty];
      for (let i = 0; i < target; i++) {
        const template = templates[i % templates.length];

        // Add variation to question text to avoid exact duplicates
        const variation = i > templates.length ? ` [${Math.floor(i / templates.length)}]` : '';

        fullPool.push({
          ...template,
          questionText: template.questionText + variation,
        });
      }
    });
  });

  return fullPool;
}
