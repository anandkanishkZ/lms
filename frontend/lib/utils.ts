import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateRandomPassword(length: number = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function formatGrade(grade: string) {
  switch (grade) {
    case 'A_PLUS':
      return 'A+'
    case 'B_PLUS':
      return 'B+'
    case 'C_PLUS':
      return 'C+'
    default:
      return grade
  }
}

export function getGradeColor(grade: string) {
  switch (grade) {
    case 'A_PLUS':
    case 'A':
      return 'text-green-600 bg-green-100'
    case 'B_PLUS':
    case 'B':
      return 'text-blue-600 bg-blue-100'
    case 'C_PLUS':
    case 'C':
      return 'text-yellow-600 bg-yellow-100'
    case 'D':
      return 'text-orange-600 bg-orange-100'
    case 'F':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'URGENT':
      return 'text-red-600 bg-red-100'
    case 'HIGH':
      return 'text-orange-600 bg-orange-100'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100'
    case 'LOW':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'LIVE':
    case 'COMPLETED':
      return 'text-green-600 bg-green-100'
    case 'SCHEDULED':
    case 'UPCOMING':
      return 'text-blue-600 bg-blue-100'
    case 'CANCELLED':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function calculatePercentage(obtained: number, total: number) {
  if (total === 0) return 0
  return Math.round((obtained / total) * 100)
}

export function isTimeInRange(startTime: string, endTime: string, currentTime?: Date) {
  const now = currentTime || new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return now >= start && now <= end
}

export function getTimeUntil(targetTime: string) {
  const now = new Date()
  const target = new Date(targetTime)
  const diffMs = target.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Time has passed'
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h ${diffMinutes}m`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  } else {
    return `${diffMinutes}m`
  }
}