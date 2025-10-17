import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  User, 
  Mail, 
  Phone, 
  Key, 
  Download,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserCredentials {
  id: string;
  name: string;
  symbolNo: string;
  email?: string;
  phone?: string;
  tempPassword: string;
  role: 'STUDENT' | 'TEACHER';
  school?: string;
  department?: string;
}

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: UserCredentials | null;
}

export default function CredentialsModal({ isOpen, onClose, credentials }: CredentialsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);

  if (!credentials) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadCredentials = () => {
    const text = `
${credentials.role === 'STUDENT' ? 'Student' : 'Teacher'} Login Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${credentials.name}
Symbol Number: ${credentials.symbolNo}
${credentials.email ? `Email: ${credentials.email}` : ''}
${credentials.phone ? `Phone: ${credentials.phone}` : ''}
${credentials.school ? `School: ${credentials.school}` : ''}
${credentials.department ? `Department: ${credentials.department}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPORARY PASSWORD: ${credentials.tempPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT INSTRUCTIONS:
1. Use your Symbol Number or Email to login
2. Use the temporary password provided above
3. Change your password immediately after first login
4. Keep your credentials secure and confidential

Login URL: ${window.location.origin}/login

This password will not be shown again. Please save it securely.
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credentials-${credentials.symbolNo}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyAllCredentials = () => {
    const text = `Symbol Number: ${credentials.symbolNo}
${credentials.email ? `Email: ${credentials.email}\n` : ''}Password: ${credentials.tempPassword}`;
    copyToClipboard(text, 'all');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {credentials.role === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Teacher'} Created Successfully!
                      </h2>
                      <p className="text-blue-100 text-sm mt-0.5">
                        Save these credentials securely
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="mx-6 mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900">Important Notice</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      This password will <strong>NOT be shown again</strong>. Please copy or download it now.
                      The user should change this password after first login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    User Information
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <span className="font-medium text-gray-900">{credentials.name}</span>
                    </div>
                    
                    {credentials.school && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">School:</span>
                        <span className="font-medium text-gray-900">{credentials.school}</span>
                      </div>
                    )}
                    
                    {credentials.department && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="font-medium text-gray-900">{credentials.department}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Login Credentials */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Login Credentials
                  </h3>

                  {/* Symbol Number */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Symbol Number (User ID)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={credentials.symbolNo}
                        readOnly
                        className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg font-mono text-lg font-semibold text-blue-900 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() => copyToClipboard(credentials.symbolNo, 'symbolNo')}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        {copiedField === 'symbolNo' ? (
                          <><Check className="w-4 h-4" /> <span>Copied!</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /> <span>Copy</span></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  {credentials.email && (
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={credentials.email}
                          readOnly
                          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg font-medium text-gray-900 focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(credentials.email!, 'email')}
                          className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                          {copiedField === 'email' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Temporary Password - HIGHLIGHTED */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-red-600 mb-1.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Temporary Password (Required for Login)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={credentials.tempPassword}
                          readOnly
                          className="w-full px-4 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg font-mono text-2xl font-bold text-red-900 focus:outline-none focus:border-red-400 tracking-wider pr-12"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.tempPassword, 'password')}
                        className="px-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
                      >
                        {copiedField === 'password' ? (
                          <><Check className="w-5 h-5" /> <span>Copied!</span></>
                        ) : (
                          <><Copy className="w-5 h-5" /> <span>Copy</span></>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mt-1.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      User must change this password after first login
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Instructions for User:</h4>
                  <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                    <li>Go to: <code className="bg-white px-2 py-0.5 rounded text-blue-900 font-mono">{window.location.origin}/login</code></li>
                    <li>Use <strong>Symbol Number</strong> {credentials.email && 'or Email'} as username</li>
                    <li>Enter the <strong>temporary password</strong> shown above</li>
                    <li>Change password immediately after login for security</li>
                  </ol>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={copyAllCredentials}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {copiedField === 'all' ? (
                      <><Check className="w-5 h-5" /> <span>Copied All!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /> <span>Copy All Credentials</span></>
                    )}
                  </button>
                  
                  <button
                    onClick={downloadCredentials}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download as Text File</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Done - I've Saved the Credentials
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
