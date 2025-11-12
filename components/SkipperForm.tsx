'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

// Form data type
type FormData = {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  country: string;
};

export default function SkipperForm() {
  const t = useTranslations('SkipperPage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Zod schema for form validation
  const formSchema = z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    company: z.string().optional(),
    email: z.string().email(t('validation.emailInvalid')).min(1, t('validation.emailRequired')),
    country: z.string().min(1, t('validation.countryRequired')),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/skipper/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 shadow-lg">
      <h3 className="text-2xl text-gray-900 mb-6 font-nunito font-black">
        {t('formTitle')}
      </h3>
      
      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800">
          {t('formSuccess') || 'Thank you! We will keep you informed.'}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800">
          {t('formError') || 'Something went wrong. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            placeholder={t('firstName')}
            className={`w-full px-4 py-2 border focus:outline-none placeholder:text-sm ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            placeholder={t('lastName')}
            className={`w-full px-4 py-2 border focus:outline-none placeholder:text-sm ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            id="company"
            {...register('company')}
            placeholder={t('company')}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none placeholder:text-sm"
          />
        </div>

        <div>
          <input
            type="email"
            id="email"
            {...register('email')}
            placeholder={t('email')}
            className={`w-full px-4 py-2 border focus:outline-none placeholder:text-sm ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            id="country"
            {...register('country')}
            placeholder={t('country')}
            className={`w-full px-4 py-2 border focus:outline-none placeholder:text-sm ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-800 text-white py-3 px-6 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed  font-nunito font-bold"
        >
          {isSubmitting ? (t('submitting') || 'Submitting...') : t('submit')}
        </button>
        <p className="text-xs text-gray-500 text-center">
          {t('mandatoryNote')}
        </p>
      </form>
    </div>
  );
}

