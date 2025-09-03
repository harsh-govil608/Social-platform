import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-4xl shadow-2xl border border-base-300">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ShipWheelIcon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to <span className="text-primary">Streamify</span>
            </h1>
            <p className="text-lg text-base-content/70">
              Let's set up your profile to connect with language learners worldwide
            </p>
            <div className="flex justify-center mt-4">
              <div className="steps">
                <div className="step step-primary">Account</div>
                <div className="step step-primary">Profile</div>
                <div className="step">Connect</div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <ShipWheelIcon className="w-4 h-4" />
                      Profile Picture
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-2">
                        <img
                          src={formState.profilePic || "/vite.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="url"
                        placeholder="Profile picture URL"
                        className="input input-bordered input-sm w-full"
                        value={formState.profilePic}
                        onChange={(e) =>
                          setFormState({ ...formState, profilePic: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={handleRandomAvatar}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        <ShuffleIcon className="w-4 h-4" />
                        Random
                      </button>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Full Name</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="input input-bordered focus:input-primary"
                    value={formState.fullName}
                    onChange={(e) =>
                      setFormState({ ...formState, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Bio</span>
                  </label>
                  <textarea
                    placeholder="Tell us about yourself and your language learning goals..."
                    className="textarea textarea-bordered focus:textarea-primary h-24"
                    value={formState.bio}
                    onChange={(e) =>
                      setFormState({ ...formState, bio: e.target.value })
                    }
                  />
                </div>

                {/* Location */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      Location
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="input input-bordered focus:input-primary"
                    value={formState.location}
                    onChange={(e) =>
                      setFormState({ ...formState, location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Native Language */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Native Language</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <select
                    className="select select-bordered focus:select-primary"
                    value={formState.nativeLanguage}
                    onChange={(e) =>
                      setFormState({ ...formState, nativeLanguage: e.target.value })
                    }
                    required
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Learning Language */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Learning Language</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <select
                    className="select select-bordered focus:select-primary"
                    value={formState.learningLanguage}
                    onChange={(e) =>
                      setFormState({ ...formState, learningLanguage: e.target.value })
                    }
                    required
                  >
                    <option value="">Select language you're learning</option>
                    {LANGUAGES.map((lang) => (
                      <option 
                        key={lang.value} 
                        value={lang.value}
                        disabled={lang.value === formState.nativeLanguage}
                      >
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tips Card */}
                <div className="card bg-primary/10 border border-primary/20">
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm">💡 Quick Tips</h3>
                    <ul className="text-sm space-y-1 text-base-content/70">
                      <li>• Use a clear profile picture</li>
                      <li>• Write an engaging bio</li>
                      <li>• Share your learning goals</li>
                      <li>• Be authentic and friendly</li>
                    </ul>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm mb-3">👀 Profile Preview</h3>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          <img
                            src={formState.profilePic || "/vite.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {formState.fullName || "Your Name"}
                        </p>
                        <p className="text-sm text-base-content/70 truncate">
                          {formState.location || "Your Location"}
                        </p>
                        {formState.nativeLanguage && formState.learningLanguage && (
                          <p className="text-xs text-primary">
                            {LANGUAGES.find(l => l.value === formState.nativeLanguage)?.flag} → {LANGUAGES.find(l => l.value === formState.learningLanguage)?.flag}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isPending || !formState.fullName || !formState.nativeLanguage || !formState.learningLanguage}
                className="btn btn-primary btn-lg px-12 shadow-lg"
              >
                {isPending ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <ShipWheelIcon className="w-5 h-5" />
                    Complete Setup
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