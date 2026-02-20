import { useState, useEffect, useCallback, useRef } from "react";
import {
  Code2,
  Heart,
  Zap,
  Trophy,
  Timer,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  Lock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

// Coding puzzles that work without a real code executor
const CODE_PUZZLES = {
  javascript: [
    // Level 1 - Basics
    {
      level: 1,
      title: "Hello World",
      description: "Write a function that returns the string 'Hello, World!'",
      template: "function helloWorld() {\n  // Your code here\n}",
      tests: [
        { input: "", expected: "Hello, World!", description: "Should return 'Hello, World!'" }
      ],
      hint: "Use the return keyword with a string",
      solution: "return 'Hello, World!';",
      xp: 10,
      difficulty: "easy"
    },
    {
      level: 1,
      title: "Add Two Numbers",
      description: "Write a function that takes two numbers and returns their sum.",
      template: "function add(a, b) {\n  // Your code here\n}",
      tests: [
        { input: "2, 3", expected: "5", description: "add(2, 3) should return 5" },
        { input: "0, 0", expected: "0", description: "add(0, 0) should return 0" },
        { input: "-1, 1", expected: "0", description: "add(-1, 1) should return 0" }
      ],
      hint: "Use the + operator",
      solution: "return a + b;",
      xp: 15,
      difficulty: "easy"
    },
    {
      level: 1,
      title: "Is Even?",
      description: "Write a function that returns true if a number is even, false otherwise.",
      template: "function isEven(num) {\n  // Your code here\n}",
      tests: [
        { input: "4", expected: "true", description: "isEven(4) should return true" },
        { input: "7", expected: "false", description: "isEven(7) should return false" },
        { input: "0", expected: "true", description: "isEven(0) should return true" }
      ],
      hint: "Use the modulo operator %",
      solution: "return num % 2 === 0;",
      xp: 15,
      difficulty: "easy"
    },
    // Level 2 - Strings
    {
      level: 2,
      title: "Reverse String",
      description: "Write a function that reverses a string.",
      template: "function reverseString(str) {\n  // Your code here\n}",
      tests: [
        { input: "'hello'", expected: "olleh", description: "reverseString('hello') should return 'olleh'" },
        { input: "'world'", expected: "dlrow", description: "reverseString('world') should return 'dlrow'" },
        { input: "'a'", expected: "a", description: "reverseString('a') should return 'a'" }
      ],
      hint: "Try splitting, reversing, and joining",
      solution: "return str.split('').reverse().join('');",
      xp: 25,
      difficulty: "easy"
    },
    {
      level: 2,
      title: "Count Vowels",
      description: "Write a function that counts the number of vowels in a string.",
      template: "function countVowels(str) {\n  // Your code here\n}",
      tests: [
        { input: "'hello'", expected: "2", description: "countVowels('hello') should return 2" },
        { input: "'aeiou'", expected: "5", description: "countVowels('aeiou') should return 5" },
        { input: "'bcdfg'", expected: "0", description: "countVowels('bcdfg') should return 0" }
      ],
      hint: "Check each character against 'aeiou'",
      solution: "return str.match(/[aeiou]/gi)?.length || 0;",
      xp: 30,
      difficulty: "easy"
    },
    {
      level: 2,
      title: "Capitalize First Letter",
      description: "Write a function that capitalizes the first letter of a string.",
      template: "function capitalize(str) {\n  // Your code here\n}",
      tests: [
        { input: "'hello'", expected: "Hello", description: "capitalize('hello') should return 'Hello'" },
        { input: "'world'", expected: "World", description: "capitalize('world') should return 'World'" }
      ],
      hint: "Use charAt(0).toUpperCase() + slice(1)",
      solution: "return str.charAt(0).toUpperCase() + str.slice(1);",
      xp: 20,
      difficulty: "easy"
    },
    // Level 3 - Arrays
    {
      level: 3,
      title: "Find Maximum",
      description: "Write a function that finds the maximum number in an array.",
      template: "function findMax(arr) {\n  // Your code here\n}",
      tests: [
        { input: "[1, 5, 3, 9, 2]", expected: "9", description: "findMax([1,5,3,9,2]) should return 9" },
        { input: "[-1, -5, -3]", expected: "-1", description: "findMax([-1,-5,-3]) should return -1" },
        { input: "[42]", expected: "42", description: "findMax([42]) should return 42" }
      ],
      hint: "Try Math.max with spread operator",
      solution: "return Math.max(...arr);",
      xp: 30,
      difficulty: "medium"
    },
    {
      level: 3,
      title: "Remove Duplicates",
      description: "Write a function that removes duplicate values from an array.",
      template: "function removeDuplicates(arr) {\n  // Your code here\n}",
      tests: [
        { input: "[1, 2, 2, 3, 3, 4]", expected: "[1,2,3,4]", description: "Should remove duplicates" },
        { input: "[1, 1, 1]", expected: "[1]", description: "Should handle all same values" }
      ],
      hint: "Try using Set",
      solution: "return [...new Set(arr)];",
      xp: 35,
      difficulty: "medium"
    },
    {
      level: 3,
      title: "Sum Array",
      description: "Write a function that returns the sum of all numbers in an array.",
      template: "function sumArray(arr) {\n  // Your code here\n}",
      tests: [
        { input: "[1, 2, 3, 4, 5]", expected: "15", description: "sumArray([1,2,3,4,5]) should return 15" },
        { input: "[10, -5, 3]", expected: "8", description: "sumArray([10,-5,3]) should return 8" },
        { input: "[]", expected: "0", description: "sumArray([]) should return 0" }
      ],
      hint: "Use reduce method",
      solution: "return arr.reduce((sum, n) => sum + n, 0);",
      xp: 25,
      difficulty: "medium"
    },
    // Level 4 - Logic
    {
      level: 4,
      title: "FizzBuzz",
      description: "Return 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both, else the number as string.",
      template: "function fizzBuzz(n) {\n  // Your code here\n}",
      tests: [
        { input: "15", expected: "FizzBuzz", description: "fizzBuzz(15) should return 'FizzBuzz'" },
        { input: "3", expected: "Fizz", description: "fizzBuzz(3) should return 'Fizz'" },
        { input: "5", expected: "Buzz", description: "fizzBuzz(5) should return 'Buzz'" },
        { input: "7", expected: "7", description: "fizzBuzz(7) should return '7'" }
      ],
      hint: "Check divisible by 15 first, then 3, then 5",
      solution: "if (n % 15 === 0) return 'FizzBuzz';\nif (n % 3 === 0) return 'Fizz';\nif (n % 5 === 0) return 'Buzz';\nreturn String(n);",
      xp: 40,
      difficulty: "medium"
    },
    {
      level: 4,
      title: "Palindrome Check",
      description: "Write a function that checks if a string is a palindrome (reads same forwards and backwards).",
      template: "function isPalindrome(str) {\n  // Your code here\n}",
      tests: [
        { input: "'racecar'", expected: "true", description: "isPalindrome('racecar') should return true" },
        { input: "'hello'", expected: "false", description: "isPalindrome('hello') should return false" },
        { input: "'madam'", expected: "true", description: "isPalindrome('madam') should return true" }
      ],
      hint: "Compare the string with its reverse",
      solution: "return str === str.split('').reverse().join('');",
      xp: 35,
      difficulty: "medium"
    },
    // Level 5 - Advanced
    {
      level: 5,
      title: "Fibonacci",
      description: "Write a function that returns the nth Fibonacci number (0-indexed).",
      template: "function fibonacci(n) {\n  // Your code here\n}",
      tests: [
        { input: "0", expected: "0", description: "fibonacci(0) should return 0" },
        { input: "1", expected: "1", description: "fibonacci(1) should return 1" },
        { input: "6", expected: "8", description: "fibonacci(6) should return 8" },
        { input: "10", expected: "55", description: "fibonacci(10) should return 55" }
      ],
      hint: "Use iteration: start with 0, 1 and build up",
      solution: "if (n <= 1) return n;\nlet a = 0, b = 1;\nfor (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; }\nreturn b;",
      xp: 50,
      difficulty: "hard"
    },
    {
      level: 5,
      title: "Flatten Array",
      description: "Write a function that flattens a nested array into a single array.",
      template: "function flatten(arr) {\n  // Your code here\n}",
      tests: [
        { input: "[[1, 2], [3, 4], [5]]", expected: "[1,2,3,4,5]", description: "Should flatten one level" },
        { input: "[[1, [2, 3]], [4]]", expected: "[1,2,3,4]", description: "Should flatten deeply" }
      ],
      hint: "Use Array.flat(Infinity) or recursion",
      solution: "return arr.flat(Infinity);",
      xp: 45,
      difficulty: "hard"
    }
  ]
};

const LEVELS = [
  { level: 1, name: "Rookie", icon: "🌱", color: "text-green-500", requiredXP: 0 },
  { level: 2, name: "Apprentice", icon: "⚡", color: "text-blue-500", requiredXP: 30 },
  { level: 3, name: "Warrior", icon: "🗡️", color: "text-purple-500", requiredXP: 80 },
  { level: 4, name: "Master", icon: "🔥", color: "text-orange-500", requiredXP: 150 },
  { level: 5, name: "Legend", icon: "👑", color: "text-yellow-500", requiredXP: 250 },
];

const CodeArenaPage = () => {
  const { authUser } = useAuthUser();
  const [gameState, setGameState] = useState("menu"); // menu, playing, result, levelSelect
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const timerRef = useRef(null);

  const puzzles = CODE_PUZZLES.javascript;
  const levelPuzzles = puzzles.filter(p => p.level === currentLevel);
  const currentPuzzle = levelPuzzles[currentPuzzleIndex];

  const unlockedLevel = LEVELS.findIndex(l => totalXP < l.requiredXP);
  const maxUnlockedLevel = unlockedLevel === -1 ? 5 : Math.max(1, unlockedLevel);

  // Timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startLevel = (level) => {
    if (level > maxUnlockedLevel) {
      toast.error(`Earn more XP to unlock Level ${level}!`);
      return;
    }
    setCurrentLevel(level);
    setCurrentPuzzleIndex(0);
    setLives(3);
    setScore(0);
    setStreak(0);
    setTimer(0);
    setTestResults([]);
    setShowHint(false);
    setShowSolution(false);
    const firstPuzzle = puzzles.filter(p => p.level === level)[0];
    setCode(firstPuzzle?.template || "");
    setGameState("playing");
    setIsRunning(true);
  };

  const runTests = useCallback(() => {
    if (!currentPuzzle) return;

    const results = [];
    let allPassed = true;

    for (const test of currentPuzzle.tests) {
      try {
        // Create a safe evaluation context
        const funcBody = code
          .replace(/function\s+\w+\s*\([^)]*\)\s*\{/, "")
          .replace(/\}$/, "")
          .trim();

        // Extract function name and params from template
        const funcMatch = currentPuzzle.template.match(/function\s+(\w+)\s*\(([^)]*)\)/);
        const funcName = funcMatch?.[1] || "solve";
        const params = funcMatch?.[2] || "";

        // Build and evaluate
        const testFunc = new Function(params, funcBody);
        const args = test.input ? test.input.split(",").map(a => {
          const trimmed = a.trim();
          try { return JSON.parse(trimmed); } catch { return trimmed.replace(/'/g, ""); }
        }) : [];

        const result = testFunc(...args);
        const resultStr = JSON.stringify(result) || String(result);
        const expectedStr = test.expected;

        // Flexible comparison
        const passed = resultStr === expectedStr ||
          resultStr === `"${expectedStr}"` ||
          String(result) === expectedStr;

        results.push({ ...test, result: resultStr, passed });
        if (!passed) allPassed = false;
      } catch (error) {
        results.push({ ...test, result: `Error: ${error.message}`, passed: false });
        allPassed = false;
      }
    }

    setTestResults(results);

    if (allPassed) {
      const puzzleId = `${currentLevel}-${currentPuzzleIndex}`;
      const isNew = !solvedPuzzles.has(puzzleId);
      const xpEarned = isNew ? currentPuzzle.xp : Math.floor(currentPuzzle.xp / 4);

      setSolvedPuzzles(prev => new Set([...prev, puzzleId]));
      setScore(prev => prev + xpEarned);
      setTotalXP(prev => prev + xpEarned);
      setStreak(prev => prev + 1);

      toast.success(`+${xpEarned} XP! ${streak >= 2 ? `🔥 ${streak + 1}x streak!` : ""}`, { duration: 2000 });

      // Track on backend
      try {
        axiosInstance.post("/activity/log", {
          activityType: "coding_challenge",
          details: { puzzle: currentPuzzle.title, xpEarned, level: currentLevel }
        });
      } catch { /* non-critical */ }

      // Auto-advance after a short delay
      setTimeout(() => {
        if (currentPuzzleIndex < levelPuzzles.length - 1) {
          nextPuzzle();
        } else {
          // Level complete!
          setIsRunning(false);
          setGameState("result");
        }
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      toast.error("Some tests failed. Try again!", { duration: 1500 });

      if (lives <= 1) {
        setIsRunning(false);
        setGameState("result");
      }
    }
  }, [code, currentPuzzle, currentPuzzleIndex, levelPuzzles.length, lives, streak, solvedPuzzles, currentLevel]);

  const nextPuzzle = () => {
    const nextIdx = currentPuzzleIndex + 1;
    if (nextIdx < levelPuzzles.length) {
      setCurrentPuzzleIndex(nextIdx);
      const nextP = levelPuzzles[nextIdx];
      setCode(nextP?.template || "");
      setTestResults([]);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const resetPuzzle = () => {
    setCode(currentPuzzle?.template || "");
    setTestResults([]);
    setShowHint(false);
    setShowSolution(false);
  };

  // ========= MENU SCREEN =========
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
          {/* Hero */}
          <div className="card bg-gradient-to-br from-violet-600 to-indigo-700 text-white mb-8">
            <div className="card-body items-center text-center py-12">
              <Code2 className="size-16 mb-4" />
              <h1 className="text-4xl font-bold mb-2">Code Arena</h1>
              <p className="text-lg opacity-90 mb-6">
                Learn coding through fun puzzles and challenges
              </p>
              <div className="flex gap-4 items-center">
                <div className="badge badge-lg bg-white/20 border-0 gap-1">
                  <Zap className="size-4" /> {totalXP} XP
                </div>
                <div className="badge badge-lg bg-white/20 border-0 gap-1">
                  <Trophy className="size-4" /> {solvedPuzzles.size} solved
                </div>
              </div>
            </div>
          </div>

          {/* Level Selection */}
          <h2 className="text-xl font-bold mb-4">Choose Your Level</h2>
          <div className="space-y-3 mb-8">
            {LEVELS.map((level) => {
              const isLocked = level.level > maxUnlockedLevel;
              const levelPuzzleCount = puzzles.filter(p => p.level === level.level).length;
              const solvedCount = puzzles.filter(p => p.level === level.level)
                .filter((_, i) => solvedPuzzles.has(`${level.level}-${i}`)).length;

              return (
                <button
                  key={level.level}
                  onClick={() => startLevel(level.level)}
                  disabled={isLocked}
                  className={`card w-full text-left transition-all ${
                    isLocked
                      ? "bg-base-300 opacity-60 cursor-not-allowed"
                      : "bg-base-200 hover:bg-base-300 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  <div className="card-body p-4 flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${isLocked ? "grayscale" : ""}`}>
                        {isLocked ? <Lock className="size-8 opacity-50" /> : level.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Level {level.level}: {level.name}
                        </h3>
                        <p className="text-sm opacity-70">
                          {isLocked
                            ? `Need ${level.requiredXP} XP to unlock (you have ${totalXP})`
                            : `${solvedCount}/${levelPuzzleCount} puzzles solved`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isLocked && solvedCount === levelPuzzleCount && levelPuzzleCount > 0 && (
                        <div className="badge badge-success gap-1">
                          <Star className="size-3" /> Complete
                        </div>
                      )}
                      {!isLocked && (
                        <ChevronRight className="size-5 opacity-50" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-bold text-lg mb-3">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🧩</div>
                  <p className="font-semibold">Solve Puzzles</p>
                  <p className="text-sm opacity-70">Write code to pass all tests</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="font-semibold">Earn XP</p>
                  <p className="text-sm opacity-70">Build streaks for bonus points</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="font-semibold">Unlock Levels</p>
                  <p className="text-sm opacity-70">Progress from Rookie to Legend</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========= RESULT SCREEN =========
  if (gameState === "result") {
    const levelComplete = lives > 0;
    return (
      <div className="min-h-screen bg-base-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="card bg-base-200 shadow-2xl max-w-md w-full">
          <div className="card-body items-center text-center">
            <div className="text-6xl mb-4">
              {levelComplete ? "🎉" : "💪"}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {levelComplete ? "Level Complete!" : "Game Over"}
            </h2>
            <p className="text-base-content/70 mb-6">
              {levelComplete
                ? "Amazing work! You crushed it!"
                : "Don't give up! Practice makes perfect."}
            </p>

            <div className="stats shadow w-full mb-6">
              <div className="stat">
                <div className="stat-title">XP Earned</div>
                <div className="stat-value text-primary">{score}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Time</div>
                <div className="stat-value text-secondary">{formatTime(timer)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Lives Left</div>
                <div className="stat-value text-error">
                  {"❤️".repeat(Math.max(0, lives))}
                  {"🖤".repeat(3 - Math.max(0, lives))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                className="btn btn-outline flex-1"
                onClick={() => setGameState("menu")}
              >
                <ArrowLeft className="size-4" />
                Menu
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={() => startLevel(currentLevel)}
              >
                <RotateCcw className="size-4" />
                Retry
              </button>
              {levelComplete && currentLevel < 5 && (
                <button
                  className="btn btn-success flex-1"
                  onClick={() => startLevel(currentLevel + 1)}
                  disabled={currentLevel + 1 > maxUnlockedLevel}
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========= PLAYING SCREEN =========
  return (
    <div className="min-h-screen bg-base-100 p-2 sm:p-4">
      <div className="container mx-auto max-w-5xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setIsRunning(false);
              setGameState("menu");
            }}
          >
            <ArrowLeft className="size-4" /> Exit
          </button>

          <div className="flex items-center gap-3">
            {/* Lives */}
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`size-5 ${i < lives ? "text-red-500 fill-red-500" : "text-base-content/20"}`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="badge badge-outline gap-1">
              <Timer className="size-3" />
              {formatTime(timer)}
            </div>

            {/* Score */}
            <div className="badge badge-primary gap-1">
              <Zap className="size-3" />
              {score} XP
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="badge badge-warning gap-1">
                <Flame className="size-3" />
                {streak}x
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">
              Level {currentLevel}: {LEVELS[currentLevel - 1]?.name}
            </span>
            <span className="text-base-content/70">
              Puzzle {currentPuzzleIndex + 1} / {levelPuzzles.length}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={currentPuzzleIndex + 1}
            max={levelPuzzles.length}
          />
        </div>

        {currentPuzzle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Problem Description */}
            <div className="space-y-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">
                      {currentPuzzle.title}
                    </h2>
                    <span className={`badge ${
                      currentPuzzle.difficulty === "easy" ? "badge-success" :
                      currentPuzzle.difficulty === "medium" ? "badge-warning" :
                      "badge-error"
                    }`}>
                      {currentPuzzle.difficulty}
                    </span>
                  </div>
                  <p className="text-base-content/80 mt-2">
                    {currentPuzzle.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="badge badge-outline badge-sm">+{currentPuzzle.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Test Cases */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="font-semibold mb-2">Test Cases</h3>
                  <div className="space-y-2">
                    {currentPuzzle.tests.map((test, i) => {
                      const result = testResults[i];
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-2 p-2 rounded-lg ${
                            result
                              ? result.passed
                                ? "bg-success/10"
                                : "bg-error/10"
                              : "bg-base-300/50"
                          }`}
                        >
                          {result ? (
                            result.passed ? (
                              <CheckCircle2 className="size-5 text-success mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="size-5 text-error mt-0.5 shrink-0" />
                            )
                          ) : (
                            <div className="size-5 rounded-full border-2 border-base-content/20 mt-0.5 shrink-0" />
                          )}
                          <div className="text-sm">
                            <p className="font-medium">{test.description}</p>
                            {result && !result.passed && (
                              <p className="text-error text-xs mt-1">
                                Got: {result.result}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hint / Solution */}
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm flex-1"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? "Hide Hint" : "💡 Show Hint"}
                </button>
                <button
                  className="btn btn-outline btn-warning btn-sm flex-1"
                  onClick={() => setShowSolution(!showSolution)}
                >
                  {showSolution ? "Hide Solution" : "🔑 Show Solution (-XP)"}
                </button>
              </div>

              {showHint && (
                <div className="alert alert-info">
                  <span className="text-sm">{currentPuzzle.hint}</span>
                </div>
              )}

              {showSolution && (
                <div className="alert alert-warning">
                  <div>
                    <p className="text-sm font-semibold mb-1">Solution:</p>
                    <pre className="text-xs bg-base-300 p-2 rounded">{currentPuzzle.solution}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Code Editor */}
            <div className="space-y-4">
              <div className="card bg-base-200">
                <div className="card-body p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Code2 className="size-4" /> JavaScript
                    </span>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={resetPuzzle}
                    >
                      <RotateCcw className="size-3" /> Reset
                    </button>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="textarea textarea-bordered w-full font-mono text-sm bg-base-300"
                    style={{
                      minHeight: "250px",
                      resize: "vertical",
                      tabSize: 2,
                      lineHeight: "1.6",
                    }}
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const start = e.target.selectionStart;
                        const end = e.target.selectionEnd;
                        setCode(code.substring(0, start) + "  " + code.substring(end));
                        setTimeout(() => {
                          e.target.selectionStart = e.target.selectionEnd = start + 2;
                        }, 0);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Run Button */}
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={runTests}
              >
                <Play className="size-5" />
                Run Tests
              </button>

              {/* Quick Navigation */}
              <div className="card bg-base-200">
                <div className="card-body p-3">
                  <p className="text-sm font-semibold mb-2">Puzzles in this level:</p>
                  <div className="flex gap-2 flex-wrap">
                    {levelPuzzles.map((p, i) => {
                      const isSolved = solvedPuzzles.has(`${currentLevel}-${i}`);
                      const isCurrent = i === currentPuzzleIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentPuzzleIndex(i);
                            setCode(p.template);
                            setTestResults([]);
                            setShowHint(false);
                            setShowSolution(false);
                          }}
                          className={`btn btn-sm ${
                            isCurrent
                              ? "btn-primary"
                              : isSolved
                                ? "btn-success btn-outline"
                                : "btn-ghost"
                          }`}
                        >
                          {isSolved && <CheckCircle2 className="size-3" />}
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeArenaPage;
