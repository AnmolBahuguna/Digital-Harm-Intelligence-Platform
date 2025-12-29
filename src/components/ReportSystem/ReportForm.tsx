import React, { useState } from 'react';
import { Send, Shield, AlertTriangle, Lock, Upload, X, FileText, Phone, Mail, Globe, CreditCard, MessageSquare, Eye, EyeOff, User, TrendingUp, Briefcase } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (reportData: ReportFormData) => void;
  onCancel: () => void;
}

interface ReportFormData {
  scamType: string;
  entity: string;
  entityType: 'phone' | 'url' | 'email' | 'upi';
  description: string;
  evidence: File[];
  privacyLevel: 'anonymous' | 'private' | 'public';
  contactInfo: string;
  timestamp: string;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ReportFormData>({
    scamType: '',
    entity: '',
    entityType: 'phone',
    description: '',
    evidence: [],
    privacyLevel: 'anonymous',
    contactInfo: '',
    timestamp: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const scamTypes = [
    { value: 'digital_arrest', label: 'Digital Arrest Scam', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'phishing', label: 'Phishing', icon: Shield, color: 'text-blue-600' },
    { value: 'impersonation', label: 'Impersonation', icon: User, color: 'text-purple-600' },
    { value: 'upi_fraud', label: 'UPI Fraud', icon: CreditCard, color: 'text-green-600' },
    { value: 'harassment', label: 'Harassment', icon: MessageSquare, color: 'text-orange-600' },
    { value: 'sextortion', label: 'Sextortion', icon: Lock, color: 'text-red-600' },
    { value: 'investment_scam', label: 'Investment Scam', icon: TrendingUp, color: 'text-indigo-600' },
    { value: 'job_fraud', label: 'Job Fraud', icon: Briefcase, color: 'text-yellow-600' }
  ];

  const entityTypeIcons = {
    phone: Phone,
    url: Globe,
    email: Mail,
    upi: CreditCard
  };

  const privacyLevels = [
    { 
      value: 'anonymous', 
      label: 'Anonymous', 
      description: 'No personal information shared',
      icon: EyeOff,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20'
    },
    { 
      value: 'private', 
      label: 'Private', 
      description: 'Only visible to verified authorities',
      icon: Lock,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      value: 'public', 
      label: 'Public', 
      description: 'Helps warn others (anonymized)',
      icon: Eye,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const handleInputChange = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    handleInputChange('evidence', [...formData.evidence, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    handleInputChange('evidence', newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrivacyIcon = (level: string) => {
    const privacy = privacyLevels.find(p => p.value === level);
    return privacy ? privacy.icon : Lock;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Report Threat Anonymously
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your report helps protect thousands of others. All information is encrypted and secure.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scam Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Scam Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scamTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('scamType', type.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.scamType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${type.color}`} />
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entity Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Threat Entity (Phone/URL/Email/UPI)
          </label>
          <div className="flex space-x-2 mb-3">
            {Object.entries(entityTypeIcons).map(([type, Icon]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleInputChange('entityType', type)}
                className={`p-2 rounded-lg transition-all ${
                  formData.entityType === type
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.entity}
            onChange={(e) => handleInputChange('entity', e.target.value)}
            placeholder={`Enter ${formData.entityType}...`}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Detailed Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            placeholder="Describe what happened, how you were contacted, and any other relevant details..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Evidence (Screenshots, Files, etc.)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="evidence-upload"
            />
            <label htmlFor="evidence-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, PDF, DOC up to 10MB each
              </p>
            </label>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Privacy Level
          </label>
          <div className="space-y-3">
            {privacyLevels.map((level) => {
              const Icon = level.icon;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('privacyLevel', level.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    formData.privacyLevel === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${level.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {level.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Info (Optional) */}
        {formData.privacyLevel !== 'anonymous' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              placeholder="Email or phone for follow-up (will be kept confidential)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {/* Preview Section */}
        {showPreview && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Report Preview</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Scam Type:</strong> {formData.scamType}</div>
              <div><strong>Entity:</strong> {formData.entity}</div>
              <div><strong>Description:</strong> {formData.description}</div>
              <div><strong>Privacy:</strong> {formData.privacyLevel}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.scamType || !formData.entity || !formData.description}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
