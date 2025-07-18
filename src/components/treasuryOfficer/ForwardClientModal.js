import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ForwardClientModal = ({ clientId, onClose, onSubmit }) => {
  const [target, setTarget] = useState('BEAC');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(clientId, target, comment);
      toast.success('Client forwarded successfully');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to forward client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Forward Client</h3>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Target</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="form-control"
                required
              >
                <option value="BEAC">BEAC</option>
                <option value="Treasury OPS">Treasury OPS</option>
                <option value="Trade Desk">Trade Desk</option>
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-control"
                required
                minLength="10"
              ></textarea>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="forward-btn">
              {loading ? 'Forwarding...' : 'Forward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForwardClientModal;
