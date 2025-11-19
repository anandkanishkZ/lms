'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Users, TrendingUp, Eye, EyeOff, Flag, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
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

interface TeacherModuleReviewsProps {
  moduleId: string;
}

export default function TeacherModuleReviews({ moduleId }: TeacherModuleReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showOnlyPublished, setShowOnlyPublished] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
    loadRatingStats();
  }, [moduleId, currentPage, filterRating, showOnlyPublished]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterRating !== 'all' && { rating: filterRating.toString() }),
        ...(showOnlyPublished && { published: 'true' })
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        
        setReviews(data.reviews || []);
        setHasNextPage(data.pagination?.hasNextPage || false);
        setTotalPages(data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setRatingStats(data);
      }
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  const toggleReviewVisibility = async (reviewId: string, currentStatus: boolean) => {
    try {
      setUpdating(reviewId);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/${reviewId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isPublished: !currentStatus })
        }
      );

      if (response.ok) {
        // Reload reviews to reflect changes
        await loadReviews();
        await loadRatingStats();
      }
    } catch (error) {
      console.error('Error toggling review visibility:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
              <p className="text-sm text-gray-600">Overall student satisfaction</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-900">
              {ratingStats.averageRating.toFixed(1)}
            </div>
            {renderStars(ratingStats.averageRating, 'w-5 h-5')}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Total Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Reviews</h3>
              <p className="text-sm text-gray-600">Student feedback count</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {ratingStats.totalReviews}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Active feedback</span>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
              <p className="text-sm text-gray-600">Rating breakdown</p>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.ratingDistribution.find(r => r.rating === rating)?.count || 0;
              const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-4">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by rating:</label>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnlyPublished"
              checked={showOnlyPublished}
              onChange={(e) => {
                setShowOnlyPublished(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="showOnlyPublished" className="text-sm font-medium text-gray-700">
              Show only published reviews
            </label>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              {filterRating !== 'all' 
                ? `No reviews found for ${filterRating} star${filterRating !== 1 ? 's' : ''}`
                : 'Students haven\'t left any reviews for this module yet.'
              }
            </p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {review.student.profileImage ? (
                    <img
                      src={review.student.profileImage}
                      alt={review.student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {review.student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.student.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
                      {!review.isPublished && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReviewVisibility(review.id, review.isPublished)}
                    disabled={updating === review.id}
                    className={`p-2 rounded-lg transition-colors ${
                      review.isPublished
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={review.isPublished ? 'Hide review' : 'Show review'}
                  >
                    {updating === review.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : review.isPublished ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {review.comment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              )}

              {review.updatedAt !== review.createdAt && (
                <p className="text-xs text-gray-500 mt-3">
                  Last updated: {formatDate(review.updatedAt)}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNextPage}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}