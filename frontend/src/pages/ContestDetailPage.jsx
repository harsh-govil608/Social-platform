import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  Trophy,
  Clock,
  Users,
  Play,
  Check,
  X,
  ChevronLeft,
  Code,
  Send,
  Medal,
  Timer,
  Loader2
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const ContestDetailPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await axiosInstance.get(`/contests/${id}`);
        setContest(response.data.contest);
        if (response.data.contest.problems?.length > 0) {
          setSelectedProblem(0);
        }
      } catch (error) {
        console.error('Error fetching contest:', error);
        toast.error('Failed to load contest');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContest();
  }, [id]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!contest?.isRegistered) return;
      try {
        const response = await axiosInstance.get(`/contests/${id}/submissions`);
        setSubmissions(response.data.submissions || []);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };
    fetchSubmissions();
  }, [id, contest?.isRegistered]);

  // Timer countdown
  useEffect(() => {
    if (!contest || contest.status !== 'live') return;

    const endTime = new Date(contest.endTime).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        toast('Contest has ended!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const handleRegister = async () => {
    try {
      await axiosInstance.post(`/contests/${id}/register`);
      toast.success('Successfully registered!');
      // Refresh contest data
      const response = await axiosInstance.get(`/contests/${id}`);
      setContest(response.data.contest);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `/contests/${id}/submit/${selectedProblem}`,
        { code, language }
      );

      const result = response.data.submission;
      if (result.status === 'accepted') {
        toast.success(`Accepted! Score: ${result.score}`);
      } else {
        toast.error(`${result.status.replace('_', ' ')}: ${result.passedTests}/${result.totalTests} tests passed`);
      }

      // Refresh submissions
      const subResponse = await axiosInstance.get(`/contests/${id}/submissions`);
      setSubmissions(subResponse.data.submissions || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Contest not found</h2>
        <Link to="/contests" className="btn btn-primary">
          Back to Contests
        </Link>
      </div>
    );
  }

  const currentProblem = contest.problems?.[selectedProblem];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/contests" className="btn btn-ghost btn-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Contests
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-warning" />
            {contest.title}
          </h1>
        </div>

        {/* Timer / Status */}
        <div className="text-right">
          {contest.status === 'live' && (
            <div className="stat bg-error/10 rounded-lg px-4 py-2">
              <div className="stat-title text-xs">Time Remaining</div>
              <div className="stat-value text-2xl text-error font-mono">
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
          {contest.status === 'upcoming' && (
            <div className="badge badge-warning badge-lg">Upcoming</div>
          )}
          {contest.status === 'ended' && (
            <div className="badge badge-ghost badge-lg">Ended</div>
          )}
        </div>
      </div>

      {/* Not registered state */}
      {!contest.isRegistered && contest.status !== 'ended' && (
        <div className="alert alert-info mb-6">
          <div>
            <h3 className="font-bold">Not Registered</h3>
            <p className="text-sm">Register to participate in this contest</p>
          </div>
          <button className="btn btn-primary" onClick={handleRegister}>
            Register Now
          </button>
        </div>
      )}

      {/* Contest hasn't started */}
      {contest.status === 'upcoming' && (
        <div className="text-center py-12 bg-base-200 rounded-xl">
          <Timer className="w-16 h-16 mx-auto text-warning mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contest hasn't started yet</h2>
          <p className="opacity-70">
            Starts at {new Date(contest.startTime).toLocaleString()}
          </p>
        </div>
      )}

      {/* Contest content - only show for live or ended contests */}
      {(contest.status === 'live' || contest.status === 'ended') && contest.problems && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem List */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Problems</h2>
                <div className="space-y-2">
                  {contest.problems.map((problem, idx) => {
                    const problemSubmissions = submissions.filter(s => s.problemIndex === idx);
                    const isSolved = problemSubmissions.some(s => s.status === 'accepted');
                    const hasAttempted = problemSubmissions.length > 0;

                    return (
                      <button
                        key={idx}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedProblem === idx
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-300 hover:bg-base-100'
                        }`}
                        onClick={() => setSelectedProblem(idx)}
                      >
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <Check className="w-5 h-5 text-success" />
                          ) : hasAttempted ? (
                            <X className="w-5 h-5 text-error" />
                          ) : (
                            <Code className="w-5 h-5 opacity-50" />
                          )}
                          <span className="font-medium">{problem.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-sm ${
                            problem.difficulty === 'easy' ? 'badge-success' :
                            problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-sm opacity-70">{problem.points}pts</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Leaderboard link */}
                <div className="mt-4 pt-4 border-t border-base-300">
                  <Link
                    to={`/contest/${id}/leaderboard`}
                    className="btn btn-outline btn-sm w-full"
                  >
                    <Medal className="w-4 h-4" />
                    View Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Details & Code Editor */}
          <div className="lg:col-span-2 space-y-4">
            {currentProblem && (
              <>
                {/* Problem Description */}
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title">
                      {currentProblem.title}
                      <span className={`badge badge-sm ${
                        currentProblem.difficulty === 'easy' ? 'badge-success' :
                        currentProblem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {currentProblem.difficulty}
                      </span>
                    </h2>
                    <div className="prose prose-sm max-w-none">
                      <p>{currentProblem.description}</p>
                    </div>

                    {/* Sample Test Cases */}
                    {currentProblem.testCases && currentProblem.testCases.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Sample Test Cases:</h3>
                        {currentProblem.testCases.map((tc, idx) => (
                          <div key={idx} className="bg-base-300 rounded-lg p-3 mb-2 font-mono text-sm">
                            <div><span className="opacity-50">Input:</span> {tc.input}</div>
                            <div><span className="opacity-50">Output:</span> {tc.expectedOutput}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Editor */}
                {contest.status === 'live' && contest.isRegistered && (
                  <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Your Solution</h3>
                        <select
                          className="select select-bordered select-sm"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                      </div>

                      <textarea
                        className="textarea textarea-bordered font-mono text-sm h-64 w-full"
                        placeholder="Write your solution here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />

                      <button
                        className="btn btn-primary mt-4"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Solution
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submissions History */}
                {submissions.filter(s => s.problemIndex === selectedProblem).length > 0 && (
                  <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                      <h3 className="font-semibold mb-4">Your Submissions</h3>
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Language</th>
                              <th>Score</th>
                              <th>Tests</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submissions
                              .filter(s => s.problemIndex === selectedProblem)
                              .map((sub) => (
                                <tr key={sub.id}>
                                  <td>
                                    <span className={`badge badge-sm ${
                                      sub.status === 'accepted' ? 'badge-success' :
                                      sub.status === 'wrong_answer' ? 'badge-error' : 'badge-warning'
                                    }`}>
                                      {sub.status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td>{sub.language}</td>
                                  <td>{sub.score}</td>
                                  <td>{sub.passedTests}/{sub.totalTests}</td>
                                  <td className="text-xs opacity-70">
                                    {new Date(sub.submittedAt).toLocaleTimeString()}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestDetailPage;
