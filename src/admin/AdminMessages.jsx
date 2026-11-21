import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { contactApi, extractErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await contactApi.list();
      setMessages(res.messages || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const toggleRead = async (msg) => {
    try {
      await contactApi.markRead(msg._id, !msg.isRead);
      await loadMessages();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactApi.remove(id);
      await loadMessages();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#24364B]">Parent Inquiries</h1>
        <p className="text-sm text-[#52657A]">
          Messages submitted through the Little Star Contact Us form.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-[#52657A]">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-sm text-[#52657A]">
          No contact inquiries received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                msg.isRead
                  ? 'bg-white border-[#E2E8F0]'
                  : 'bg-[#EAF5FF]/60 border-[#2876C8]/30'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#52657A]">
                  <span className="font-semibold text-[#24364B]">{msg.name}</span>
                  <span>&middot;</span>
                  <span className="tabular-nums font-medium text-[#2876C8]">{msg.phone}</span>
                  {msg.email && (
                    <>
                      <span>&middot;</span>
                      <span>{msg.email}</span>
                    </>
                  )}
                  <span>&middot;</span>
                  <span className="tabular-nums">{formatDate(msg.createdAt)}</span>
                </div>
                <h2 className="font-display font-semibold text-base text-[#24364B]">
                  {msg.subject || 'General Inquiry'}
                </h2>
                <p className="text-sm text-[#52657A] leading-relaxed">{msg.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleRead(msg)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#24364B] hover:bg-[#F8FAFC]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{msg.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(msg._id)}
                  className="p-2 rounded-lg text-[#52657A] hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
