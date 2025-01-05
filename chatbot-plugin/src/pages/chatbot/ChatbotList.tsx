import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Settings, Trash2, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ChatbotForm from '../../components/chatbot/ChatbotForm';
import DeleteConfirmDialog from '../../components/chatbot/DeleteConfirmDialog';
import { useAuthStore } from '../../lib/store';
import type { Chatbot } from '../../types/chatbot';

export default function ChatbotList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; chatbot: Chatbot | null }>({
    isOpen: false,
    chatbot: null
  });

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

  const deleteMutation = useMutation({
    mutationFn: async (chatbotId: string) => {
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      setDeleteConfirm({ isOpen: false, chatbot: null });
    },
    onError: (error) => {
      console.error('Error deleting chatbot:', error);
      alert('Failed to delete chatbot. Please try again.');
    }
  });

  function handleDelete(chatbot: Chatbot) {
    setDeleteConfirm({ isOpen: true, chatbot });
  }

  function confirmDelete() {
    if (deleteConfirm.chatbot) {
      deleteMutation.mutate(deleteConfirm.chatbot.id);
    }
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      alert('Chatbot ID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Voice Chatbots</h1>
        <button
          onClick={() => {
            setSelectedChatbot(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Chatbot
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {selectedChatbot ? 'Edit Chatbot' : 'Create New Chatbot'}
            </h3>
            <ChatbotForm
              chatbot={selectedChatbot}
              userId={user?.id}
              onSuccess={() => {
                setShowForm(false);
                setSelectedChatbot(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading chatbots...</div>
        ) : !chatbots?.length ? (
          <div className="p-4 text-center text-gray-500">
            No chatbots yet. Create your first one to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {chatbots.map((chatbot) => (
              <li key={chatbot.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{chatbot.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Model: {chatbot.model} • Voice: {chatbot.voice} • Language: {chatbot.language}
                    </p>
                    <div className="mt-1 flex items-center">
                      <p className="text-sm text-gray-500 font-mono">ID: {chatbot.id}</p>
                      <button
                        onClick={() => copyId(chatbot.id)}
                        className="ml-2 text-gray-400 hover:text-gray-500"
                        title="Copy ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedChatbot(chatbot);
                        setShowForm(true);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(chatbot)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, chatbot: null })}
        onConfirm={confirmDelete}
        chatbotName={deleteConfirm.chatbot?.name || ''}
      />
    </div>
  );
}