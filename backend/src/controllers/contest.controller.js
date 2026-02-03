import Contest from '../models/Contest.js';
import ContestSubmission from '../models/ContestSubmission.js';
import mongoose from 'mongoose';

/**
 * Get list of contests
 */
export async function getContests(req, res) {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;
        const userId = req.user?._id;

        // Update contest statuses first
        await Contest.updateContestStatuses();

        const query = { isPublic: true };
        if (status) query.status = status;
        if (type) query.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [contests, total] = await Promise.all([
            Contest.find(query)
                .select('-problems.solution -problems.testCases')
                .sort({ startTime: status === 'ended' ? -1 : 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'fullName profilePic'),
            Contest.countDocuments(query)
        ]);

        // Add registration status for authenticated users
        const contestsWithStatus = contests.map(contest => {
            const contestObj = contest.toObject();
            if (userId) {
                contestObj.isRegistered = contest.participants.some(
                    p => p.userId.toString() === userId.toString()
                );
            }
            contestObj.participantCount = contest.participants.length;
            delete contestObj.participants;
            return contestObj;
        });

        res.status(200).json({
            success: true,
            contests: contestsWithStatus,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error in getContests:', error);
        res.status(500).json({ message: 'Failed to get contests' });
    }
}

/**
 * Get single contest details
 */
export async function getContest(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const contest = await Contest.findById(id)
            .populate('createdBy', 'fullName profilePic');

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        const contestObj = contest.toObject();

        // Check if user is registered
        const participant = contest.participants.find(
            p => p.userId.toString() === userId?.toString()
        );

        contestObj.isRegistered = !!participant;
        contestObj.participantData = participant || null;
        contestObj.participantCount = contest.participants.length;

        // Hide solutions and full test cases
        if (contestObj.problems) {
            contestObj.problems = contestObj.problems.map(p => ({
                ...p,
                solution: undefined,
                testCases: p.testCases.filter(tc => !tc.isHidden)
            }));
        }

        // Remove other participants' data
        delete contestObj.participants;

        res.status(200).json({
            success: true,
            contest: contestObj
        });
    } catch (error) {
        console.error('Error in getContest:', error);
        res.status(500).json({ message: 'Failed to get contest' });
    }
}

/**
 * Register for a contest
 */
export async function registerForContest(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const contest = await Contest.findById(id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.status === 'ended') {
            return res.status(400).json({ message: 'Contest has already ended' });
        }

        if (contest.status === 'live' && !contest.settings.allowLateJoin) {
            return res.status(400).json({ message: 'Late registration is not allowed' });
        }

        try {
            await contest.registerUser(userId);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully registered for the contest'
        });
    } catch (error) {
        console.error('Error in registerForContest:', error);
        res.status(500).json({ message: 'Failed to register for contest' });
    }
}

/**
 * Submit solution for a contest problem
 */
export async function submitSolution(req, res) {
    try {
        const { id, problemId } = req.params;
        const { code, language } = req.body;
        const userId = req.user._id;

        if (!code || !language) {
            return res.status(400).json({ message: 'Code and language are required' });
        }

        const contest = await Contest.findById(id);

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        if (contest.status !== 'live') {
            return res.status(400).json({
                message: contest.status === 'upcoming'
                    ? 'Contest has not started yet'
                    : 'Contest has ended'
            });
        }

        // Check if user is registered
        const participant = contest.participants.find(
            p => p.userId.toString() === userId.toString()
        );

        if (!participant) {
            return res.status(403).json({ message: 'You are not registered for this contest' });
        }

        const problemIndex = parseInt(problemId);
        const problem = contest.problems[problemIndex];

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Mark participant as started if not already
        if (!participant.startedAt) {
            participant.startedAt = new Date();
            await contest.save();
        }

        // Calculate time taken from contest start
        const timeTaken = Math.floor((Date.now() - contest.startTime.getTime()) / 1000);

        // Create submission record
        const submission = await ContestSubmission.create({
            contestId: contest._id,
            userId,
            problemIndex,
            code,
            language,
            status: 'pending',
            totalTests: problem.testCases.length,
            timeTaken
        });

        // Simulate code execution (in production, use a proper code execution service)
        // This is a simplified version for demonstration
        const results = await simulateCodeExecution(code, language, problem.testCases);

        // Update submission with results
        submission.testResults = results.testResults;
        submission.passedTests = results.passedTests;
        submission.status = results.status;
        submission.executionTime = results.executionTime;
        submission.errorMessage = results.errorMessage || '';
        submission.judgedAt = new Date();

        // Calculate score based on passed tests
        if (results.status === 'accepted') {
            submission.score = problem.points;
        } else if (results.passedTests > 0) {
            // Partial score for partial solutions
            submission.score = Math.floor(
                (results.passedTests / problem.testCases.length) * problem.points * 0.5
            );
        }

        await submission.save();

        // Update participant's score if this is their best submission
        const existingProblemScore = participant.problemScores.find(
            ps => ps.problemIndex === problemIndex
        );

        if (!existingProblemScore || existingProblemScore.score < submission.score) {
            if (existingProblemScore) {
                existingProblemScore.score = submission.score;
                existingProblemScore.attempts = (existingProblemScore.attempts || 0) + 1;
                if (results.status === 'accepted') {
                    existingProblemScore.solvedAt = new Date();
                    existingProblemScore.timeTaken = timeTaken;
                }
            } else {
                participant.problemScores.push({
                    problemIndex,
                    score: submission.score,
                    attempts: 1,
                    solvedAt: results.status === 'accepted' ? new Date() : null,
                    timeTaken
                });
            }

            // Recalculate total score
            participant.totalScore = participant.problemScores.reduce(
                (sum, ps) => sum + ps.score, 0
            );

            await contest.save();
        }

        // Update rankings
        await contest.updateRankings();

        res.status(200).json({
            success: true,
            submission: {
                id: submission._id,
                status: submission.status,
                score: submission.score,
                passedTests: submission.passedTests,
                totalTests: submission.totalTests,
                executionTime: submission.executionTime,
                errorMessage: submission.errorMessage,
                testResults: submission.testResults.map(tr => ({
                    passed: tr.passed,
                    executionTime: tr.executionTime,
                    error: tr.error
                }))
            }
        });
    } catch (error) {
        console.error('Error in submitSolution:', error);
        res.status(500).json({ message: 'Failed to submit solution' });
    }
}

/**
 * Get contest leaderboard
 */
export async function getLeaderboard(req, res) {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const contest = await Contest.findById(id)
            .select('title status settings.showLeaderboardDuring participants problems')
            .populate('participants.userId', 'fullName profilePic');

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Check if leaderboard should be shown during contest
        if (contest.status === 'live' && !contest.settings.showLeaderboardDuring) {
            return res.status(403).json({
                message: 'Leaderboard is hidden during the contest'
            });
        }

        // Sort participants by rank
        const rankedParticipants = contest.participants
            .filter(p => p.totalScore > 0 || p.startedAt)
            .sort((a, b) => {
                if (!a.rank && !b.rank) return 0;
                if (!a.rank) return 1;
                if (!b.rank) return -1;
                return a.rank - b.rank;
            });

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedParticipants = rankedParticipants.slice(skip, skip + parseInt(limit));

        const leaderboard = paginatedParticipants.map(p => ({
            rank: p.rank || '-',
            user: {
                _id: p.userId._id,
                fullName: p.userId.fullName,
                profilePic: p.userId.profilePic
            },
            totalScore: p.totalScore,
            problemScores: p.problemScores.map(ps => ({
                problemIndex: ps.problemIndex,
                score: ps.score,
                attempts: ps.attempts,
                solved: !!ps.solvedAt
            })),
            solvedCount: p.problemScores.filter(ps => ps.solvedAt).length
        }));

        res.status(200).json({
            success: true,
            contestTitle: contest.title,
            problemCount: contest.problems.length,
            leaderboard,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: rankedParticipants.length,
                pages: Math.ceil(rankedParticipants.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error in getLeaderboard:', error);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
}

/**
 * Get user's submissions for a contest
 */
export async function getUserSubmissions(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const submissions = await ContestSubmission.getUserContestSubmissions(id, userId);

        res.status(200).json({
            success: true,
            submissions: submissions.map(s => ({
                id: s._id,
                problemIndex: s.problemIndex,
                language: s.language,
                status: s.status,
                score: s.score,
                passedTests: s.passedTests,
                totalTests: s.totalTests,
                submittedAt: s.submittedAt
            }))
        });
    } catch (error) {
        console.error('Error in getUserSubmissions:', error);
        res.status(500).json({ message: 'Failed to get submissions' });
    }
}

/**
 * Create a new contest (admin only)
 */
export async function createContest(req, res) {
    try {
        const userId = req.user._id;
        const {
            title,
            description,
            type,
            startTime,
            duration,
            problems,
            prizes,
            settings
        } = req.body;

        if (!title || !description || !startTime || !duration || !problems) {
            return res.status(400).json({
                message: 'Title, description, startTime, duration, and problems are required'
            });
        }

        const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000);

        const contest = await Contest.create({
            title,
            description,
            type: type || 'weekly',
            startTime: new Date(startTime),
            endTime,
            duration,
            problems,
            prizes: prizes || [],
            settings: settings || {},
            createdBy: userId
        });

        res.status(201).json({
            success: true,
            message: 'Contest created successfully',
            contest: {
                id: contest._id,
                title: contest.title,
                startTime: contest.startTime,
                endTime: contest.endTime
            }
        });
    } catch (error) {
        console.error('Error in createContest:', error);
        res.status(500).json({ message: 'Failed to create contest' });
    }
}

// Helper function to simulate code execution
// In production, replace this with a proper sandboxed code execution service
async function simulateCodeExecution(code, language, testCases) {
    const results = {
        testResults: [],
        passedTests: 0,
        status: 'accepted',
        executionTime: 0,
        errorMessage: null
    };

    // Simulate execution for each test case
    for (let i = 0; i < testCases.length; i++) {
        const startTime = Date.now();

        // Simulate random execution time (50-200ms)
        const execTime = Math.floor(Math.random() * 150) + 50;
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

        // For demonstration, randomly determine if test passes
        // In production, actually execute the code
        const passed = Math.random() > 0.3;

        results.testResults.push({
            testCaseIndex: i,
            passed,
            executionTime: execTime,
            memoryUsed: Math.floor(Math.random() * 50) + 10,
            error: passed ? null : 'Output mismatch'
        });

        if (passed) {
            results.passedTests++;
        }

        results.executionTime += execTime;
    }

    // Determine overall status
    if (results.passedTests === testCases.length) {
        results.status = 'accepted';
    } else if (results.passedTests > 0) {
        results.status = 'wrong_answer';
    } else {
        results.status = 'wrong_answer';
    }

    return results;
}
