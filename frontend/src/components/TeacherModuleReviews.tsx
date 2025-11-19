'use client';

import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, MessageSquare, TrendingUp, Users, Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    loadReviews();
  }, [moduleId, currentPage, filterStatus, sortBy]);

  useEffect(() => {
    loadRatingStats();
  }, [moduleId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
        sortBy
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/teacher?${queryParams}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setReviews(result.data.reviews || []);
          setHasNextPage(result.data.pagination?.hasNextPage || false);
        }
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
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
        if (result.success && result.data) {
          setRatingStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentlyVisible: boolean) => {
    try {
      const action = currentlyVisible ? 'hide' : 'show';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/reviews/${reviewId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the review in state
          setReviews(reviews.map(review => 
            review.id === reviewId 
              ? { ...review, isPublished: !currentlyVisible }
              : review
          ));
          
          toast.success(`Review ${action === 'hide' ? 'hidden' : 'made visible'} successfully`);
          
          // Reload stats to reflect changes
          await loadRatingStats();
        }
      } else {
        throw new Error('Failed to toggle review visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update review visibility');
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
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
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
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

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchTerm || 
      review.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'visible' && review.isPublished) ||
      (filterStatus === 'hidden' && !review.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  const visibleCount = reviews.filter(r => r.isPublished).length;
  const hiddenCount = reviews.filter(r => !r.isPublished).length;

  if (loading && currentPage === 1) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-6">Student Reviews Overview</h3>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {ratingStats.averageRating?.toFixed(1) || '0.0'}
            </div>
            {renderStars(ratingStats.averageRating || 0, false, 'w-6 h-6')}
            <p className="text-gray-600 mt-2">
              Average Rating from {ratingStats.totalReviews || 0} reviews
            </p>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visible Reviews:</span>
              <span className="font-medium text-green-600">{visibleCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hidden Reviews:</span>
              <span className="font-medium text-orange-600">{hiddenCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Reviews:</span>
              <span className="font-medium text-gray-900">{reviews.length}</span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.ratingDistribution?.find(r => r.rating === rating)?.count || 0;
              const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-2">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Reviews ({reviews.length})</option>
                <option value="visible">Visible Only ({visibleCount})</option>
                <option value="hidden">Hidden Only ({hiddenCount})</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Status Message */}
      {filterStatus === 'hidden' && filteredReviews.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-800">Viewing Hidden Reviews</h4>
              <p className="text-sm text-orange-700">
                These reviews are hidden from students. Click "Show Review" to make them visible again.
              </p>
            </div>
          </div>
        </div>
      )}

      {filterStatus === 'visible' && filteredReviews.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Viewing Visible Reviews</h4>
              <p className="text-sm text-green-700">
                These reviews are currently visible to students. Click "Hide Review" to hide them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.student.profileImage ? (
                    <img
                      src={review.student.profileImage}
                      alt={review.student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{review.student.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Visibility Status Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {review.isPublished ? 'Visible' : 'Hidden'}
                  </span>
                  
                  {/* Toggle Action Button */}
                  <button
                    onClick={() => handleToggleVisibility(review.id, review.isPublished)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                      review.isPublished 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                    title={review.isPublished ? 'Hide this review from students' : 'Make this review visible to students'}
                  >
                    {review.isPublished ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide Review
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Show Review
                      </>
                    )}
                  </button>
                  
                  {renderStars(review.rating, false, 'w-4 h-4')}
                </div>
              </div>
              
              {review.comment && (
                <div className="ml-13">
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              )}

              {review.updatedAt !== review.createdAt && (
                <p className="text-xs text-gray-400 mt-2 ml-13">
                  Last edited: {formatDate(review.updatedAt)}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {reviews.length === 0 ? (
              <>
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reviews yet for this module.</p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reviews match your current filters.</p>
              </>
            )}
          </div>
        )}

        {hasNextPage && (
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}