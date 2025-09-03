import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { 
  UserIcon, 
  MapPinIcon, 
  GlobeIcon, 
  BookOpenIcon, 
  CameraIcon,
  SaveIcon,
  ArrowLeftIcon
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { completeOnboarding } from "../lib/api";
import { getLanguageFlag } from "../components/FriendCard";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    updateProfile(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-base-content/70">Manage your account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar relative">
                  <div className="w-32 rounded-full">
                    <img src={authUser?.profilePic} alt={authUser?.fullName} />
                  </div>
                  <button className="btn btn-circle btn-sm absolute bottom-0 right-0">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="card-title text-xl">{authUser?.fullName}</h2>
                <p className="text-base-content/70">{authUser?.email}</p>
                
                {/* Language badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {authUser?.nativeLanguage && (
                    <div className="badge badge-secondary gap-1">
                      {getLanguageFlag(authUser.nativeLanguage)}
                      Native: {authUser.nativeLanguage}
                    </div>
                  )}
                  {authUser?.learningLanguage && (
                    <div className="badge badge-outline gap-1">
                      {getLanguageFlag(authUser.learningLanguage)}
                      Learning: {authUser.learningLanguage}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="stats stats-vertical shadow mt-4">
                  <div className="stat">
                    <div className="stat-title">Member Since</div>
                    <div className="stat-value text-sm">
                      {new Date(authUser?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Status</div>
                    <div className="stat-value text-sm text-success">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Personal Information</h3>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            fullName: authUser?.fullName || "",
                            bio: authUser?.bio || "",
                            nativeLanguage: authUser?.nativeLanguage || "",
                            learningLanguage: authUser?.learningLanguage || "",
                            location: authUser?.location || "",
                          });
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="btn btn-primary btn-sm"
                      >
                        {isPending ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <>
                            <SaveIcon className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`input input-bordered w-full ${!isEditing ? 'input-disabled' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Bio */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        Bio
                      </span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`textarea textarea-bordered h-24 ${!isEditing ? 'textarea-disabled' : ''}`}
                      placeholder="Tell others about yourself and your language learning goals..."
                    />
                  </div>

                  {/* Location */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Location
                      </span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`input input-bordered w-full ${!isEditing ? 'input-disabled' : ''}`}
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Languages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <GlobeIcon className="w-4 h-4" />
                          Native Language
                        </span>
                      </label>
                      <select
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`select select-bordered w-full ${!isEditing ? 'select-disabled' : ''}`}
                      >
                        <option value="">Select your native language</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Russian">Russian</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <BookOpenIcon className="w-4 h-4" />
                          Learning Language
                        </span>
                      </label>
                      <select
                        name="learningLanguage"
                        value={formData.learningLanguage}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`select select-bordered w-full ${!isEditing ? 'select-disabled' : ''}`}
                      >
                        <option value="">Select language you're learning</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Russian">Russian</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
