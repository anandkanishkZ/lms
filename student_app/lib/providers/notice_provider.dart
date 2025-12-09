import 'package:flutter/material.dart';
import '../models/notice.dart';
import '../services/notice_service.dart';

class NoticeProvider with ChangeNotifier {
  final NoticeService _noticeService = NoticeService();
  
  List<Notice> _notices = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _error;

  List<Notice> get notices => _notices;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Notice> get pinnedNotices => _notices.where((n) => n.isPinned).toList();
  List<Notice> get unreadNotices => _notices.where((n) => n.isRead == false).toList();

  Future<void> loadNotices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _notices = await _noticeService.getAllNotices();
      await loadUnreadCount();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _notices = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadUnreadCount() async {
    try {
      _unreadCount = await _noticeService.getUnreadCount();
      notifyListeners();
    } catch (e) {
      // Silently fail for unread count
    }
  }

  Future<void> markAsRead(String noticeId) async {
    try {
      await _noticeService.markAsRead(noticeId);
      
      // Update local state
      final index = _notices.indexWhere((n) => n.id == noticeId);
      if (index != -1) {
        _notices[index] = Notice(
          id: _notices[index].id,
          title: _notices[index].title,
          content: _notices[index].content,
          category: _notices[index].category,
          priority: _notices[index].priority,
          attachmentUrl: _notices[index].attachmentUrl,
          isPinned: _notices[index].isPinned,
          isPublished: _notices[index].isPublished,
          isActive: _notices[index].isActive,
          publishedAt: _notices[index].publishedAt,
          expiresAt: _notices[index].expiresAt,
          actionUrl: _notices[index].actionUrl,
          viewCount: _notices[index].viewCount,
          publishedBy: _notices[index].publishedBy,
          createdAt: _notices[index].createdAt,
          updatedAt: _notices[index].updatedAt,
          isRead: true,
          publishedByUser: _notices[index].publishedByUser,
        );
      }
      
      await loadUnreadCount();
      notifyListeners();
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> refresh() async {
    await loadNotices();
  }
}
