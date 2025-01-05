import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type PromptFormData = {
  role_id: string;
  content: string;
  order: number;
};

interface PromptFormProps {
  chatbotId: string;
  onSuccess?: () => void;
}

export default function PromptForm({ chatbotId, onSuccess }: PromptFormProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PromptFormData>({
    defaultValues: {
      order: 0
    }
  });

  // Fetch available LLM roles
  const { data: roles } = useQuery({
    queryKey: ['llm_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_roles')
        .select(`
          id,
          name,
          description,
          llm_providers (
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: PromptFormData) => {
      const { error } = await supabase
        .from('chatbot_prompts')
        .insert([{
          chatbot_id: chatbotId,
          role_id: data.role_id,
          content: data.content,
          order: data.order
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot_prompts', chatbotId] });
      reset();
      onSuccess?.();
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          {...register('role_id', { required: 'Role is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a role</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.llm_providers?.name})
            </option>
          ))}
        </select>
        {errors.role_id && (
          <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          {...register('content', { required: 'Prompt content is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter the prompt content..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Order
        </label>
        <input
          type="number"
          {...register('order', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Prompts are processed in ascending order
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Prompt
        </button>
      </div>
    </form>
  );
}