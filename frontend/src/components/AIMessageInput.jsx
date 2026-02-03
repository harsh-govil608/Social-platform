import { useState, useCallback, useRef } from "react";
import { useMessageInputContext } from "stream-chat-react";
import { Send, Sparkles, Check, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import debounce from "lodash/debounce";

const AIMessageInput = () => {
  const { text, handleChange, handleSubmit } = useMessageInputContext();
  const [suggestion, setSuggestion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef(null);

  // Debounced AI correction check
  const checkGrammar = useCallback(
    debounce(async (inputText) => {
      if (!inputText || inputText.length < 10) {
        setSuggestion(null);
        return;
      }

      setIsChecking(true);
      try {
        const res = await axiosInstance.post("/ai-tutor/quick-correct", {
          text: inputText,
        });

        if (res.data.hasSuggestion && res.data.corrected !== inputText) {
          setSuggestion({
            original: inputText,
            corrected: res.data.corrected,
            explanation: res.data.explanation,
          });
        } else {
          setSuggestion(null);
        }
      } catch (error) {
        // Silently fail - AI corrections are not critical
        console.log("AI correction unavailable");
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    handleChange(e);
    checkGrammar(e.target.value);
  };

  const applySuggestion = () => {
    if (suggestion) {
      // Create a synthetic event to update the input
      const syntheticEvent = {
        target: { value: suggestion.corrected },
      };
      handleChange(syntheticEvent);
      setSuggestion(null);
    }
  };

  const dismissSuggestion = () => {
    setSuggestion(null);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSuggestion(null);
    handleSubmit(e);
  };

  return (
    <div className="relative">
      {/* AI Suggestion Popup */}
      {suggestion && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <Sparkles className="size-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary font-medium mb-1">Suggested improvement</p>
                  <p className="text-sm">{suggestion.corrected}</p>
                  {suggestion.explanation && (
                    <p className="text-xs opacity-70 mt-1">{suggestion.explanation}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={applySuggestion}
                  className="btn btn-xs btn-primary btn-circle"
                  title="Apply suggestion"
                >
                  <Check className="size-3" />
                </button>
                <button
                  onClick={dismissSuggestion}
                  className="btn btn-xs btn-ghost btn-circle"
                  title="Dismiss"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 p-3 border-t border-base-300 bg-base-100">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="input input-bordered w-full pr-10"
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!text?.trim()}
          className="btn btn-primary btn-circle"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default AIMessageInput;
