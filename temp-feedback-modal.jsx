  // Show feedback modal
  if (showFeedback && currentScenario) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-2xl mb-6 text-center">
            Conversation Complete! 🎉
          </h3>

          {/* Score Summary */}
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
            <div className="stat">
              <div className="stat-figure text-primary">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Score</div>
              <div className="stat-value text-primary">{score}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <StarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">XP Earned</div>
              <div className="stat-value text-secondary">+{Math.floor((score / 300) * currentScenario.xpReward)}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-accent">
                <div className="w-8 h-8 bg-yellow-500 rounded-full" />
              </div>
              <div className="stat-title">Coins</div>
              <div className="stat-value text-accent">+{Math.floor((score / 300) * currentScenario.coinsReward)}</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Grammar</span>
                <span className="text-sm">{conversationStats.grammarScore}%</span>
              </div>
              <progress className="progress progress-primary" value={conversationStats.grammarScore} max="100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Fluency</span>
                <span className="text-sm">{conversationStats.fluencyScore}%</span>
              </div>
              <progress className="progress progress-secondary" value={conversationStats.fluencyScore} max="100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Vocabulary</span>
                <span className="text-sm">{conversationStats.vocabularyScore}%</span>
              </div>
              <progress className="progress progress-accent" value={conversationStats.vocabularyScore} max="100" />
            </div>
          </div>

          {/* Bonus Objectives */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body">
              <h4 className="font-bold mb-2">Bonus Objectives</h4>
              <div className="space-y-2">
                {currentScenario.bonusObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {Math.random() > 0.5 ? (
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-base-300 rounded-full" />
                    )}
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button className="btn btn-primary" onClick={resetConversation}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Try Another
            </button>
            <button className="btn" onClick={() => setShowFeedback(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }