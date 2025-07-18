import React from 'react';
import { useState, useEffect } from 'react';
import { getClient } from '../../api/client';

const ClientComments = ({ clientId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const client = await getClient(clientId);
                // Filter to show only Treasury OPS comments
                const treasuryComments = client.comments.filter(
                    comment => comment.createdBy.role === 'Treasury OPS'
                );
                setComments(treasuryComments);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchComments();
    }, [clientId]);

    if (loading) return <div className="loading-comments">Loading comments...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="comments-section">
            <h3>Comments from Treasury OPS</h3>
            {comments.length === 0 ? (
                <p className="no-comments">No comments from Treasury OPS yet.</p>
            ) : (
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">
                                    {comment.createdBy.name} ({comment.createdBy.email})
                                </span>
                                <span className="comment-date">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="comment-text">
                                {comment.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientComments;
