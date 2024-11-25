import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationPromptProps {
  status: 'loading' | 'error' | 'success';
  error?: string;
}

export default function LocationPrompt({ status, error }: LocationPromptProps) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4 mb-6 bg-blue-50 rounded-lg">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
        <span className="text-blue-700">Getting your location...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center p-4 mb-6 bg-red-50 rounded-lg">
        <MapPin className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">{error || 'Unable to get your location'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 mb-6 bg-green-50 rounded-lg">
      <MapPin className="h-5 w-5 text-green-500 mr-2" />
      <span className="text-green-700">Using your current location to find nearby vendors</span>
    </div>
  );
}