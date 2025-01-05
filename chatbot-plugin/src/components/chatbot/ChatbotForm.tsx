import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PromptForm from './PromptForm';
import PromptList from './PromptList';
import CurlCommands from './CurlCommands';
import type { Chatbot, ChatbotPrompt } from '../../types/chatbot';

type ChatbotFormData = Omit<Chatbot, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

interface ChatbotFormProps {
  chatbot?: Chatbot;
  userId?: string;
  onSuccess?: () => void;
}

export default function ChatbotForm({ chatbot, userId, onSuccess }: ChatbotFormProps) {
  const [showPrompts, setShowPrompts] = useState(false);
  const [showCurl, setShowCurl] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ChatbotFormData>({
    defaultValues: chatbot || {
      model: 'gpt-3.5-turbo',
      voice: 'alloy',
      language: 'en-US'
    }
  });

  // Watch form values for cURL commands
  const apiKey = watch('api_key');
  const model = watch('model');
  const voice = watch('voice');

  // Fetch prompts if chatbot exists
  const { data: prompts } = useQuery({
    queryKey: ['chatbot_prompts', chatbot?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_prompts_view')
        .select('*')
        .eq('chatbot_id', chatbot?.id)
        .order('order');
      
      if (error) throw error;
      return data as ChatbotPrompt[];
    },
    enabled: !!chatbot?.id
  });

  const mutation = useMutation({
    mutationFn: async (data: ChatbotFormData) => {
      if (chatbot?.id) {
        const { error } = await supabase
          .from('chatbots')
          .update(data)
          .eq('id', chatbot.id);
        if (error) throw error;
      } else {
        if (!userId) throw new Error('User ID is required');
        const { error } = await supabase
          .from('chatbots')
          .insert([{ ...data, user_id: userId }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      onSuccess?.();
    }
  });

  return (
    <div className="space-y-6">
      {/* Form fields remain the same */}
      {/* ... */}

      {/* Test Commands Section */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowCurl(!showCurl)}
          className="flex items-center text-sm font-medium text-gray-900"
        >
          {showCurl ? (
            <ChevronUp className="h-5 w-5 mr-2" />
          ) : (
            <ChevronDown className="h-5 w-5 mr-2" />
          )}
          Test Commands
        </button>

        {showCurl && (
          <CurlCommands
            apiKey={apiKey}
            model={model}
            voice={voice}
            prompts={prompts}
          />
        )}
      </div>

      {/* Prompts Section */}
      {chatbot && (
        <div className="border-t pt-6">
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center text-sm font-medium text-gray-900"
          >
            {showPrompts ? (
              <ChevronUp className="h-5 w-5 mr-2" />
            ) : (
              <ChevronDown className="h-5 w-5 mr-2" />
            )}
            Prompts Configuration
          </button>

          {showPrompts && (
            <div className="mt-4 space-y-6">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Current Prompts</h4>
                <PromptList chatbotId={chatbot.id} />
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Add New Prompt</h4>
                <PromptForm chatbotId={chatbot.id} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}