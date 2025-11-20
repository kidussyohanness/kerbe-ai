"use client";

import { useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = "" }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        setSubmitStatus("error");
        setErrorMessage(errorData.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`glass-card p-8 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-4 text-text-primary">Send Us a Message</h3>
        <p className="text-text-secondary mb-6">
          Have questions about KERBÉ AI? Want to learn more about our features? 
          We&apos;re here to help you succeed.
        </p>
      </div>

      {submitStatus === "success" && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-semibold">
            Message sent successfully! We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-semibold">
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 glass-input text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 glass-input text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 glass-input text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
            placeholder="What's this about?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 glass-input text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200 resize-vertical"
            placeholder="Tell us more about your question or how we can help..."
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="glass-button glass-gradient px-8 py-4 text-text-primary font-bold text-lg hover-lift focus-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-text-primary border-t-transparent"></div>
                <span>Sending...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Send Message</span>
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-text-muted text-sm">
          Or reach us directly at{" "}
          <a
            href="mailto:info@kerbe.ai"
            className="text-accent-blue hover:text-accent-orange transition-colors duration-200 font-semibold"
          >
            info@kerbé.ai
          </a>
        </p>
      </div>
    </div>
  );
}
