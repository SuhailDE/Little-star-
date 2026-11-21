import { useState } from 'react';
import { CheckCircle2, ExternalLink, MapPin, MessageCircle, Phone, Send, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSettings } from '../context/SettingsContext.jsx';
import { contactApi, extractErrorMessage } from '../services/api.js';
import {
  formatTelHref,
  formatWhatsAppHref,
  getEmbeddableMapUrl,
  isSafeHttpUrl,
} from '../utils/formatters.js';

export default function ContactPage() {
  const { settings } = useSettings();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const phones =
    settings.phones && settings.phones.length > 0
      ? settings.phones
      : ['01636-021582', '01682-225117'];
  const whatsappNumber = settings.whatsappNumber || phones[0];
  const embedMapUrl = getEmbeddableMapUrl(settings.googleMapsUrl);
  const hasSafeMapLink = isSafeHttpUrl(settings.googleMapsUrl);

  const onSubmit = async (values) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await contactApi.submit(values);
      setSentSuccess(true);
      reset();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">Get in Touch</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B]">
            Contact {settings.institutionName || 'Little Star'}
          </h1>
          <p className="text-base text-[#52657A] max-w-2xl">
            Reach out directly for admission guidance, regular classes, or Special English &amp; ICT
            course inquiries.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Direct Official Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[#DCE8F5] bg-[#F8FBFF] p-7 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#24364B]">
                    {settings.institutionName || 'Little Star'}
                  </h2>
                  <p className="text-sm text-[#52657A] mt-1">
                    {settings.tagline || 'A Caring Place for Young Learners'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#24364B]">
                  <User className="w-4 h-4 text-[#2876C8] shrink-0" />
                  <span>
                    Director:{' '}
                    <strong className="font-semibold">
                      {settings.directorName || 'Selina Parveen (Munni)'}
                    </strong>
                  </span>
                </div>

                {/* Click-to-call Phone Buttons */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#52657A]">Official Phone Numbers</p>
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={formatTelHref(phone)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#DCE8F5] text-sm font-semibold text-[#24364B] hover:border-[#2876C8] transition-colors tabular-nums"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#2876C8]" />
                        <span>{phone}</span>
                      </span>
                      <span className="text-xs text-[#2876C8]">Call Now</span>
                    </a>
                  ))}
                </div>

                {/* WhatsApp & Facebook Buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={formatWhatsAppHref(
                      whatsappNumber,
                      'Hello Little Star, I would like to inquire about admission.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803D] text-white text-sm font-semibold hover:bg-[#166534] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp ({whatsappNumber})</span>
                  </a>

                  {isSafeHttpUrl(settings.facebookUrl) && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors"
                    >
                      <span>Facebook Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Address */}
                <div className="pt-4 border-t border-[#DCE8F5] space-y-2">
                  <p className="text-xs font-semibold text-[#52657A]">Campus Location</p>
                  <div className="flex items-start gap-2.5 text-sm text-[#24364B]">
                    <MapPin className="w-4 h-4 text-[#2876C8] shrink-0 mt-0.5" />
                    <span>
                      {settings.address
                        ? settings.address
                        : 'Campus address will be updated here once configured by the administrator. Please call 01636-021582 or 01682-225117 for directions.'}
                    </span>
                  </div>
                  {hasSafeMapLink && !embedMapUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2876C8] hover:underline pt-1"
                    >
                      <span>Open Location in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#DCE8F5] bg-white p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#24364B]">
                    Send a Message
                  </h2>
                  <p className="text-sm text-[#52657A] mt-1">
                    Leave your phone number and message, and our administration will respond.
                  </p>
                </div>

                {sentSuccess ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#24364B]">Message Sent Successfully</p>
                        <p className="text-sm text-[#52657A] mt-1">
                          Thank you for reaching out to Little Star. We will get back to you soon.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSentSuccess(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-sm font-semibold text-[#24364B]"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {submitError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Parent / Guardian name"
                          {...register('name', { required: 'Name is required.' })}
                          className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          {...register('phone', {
                            required: 'Phone number is required.',
                            pattern: {
                              value: /^[0-9+\-\s()]{8,18}$/,
                              message: 'Enter a valid phone number.',
                            },
                          })}
                          className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          {...register('email', {
                            pattern: {
                              value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Enter a valid email address.',
                            },
                          })}
                          className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Admission / Class Inquiry"
                          {...register('subject')}
                          className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Message *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Write your question or message here..."
                        {...register('message', { required: 'Message is required.' })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.message && (
                        <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps Embed when configured by Admin */}
          {embedMapUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#DCE8F5] h-80 bg-[#F4F8FC]">
              <iframe
                title="Little Star Campus Location Map"
                src={embedMapUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
