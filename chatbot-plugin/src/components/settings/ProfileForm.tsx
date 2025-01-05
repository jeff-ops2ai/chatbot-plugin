import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type ProfileFormData = Database['public']['Tables']['user_profiles']['Update'];

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSuccess?: () => void;
}

export default function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    defaultValues: initialData
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: data.full_name,
          company_name: data.company_name,
          website_url: data.website_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', initialData?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess?.();
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          {...register('full_name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          {...register('company_name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <input
          type="url"
          {...register('website_url')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {mutation.error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error saving profile</h3>
              <div className="mt-2 text-sm text-red-700">
                {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}