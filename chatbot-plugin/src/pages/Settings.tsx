import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import ProfileForm from '../components/settings/ProfileForm';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['user_profiles']['Row'];

export default function Settings() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your profile information and preferences.
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ProfileForm
                initialData={profile}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['profile'] });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}