'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

interface ModuleRatingProps {
  moduleId: string;
  currentUserRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  currentUserId?: string;
}

export default function ModuleRating({ 
  moduleId, 
  currentUserRole, 
  currentUserId 
}: ModuleRatingProps) {
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingData();
  }, [moduleId, currentPage]);

  const loadRatingData = async () => {
    try {
      setLoading(true);
      
      // Load all data concurrently
      const promises = [
        fetchRatingStats(),
        fetchAllReviews(currentPage),
      ];
      
      if (currentUserRole === 'STUDENT' && currentUserId) {
        promises.push(fetchMyReview());
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading rating data:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const review = result.data;
        setMyReview(review);
        if (review) {
          setFormData({
            rating: review.rating || 0,
            comment: review.comment || ''
          });
        }
      } else if (response.status === 404) {
        // No review found, this is normal
        setMyReview(null);
      } else {
        console.error('Failed to fetch my review:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching my review:', error);
    }
  };

  const fetchAllReviews = async (page: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews?page=${page}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        setAllReviews(data?.reviews || []);
        setHasNextPage(data?.pagination?.hasNextPage || false);
      } else {
        console.error('Failed to fetch reviews:', response.status, response.statusText);
        setAllReviews([]);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setAllReviews([]);
      setHasNextPage(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const stats = result.data;
        setRatingStats({
          averageRating: stats?.averageRating || 0,
          totalReviews: stats?.totalReviews || 0,
          ratingDistribution: stats?.ratingDistribution || []
        });
      } else {
        console.error('Failed to fetch rating stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setMyReview(result?.data || null);
        toast.success(result?.message || 'Review submitted successfully!');
        setShowReviewForm(false);
        setIsEditing(false);
        
        // Reload data to get updated stats and reviews
        await loadRatingData();
      } else {
        let errorMessage = 'Failed to submit review';
        try {
          const errorResult = await response.json();
          errorMessage = errorResult?.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/my`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        }
      });

      if (response.ok) {
        setMyReview(null);
        setFormData({ rating: 0, comment: '' });
        setIsEditing(false);
        setShowReviewForm(false);
        toast.success('Review deleted successfully!');
        
        // Reload data
        await loadRatingData();
      } else {
        let errorMessage = 'Failed to delete review';
        try {
          const errorResult = await response.json();
          errorMessage = errorResult?.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={interactive ? () => setFormData({ ...formData, rating: star }) : undefined}
          />
        ))}
        {!interactive && rating > 0 && (
          <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Rating Overview */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Module Ratings & Reviews</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {(ratingStats?.averageRating || 0).toFixed(1)}
            </div>
            {renderStars(ratingStats?.averageRating || 0, false, 'w-6 h-6')}
            <p className="text-gray-600 mt-2">
              Based on {ratingStats?.totalReviews || 0} review{(ratingStats?.totalReviews || 0) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats?.ratingDistribution?.find(r => r.rating === rating)?.count || 0;
              const percentage = (ratingStats?.totalReviews || 0) > 0 ? (count / (ratingStats?.totalReviews || 1)) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-2">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Review Section */}
      {currentUserRole === 'STUDENT' && (
        <div className="border-t pt-6 mb-6">
          {!myReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          )}

          {myReview && !isEditing && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium">Your Review</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderStars(myReview.rating)}
              {myReview.comment && (
                <p className="text-gray-700 mt-2">{myReview.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Reviewed on {formatDate(myReview.createdAt)}
                {myReview.updatedAt !== myReview.createdAt && ' (edited)'}
              </p>
            </div>
          )}

          {(showReviewForm || isEditing) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-4">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  {renderStars(formData.rating, true)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share your thoughts about this module..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || formData.rating === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setIsEditing(false);
                      if (myReview) {
                        setFormData({
                          rating: myReview.rating,
                          comment: myReview.comment || ''
                        });
                      } else {
                        setFormData({ rating: 0, comment: '' });
                      }
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Reviews Section */}
      {allReviews.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Recent Reviews</h4>
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {review.student.profileImage ? (
                      <img
                        src={review.student.profileImage}
                        alt={review.student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {review.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{review.student.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  {renderStars(review.rating, false, 'w-4 h-4')}
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 text-sm ml-11">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center mt-4">
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      )}

      {(allReviews?.length === 0 && (ratingStats?.totalReviews || 0) === 0) && (
        <div className="border-t pt-6 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No reviews yet. Be the first to review this module!</p>
        </div>
      )}
    </div>
  );
}