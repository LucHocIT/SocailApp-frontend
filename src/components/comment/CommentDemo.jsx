import React from 'react';
import { CommentList, CommentForm } from '../components/comment';
import 'bootstrap/dist/css/bootstrap.min.css';

const CommentDemo = () => {
  const mockPostId = 'demo-post-1';
  
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>Comment System Demo</h2>
      <p>This demo showcases the modernized comment system with enhanced UI/UX.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Add a Comment</h3>
        <CommentForm
          postId={mockPostId}
          onCommentAdded={(comment) => {
            console.log('Comment added:', comment);
          }}
        />
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Comments</h3>
        <CommentList
          postId={mockPostId}
        />
      </div>
    </div>
  );
};

export default CommentDemo;
