
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Globe, Users, Lock } from 'lucide-react';
import { createPost } from '../lib/api';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [images, setImages] = useState([]);
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      setContent('');
      setImages([]);
      setVisibility('public');
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    createPostMutation({
      content: content.trim(),
      images,
      visibility,
    });
  };

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public' },
    { value: 'friends', icon: Users, label: 'Friends' },
    { value: 'private', icon: Lock, label: 'Only Me' },
  ];

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <div className="flex gap-3">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={authUser?.profilePic} alt={authUser?.fullName} />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              className="textarea textarea-bordered w-full min-h-[100px] resize-none"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />
            <div className="text-sm text-right opacity-60 mt-1">
              {content.length}/500
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm gap-2">
              <Image className="w-4 h-4" />
              Photo
            </button>

            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                {visibilityOptions.find(opt => opt.value === visibility)?.icon && (
                  <span className="w-4 h-4">
                    {(() => {
                      const Icon = visibilityOptions.find(opt => opt.value === visibility).icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                  </span>
                )}
                {visibilityOptions.find(opt => opt.value === visibility)?.label}
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                {visibilityOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      onClick={() => setVisibility(option.value)}
                      className={visibility === option.value ? 'active' : ''}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isPending}
            className="btn btn-primary btn-sm"
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;