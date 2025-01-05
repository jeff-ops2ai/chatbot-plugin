import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ChatbotPrompt } from '../../types/chatbot';

interface PromptListProps {
  chatbotId: string;
}

export default function PromptList({ chatbotId }: PromptListProps) {
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['chatbot_prompts', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_prompts_view')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('order');
      
      if (error) throw error;
      return data as ChatbotPrompt[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from('chatbot_prompts')
        .delete()
        .eq('id', promptId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot_prompts', chatbotId] });
    }
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading prompts...</div>;
  }

  if (!prompts?.length) {
    return <div className="text-gray-500">No prompts configured</div>;
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div
          key={`${prompt.chatbot_id}-${prompt.role}-${prompt.order}`}
          className="bg-gray-50 rounded-lg p-4 relative group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {prompt.role}
              </h4>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                {prompt.content}
              </p>
              {prompt.order !== 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Order: {prompt.order}
                </p>
              )}
            </div>
            <button
              onClick={() => deleteMutation.mutate(prompt.chatbot_id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}