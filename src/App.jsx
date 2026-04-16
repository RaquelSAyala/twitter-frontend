import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout, 
    user, 
    getAccessTokenSilently,
    isLoading
  } = useAuth0();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const detectBackendRestart = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/instance`);
        const currentInstanceId = response?.data?.instanceId;
        if (!currentInstanceId) {
          return;
        }

        const storageKey = 'twitter_backend_instance_id';
        const previousInstanceId = sessionStorage.getItem(storageKey);
        sessionStorage.setItem(storageKey, currentInstanceId);

        if (previousInstanceId && previousInstanceId !== currentInstanceId && isAuthenticated) {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      } catch (error) {
        console.error('Error checking backend instance:', error);
      }
    };

    detectBackendRestart();
  }, [isAuthenticated, logout]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stream`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > 140) return;

    setIsPosting(true);
    try {
      const username = user?.email?.includes('@')
        ? user.email.split('@')[0]
        : (user?.nickname || user?.name || '');

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'write:posts',
        },
      });
      await axios.post(
        `${API_BASE_URL}/posts`,
        { content, username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to post. Check console for details.');
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: 'var(--primary)' }}>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="glass">
        <nav className="nav">
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            TwitterClone
          </div>
          <div>
            {!isAuthenticated ? (
              <button className="btn" onClick={() => loginWithRedirect()}>
                Log In
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={user.picture} alt={user.name} className="avatar" />
                <button className="btn btn-outline" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main style={{ padding: '16px' }}>
        {isAuthenticated && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <img src={user.picture} alt={user.name} className="avatar" />
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="3"
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px'
                  }}>
                    <span style={{ 
                      color: content.length > 140 ? '#f4212e' : 'var(--text-dim)',
                      fontSize: '14px'
                    }}>
                      {content.length}/140
                    </span>
                    <button 
                      type="submit" 
                      className="btn" 
                      disabled={!content.trim() || content.length > 140 || isPosting}
                    >
                      {isPosting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="feed">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div className="post-meta">
                <span className="post-author">{post.author || ''}</span>
                <span className="post-time">· {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="post-content">{post.content}</div>
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>
              No posts yet. Be the first to post!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
