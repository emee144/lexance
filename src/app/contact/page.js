'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!name || !email || !subject || !message) {
      setStatus('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('/api/auth/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setStatus('Thank you! Your ticket has been submitted. We will reply within 24 hours.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white py-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Contact Support</h1>
          <p className="text-xl text-gray-400">
            Our team is here to help you 24/7
          </p>
        </div>

       
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-2xl font-bold mb-3">Email Support</h3>
            <p className="text-gray-400 mb-4">
              Submit a ticket below — average response time: <strong>under 12 hours</strong>
            </p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-3">Live Chat</h3>
            <p className="text-gray-400 mb-4">
              Coming soon — instant help during business hours
            </p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">❓</div>
            <h3 className="text-2xl font-bold mb-3">Help Center</h3>
            <p className="text-gray-400 mb-4">
              Most questions answered instantly
            </p>
            <a href="/help" className="inline-block mt-4 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-medium">
              Visit Help Center →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#1a1a1a] rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Submit a Support Ticket</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Deposit not received"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Message
              </label>
              <textarea
                rows="8"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xl transition cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>

            {status && (
              <div className={`mt-6 p-6 rounded-xl text-center text-lg font-medium ${status.includes('Thank you') || status.includes('submitted') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {status}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-gray-500 mt-12">
          Urgent issue? Include your User ID and transaction hash for faster help.
        </p>
      </div>
    </div>
  );
}