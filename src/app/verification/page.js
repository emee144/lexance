'use client';
import { useState, useEffect } from 'react';
export default function VerificationPage() {
  const [status, setStatus] = useState('unverified'); // unverified, pending, verified, rejected
  const [idType, setIdType] = useState('passport');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auth/verification/status');
        const data = await res.json();
        if (res.ok) {
          setStatus(data.status || 'unverified');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage('File too large (max 10MB)');
        return;
      }
      if (type === 'front') setIdFront(file);
      if (type === 'back') setIdBack(file);
      if (type === 'selfie') setSelfie(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFront || !selfie || (idType !== 'passport' && !idBack)) {
      setMessage('Please upload all required documents');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('idType', idType);
    formData.append('idFront', idFront);
    if (idBack) formData.append('idBack', idBack);
    formData.append('selfie', selfie);

    try {
      const res = await fetch('/api/auth/verification/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Verification submitted! We will review within 24-48 hours.');
        setStatus('pending');
      } else {
        setMessage(data.error || 'Submission failed');
      }
    } catch (err) {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white py-12 px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-8">Identity Verification (Optional)</h1>

        <div className="bg-green-900 border border-green-600 rounded-xl p-6 text-center mb-12">
          <p className="text-2xl font-bold text-green-300 mb-4">
            Full Access Already Unlocked!
          </p>
          <p className="text-lg">
            You can deposit, withdraw, and trade unlimited crypto without verification.
          </p>
          <p className="text-gray-300 mt-4">
            Verification is optional and only needed for future fiat features (bank transfers, cards).
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-12 text-center">
          <p className="text-sm text-gray-400 mb-2">Current Status</p>
          <p className={`text-4xl font-bold ${
            status === 'verified' ? 'text-green-400' :
            status === 'pending' ? 'text-yellow-400' :
            status === 'rejected' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {status === 'unverified' ? 'Not Verified' :
             status === 'pending' ? 'Pending Review' :
             status === 'verified' ? 'Verified ✓' :
             'Rejected'}
          </p>
        </div>

        {/* Upload Form */}
        {status === 'unverified' || status === 'rejected' ? (
          <div className="bg-[#1a1a1a] rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Submit Verification</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-medium mb-3">Document Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-gray-900 rounded-xl px-6 py-4 text-lg"
                >
                  <option value="passport">Passport</option>
                  <option value="id">National ID</option>
                  <option value="driver">Driver's License</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-medium mb-3">Front of ID</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'front')}
                    required
                    className="w-full bg-gray-900 rounded-xl px-6 py-4 file:bg-gray-600 file:text-white file:rounded file:px-4 file:py-2 file:border-0"
                  />
                  {idFront && <p className="text-green-400 mt-2">✓ Uploaded</p>}
                </div>

                {idType !== 'passport' && (
                  <div>
                    <label className="block text-lg font-medium mb-3">Back of ID</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'back')}
                      required={idType !== 'passport'}
                      className="w-full bg-gray-900 rounded-xl px-6 py-4 file:bg-gray-600 file:text-white file:rounded file:px-4 file:py-2 file:border-0"
                    />
                    {idBack && <p className="text-green-400 mt-2">✓ Uploaded</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium mb-3">Selfie with ID</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  required
                  className="w-full bg-gray-900 rounded-xl px-6 py-4 file:bg-gray-600 file:text-white file:rounded file:px-4 file:py-2 file:border-0"
                />
                {selfie && <p className="text-green-400 mt-2">✓ Uploaded</p>}
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-5 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-xl transition"
                >
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>

              {message && (
                <div className={`text-center text-lg p-4 rounded-xl ${message.includes('submitted') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">
              {status === 'pending' ? 'Your documents are under review.' :
               status === 'verified' ? 'You are fully verified!' :
               'Your submission was rejected. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}