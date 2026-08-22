
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Image, 
  Video, 
  Globe, 
  Users, 
  Lock, 
  X, 
  Smile,
  MapPin,
  Tag,
  Mic,
  Camera,
  FileText,
  Music,
  PlusCircle,
  Sparkles,
  Hash,
  Calendar,
  Gift,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
import { axiosInstance } from '../lib/axios';

// Emoji picker data
const emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲', '🙏', '✊', '👊'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏑', '🏒', '🥍'],
  nature: ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎋', '🍃', '🍂', '🍁', '🌺', '🌸'],
  food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍', '🥭', '🥝', '🍔', '🍕', '🍰']
};

const EnhancedCreatePost = () => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [mood, setMood] = useState('');
  const [location, setLocation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      resetForm();
      toast.success('Post created successfully! 🎉');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  const resetForm = () => {
    setContent('');
    setImages([]);
    setVideos([]);
    setPreviewImages([]);
    setPreviewVideos([]);
    setVisibility('public');
    setTags([]);
    setMood('');
    setLocation('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (images.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    // Validate file size (5MB per image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (videos.length + files.length > 2) {
      toast.error('You can only upload up to 2 videos');
      return;
    }

    // Validate file size (50MB per video)
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each video must be less than 50MB');
      return;
    }

    setVideos(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewVideos(prev => [...prev, { url, name: file.name }]);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    URL.revokeObjectURL(previewVideos[index].url);
    setVideos(prev => prev.filter((_, i) => i !== index));
    setPreviewVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = () => {
    if (currentTag.trim() && tags.length < 5) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (index) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      toast.error('Write something or add a photo/video first');
      return;
    }
    if (!content.trim() && (images.length > 0 || videos.length > 0)) {
      // allow media-only posts — add placeholder content
      // actually require at least a space
    }

    const formData = new FormData();
    formData.append('content', content.trim());
    formData.append('visibility', visibility);
    
    // Add images
    images.forEach(image => {
      formData.append('images', image);
    });
    
    // Add videos
    videos.forEach(video => {
      formData.append('videos', video);
    });

    // Add metadata
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
    if (mood) formData.append('mood', mood);
    if (location) formData.append('location', location);

    createPostMutation(formData);
  };

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public', description: 'Anyone can see this' },
    { value: 'friends', icon: Users, label: 'Friends', description: 'Only friends can see' },
    { value: 'private', icon: Lock, label: 'Only Me', description: 'Private post' },
  ];

  const moodOptions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '🎉', label: 'Celebrating' },
    { emoji: '😍', label: 'Loved' },
    { emoji: '🤗', label: 'Grateful' }
  ];

  const characterLimit = 1000;
  const remainingChars = characterLimit - content.length;

  return (
    <div className="card bg-base-100 shadow-xl mb-6 overflow-visible">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={authUser?.profilePic} alt={authUser?.fullName} />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{authUser?.fullName}</p>
            <div className="flex items-center gap-2 text-sm">
              <button 
                className="btn btn-xs btn-ghost gap-1"
                onClick={() => {
                  const next = visibilityOptions.findIndex(opt => opt.value === visibility);
                  setVisibility(visibilityOptions[(next + 1) % visibilityOptions.length].value);
                }}
              >
                {(() => {
                  const Icon = visibilityOptions.find(opt => opt.value === visibility).icon;
                  return <Icon className="w-3 h-3" />;
                })()}
                <span>{visibilityOptions.find(opt => opt.value === visibility)?.label}</span>
              </button>
              {mood && (
                <span className="badge badge-sm gap-1">
                  <span>{moodOptions.find(m => m.label === mood)?.emoji}</span>
                  <span>{mood}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="relative">
          <textarea
            className="textarea textarea-bordered w-full min-h-[120px] resize-none pr-12"
            placeholder="What's on your mind? Share your thoughts, ideas, or moments..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={characterLimit}
          />
          <button
            className="absolute bottom-2 right-2 btn btn-ghost btn-sm btn-circle"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full mt-2 right-0 bg-base-100 rounded-lg shadow-2xl p-4 z-50 border border-base-300">
              <div className="grid grid-cols-8 gap-2 max-w-xs">
                {Object.values(emojiCategories).flat().map((emoji, idx) => (
                  <button
                    key={idx}
                    className="text-2xl hover:scale-125 transition-transform"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Character Counter */}
        <div className="text-sm text-right mb-3">
          <span className={remainingChars < 100 ? 'text-warning' : 'opacity-60'}>
            {remainingChars} characters remaining
          </span>
        </div>

        {/* Media Preview */}
        {(previewImages.length > 0 || previewVideos.length > 0) && (
          <div className="mb-4">
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {previewImages.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Previews */}
            {previewVideos.length > 0 && (
              <div className="space-y-2">
                {previewVideos.map((video, index) => (
                  <div key={index} className="relative bg-base-200 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-primary" />
                        <span className="text-sm truncate max-w-xs">{video.name}</span>
                      </div>
                      <button
                        onClick={() => removeVideo(index)}
                        className="btn btn-circle btn-xs btn-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <video
                      src={video.url}
                      className="mt-2 rounded-lg w-full max-h-48"
                      controls
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <div key={index} className="badge badge-primary gap-1">
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
                <button onClick={() => removeTag(index)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Image Upload */}
            <button 
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => imageInputRef.current?.click()}
              disabled={images.length >= 5}
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
              {images.length > 0 && (
                <span className="badge badge-sm">{images.length}/5</span>
              )}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Video Upload */}
            <button 
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => videoInputRef.current?.click()}
              disabled={videos.length >= 2}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
              {videos.length > 0 && (
                <span className="badge badge-sm">{videos.length}/2</span>
              )}
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleVideoChange}
            />

            {/* Tags */}
            <div className="dropdown dropdown-top">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Tag</span>
              </label>
              <div tabIndex={0} className="dropdown-content menu p-4 shadow bg-base-100 rounded-box w-64 mb-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  className="input input-bordered input-sm w-full"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
                />
                <button 
                  className="btn btn-primary btn-sm mt-2"
                  onClick={handleTagAdd}
                  disabled={tags.length >= 5}
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Mood */}
            <div className="dropdown dropdown-top">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Mood</span>
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mb-2 max-h-64 overflow-y-auto">
                {moodOptions.map((option) => (
                  <li key={option.label}>
                    <button
                      onClick={() => setMood(option.label)}
                      className={mood === option.label ? 'active' : ''}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            <button className="btn btn-ghost btn-sm gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Location</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && images.length === 0 && videos.length === 0) || isPending}
            className="btn btn-primary"
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Posting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>

        {/* Quick Templates */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs opacity-60 mb-2">Quick Templates:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setContent("Just learned something new today! ")}
            >
              📚 Learning
            </button>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setContent("Feeling grateful for ")}
            >
              🙏 Gratitude
            </button>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setContent("Today's achievement: ")}
            >
              🏆 Achievement
            </button>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setContent("Random thought: ")}
            >
              💭 Thought
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCreatePost;