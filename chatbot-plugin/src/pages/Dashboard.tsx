import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import StatsCard from '../components/dashboard/StatsCard';
import type { Chatbot } from '../types/chatbot';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: chatbots, isLoading } = useQuery({
    queryKey: ['chatbots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data as Chatbot[];
    },
    enabled: !!user
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Chatbots"
          value={isLoading ? '...' : chatbots?.length || 0}
          icon={MessageSquare}
          description="Active voice assistants"
        />
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Start</h2>
          <p className="mt-4 text-gray-500">
            Create your first voice chatbot by clicking the "New Chatbot" button in the Chatbots section.
            Each chatbot can be customized with different voices and languages.
          </p>
        </div>
      </div>
    </div>
  );
}