import React, { useState } from 'react';

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Write a Review for {booking.package_title}</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Rating</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full border rounded px-2 py-1">
              {[5,4,3,2,1].map(num => (
                <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border rounded px-2 py-1" rows={4} required />
          </div>
          <div className="flex space-x-2 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
