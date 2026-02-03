import { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  Trophy,
  BookOpen,
  Target,
  Globe,
  Loader2
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchCertificates = useCallback(async () => {
    try {
      const params = {};
      if (filter !== 'all') params.type = filter;

      const [certsResponse, statsResponse] = await Promise.all([
        axiosInstance.get('/certificates', { params }),
        axiosInstance.get('/certificates/stats')
      ]);

      setCertificates(certsResponse.data.certificates || []);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleDownload = async (certId) => {
    try {
      const response = await axiosInstance.get(`/certificates/${certId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handleToggleVisibility = async (cert) => {
    try {
      await axiosInstance.patch(`/certificates/${cert._id}/visibility`, {
        isPublic: !cert.isPublic
      });
      toast.success(`Certificate is now ${!cert.isPublic ? 'public' : 'private'}`);
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const handleShare = (cert) => {
    const url = cert.verificationUrl || `${window.location.origin}/verify-certificate/${cert.certificateId}`;

    if (navigator.share) {
      navigator.share({
        title: cert.title,
        text: `Check out my certificate: ${cert.title}`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Verification link copied to clipboard!');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'contest': return <Trophy className="w-5 h-5" />;
      case 'achievement': return <Award className="w-5 h-5" />;
      case 'skill': return <Target className="w-5 h-5" />;
      case 'language_level': return <Globe className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'text-blue-500 bg-blue-500/10';
      case 'contest': return 'text-yellow-500 bg-yellow-500/10';
      case 'achievement': return 'text-purple-500 bg-purple-500/10';
      case 'skill': return 'text-green-500 bg-green-500/10';
      case 'language_level': return 'text-cyan-500 bg-cyan-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-primary" />
          My Certificates
        </h1>
        <p className="opacity-70">
          Your achievements and earned credentials
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            className={`stat bg-base-200 rounded-lg p-4 cursor-pointer transition-colors ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            <div className="stat-title text-xs">Total</div>
            <div className="stat-value text-2xl">{stats.total}</div>
          </div>
          {['course', 'contest', 'achievement', 'skill', 'language_level'].map(type => (
            <div
              key={type}
              className={`stat bg-base-200 rounded-lg p-4 cursor-pointer transition-colors ${filter === type ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(type)}
            >
              <div className={`stat-figure ${getTypeColor(type)} p-2 rounded-lg`}>
                {getTypeIcon(type)}
              </div>
              <div className="stat-title text-xs capitalize">{type.replace('_', ' ')}</div>
              <div className="stat-value text-2xl">{stats.byType[type] || 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* Certificates List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl">
          <Award className="w-16 h-16 mx-auto text-primary/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="opacity-70">
            Complete courses, win contests, or achieve milestones to earn certificates!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="card bg-base-200 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${getTypeColor(cert.type)}`}>
                    {getTypeIcon(cert.type)}
                  </div>
                  <div className="flex gap-1">
                    {cert.isPublic ? (
                      <span className="badge badge-success badge-sm">Public</span>
                    ) : (
                      <span className="badge badge-ghost badge-sm">Private</span>
                    )}
                  </div>
                </div>

                <h2 className="card-title text-lg mt-3">{cert.title}</h2>
                <p className="text-sm opacity-70 line-clamp-2">{cert.description}</p>

                {/* Metadata */}
                {cert.metadata && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {cert.metadata.score && (
                      <span className="badge badge-outline">Score: {cert.metadata.score}</span>
                    )}
                    {cert.metadata.rank && (
                      <span className="badge badge-outline">Rank: #{cert.metadata.rank}</span>
                    )}
                    {cert.metadata.level && (
                      <span className="badge badge-outline">Level: {cert.metadata.level}</span>
                    )}
                  </div>
                )}

                <div className="text-xs opacity-50 mt-2">
                  Issued: {new Date(cert.metadata?.issueDate || cert.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(cert);
                    }}
                    title={cert.isPublic ? 'Make private' : 'Make public'}
                  >
                    {cert.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(cert);
                    }}
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(cert._id);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setSelectedCert(null)}
            >
              ×
            </button>

            <div className={`p-4 rounded-lg ${getTypeColor(selectedCert.type)} inline-block mb-4`}>
              {getTypeIcon(selectedCert.type)}
            </div>

            <h2 className="text-2xl font-bold mb-2">{selectedCert.title}</h2>
            <p className="opacity-70 mb-4">{selectedCert.description}</p>

            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border-2 border-primary/20 mb-4">
              <div className="text-center">
                <div className="text-sm opacity-50 mb-2">Certificate of {selectedCert.type.replace('_', ' ')}</div>
                <div className="text-lg font-bold text-primary mb-4">{selectedCert.title}</div>

                {selectedCert.metadata && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedCert.metadata.score && (
                      <div>
                        <div className="opacity-50">Score</div>
                        <div className="font-semibold">{selectedCert.metadata.score}</div>
                      </div>
                    )}
                    {selectedCert.metadata.rank && (
                      <div>
                        <div className="opacity-50">Rank</div>
                        <div className="font-semibold">#{selectedCert.metadata.rank}</div>
                      </div>
                    )}
                    {selectedCert.metadata.level && (
                      <div>
                        <div className="opacity-50">Level</div>
                        <div className="font-semibold">{selectedCert.metadata.level}</div>
                      </div>
                    )}
                    {selectedCert.metadata.wordsLearned && (
                      <div>
                        <div className="opacity-50">Words Learned</div>
                        <div className="font-semibold">{selectedCert.metadata.wordsLearned}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 text-xs opacity-50">
                  Issued on {new Date(selectedCert.metadata?.issueDate || selectedCert.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Verified Certificate</span>
              </div>
              <div className="text-xs opacity-70">
                Certificate ID: {selectedCert.certificateId}
              </div>
              <a
                href={selectedCert.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 mt-1"
              >
                {selectedCert.verificationUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => handleShare(selectedCert)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(selectedCert._id)}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedCert(null)} />
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
