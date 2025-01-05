import React from 'react';
import { Code } from 'lucide-react';
import type { ChatbotPrompt } from '../../types/chatbot';

interface CurlCommandsProps {
  apiKey: string;
  model: string;
  voice: string;
  prompts?: ChatbotPrompt[];
}

export default function CurlCommands({ apiKey, model, voice, prompts }: CurlCommandsProps) {
  const defaultPrompts = [
    { role: 'system', content: 'You are a helpful voice assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ];

  const messages = prompts?.map(p => ({
    role: p.role,
    content: p.content
  })) || defaultPrompts;

  const curlCommand = `# Test Chat Completion
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "model": "${model}",
    "messages": ${JSON.stringify(messages, null, 2)}
  }'

# Test Text-to-Speech
curl https://api.openai.com/v1/audio/speech \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tts-1",
    "voice": "${voice}",
    "input": "Hello! This is a test of the voice synthesis."
  }' \\
  --output test_speech.mp3`;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">cURL Commands for Testing</h4>
        <button
          onClick={() => {
            navigator.clipboard.writeText(curlCommand);
            alert('Commands copied to clipboard!');
          }}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <Code className="h-4 w-4 mr-1" />
          Copy
        </button>
      </div>
      <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-sm">
        {curlCommand}
      </pre>
      <p className="mt-2 text-sm text-gray-500">
        Run these commands in your terminal to test the OpenAI API integration. 
        {prompts ? ' Using your configured prompts for chat completion.' : ' Using default prompts for testing.'}
      </p>
    </div>
  );
}