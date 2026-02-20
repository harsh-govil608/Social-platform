import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';

const FeedPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Community Feed</h1>
      <CreatePost />
      <Feed />
    </div>
  );
};

export default FeedPage;
