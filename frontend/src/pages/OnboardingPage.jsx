import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, Target } from "lucide-react";
import { LANGUAGES } from "../constants";

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Just starting out" },
  { value: "elementary", label: "Elementary", description: "Basic understanding" },
  { value: "intermediate", label: "Intermediate", description: "Comfortable with basics" },
  { value: "advanced", label: "Advanced", description: "Fluent in most situations" },
];

const DAILY_AVAILABILITY = [
  { value: "5-10", label: "5-10 minutes", description: "Quick daily practice" },
  { value: "10-20", label: "10-20 minutes", description: "Recommended" },
  { value: "20-30", label: "20-30 minutes", description: "Extended practice" },
  { value: "30+", label: "30+ minutes", description: "Intensive learning" },
];

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    learningLanguage: authUser?.learningLanguage || "",
    proficiencyLevel: "",
    dailyAvailability: "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Welcome! Let's build your learning streak!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to complete onboarding");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formState.learningLanguage || !formState.proficiencyLevel || !formState.dailyAvailability) {
      toast.error("Please complete all fields");
      return;
    }

    onboardingMutation(formState);
  };

  const isComplete = formState.learningLanguage && formState.proficiencyLevel && formState.dailyAvailability;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-2xl shadow-2xl border border-base-300">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Target className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Welcome to <span className="text-primary">LangPal</span>
            </h1>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <p className="text-lg font-medium">
                This platform helps you stay consistent.
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                Just 10 minutes a day.
              </p>
            </div>
            <p className="text-base-content/70">
              Let's personalize your learning journey
            </p>
          </div>

          {/* Onboarding Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Language Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  What language are you learning?
                </span>
                <span className="label-text-alt text-error">*</span>
              </label>
              <select
                className="select select-bordered select-lg focus:select-primary"
                value={formState.learningLanguage}
                onChange={(e) =>
                  setFormState({ ...formState, learningLanguage: e.target.value })
                }
                required
              >
                <option value="">Choose a language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Level */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  What's your current level?
                </span>
                <span className="label-text-alt text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROFICIENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 ${
                      formState.proficiencyLevel === level.value
                        ? "border-primary bg-primary/10"
                        : "border-base-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="proficiencyLevel"
                      value={level.value}
                      checked={formState.proficiencyLevel === level.value}
                      onChange={(e) =>
                        setFormState({ ...formState, proficiencyLevel: e.target.value })
                      }
                      className="radio radio-primary radio-sm float-right"
                    />
                    <div>
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-base-content/70">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Daily Availability */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  How much time can you commit daily?
                </span>
                <span className="label-text-alt text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DAILY_AVAILABILITY.map((availability) => (
                  <label
                    key={availability.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 ${
                      formState.dailyAvailability === availability.value
                        ? "border-primary bg-primary/10"
                        : "border-base-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dailyAvailability"
                      value={availability.value}
                      checked={formState.dailyAvailability === availability.value}
                      onChange={(e) =>
                        setFormState({ ...formState, dailyAvailability: e.target.value })
                      }
                      className="radio radio-primary radio-sm float-right"
                    />
                    <div>
                      <div className="font-semibold">{availability.label}</div>
                      <div className="text-sm text-base-content/70">
                        {availability.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending || !isComplete}
                className="btn btn-primary btn-lg px-16 shadow-lg"
              >
                {isPending ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start Learning
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
