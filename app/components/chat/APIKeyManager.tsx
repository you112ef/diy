import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import type { ProviderInfo } from '~/types/model';
import Cookies from 'js-cookie';

interface APIKeyManagerProps {
  provider: ProviderInfo;
  apiKey: string;
  setApiKey: (key: string) => void;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

// cache which stores whether the provider's API key is set via environment variable
const providerEnvKeyStatusCache: Record<string, boolean> = {};

const apiKeyMemoizeCache: { [k: string]: Record<string, string> } = {};

export function getApiKeysFromCookies() {
  const storedApiKeys = Cookies.get('apiKeys');
  let parsedKeys: Record<string, string> = {};

  if (storedApiKeys) {
    parsedKeys = apiKeyMemoizeCache[storedApiKeys];

    if (!parsedKeys) {
      parsedKeys = apiKeyMemoizeCache[storedApiKeys] = JSON.parse(storedApiKeys);
    }
  }

  return parsedKeys;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isEnvKeySet, setIsEnvKeySet] = useState(false);

  // Reset states and load saved key when provider changes
  useEffect(() => {
    // Load saved API key from cookies for this provider
    const savedKeys = getApiKeysFromCookies();
    const savedKey = savedKeys[provider.name] || '';

    setTempKey(savedKey);
    setApiKey(savedKey);
    setIsEditing(false);
  }, [provider.name]);

  const checkEnvApiKey = useCallback(async () => {
    // Check cache first
    if (providerEnvKeyStatusCache[provider.name] !== undefined) {
      setIsEnvKeySet(providerEnvKeyStatusCache[provider.name]);
      return;
    }

    try {
      const response = await fetch(`/api/check-env-key?provider=${encodeURIComponent(provider.name)}`);
      const data = await response.json();
      const isSet = (data as { isSet: boolean }).isSet;

      // Cache the result
      providerEnvKeyStatusCache[provider.name] = isSet;
      setIsEnvKeySet(isSet);
    } catch (error) {
      console.error('Failed to check environment API key:', error);
      setIsEnvKeySet(false);
    }
  }, [provider.name]);

  useEffect(() => {
    checkEnvApiKey();
  }, [checkEnvApiKey]);

  const handleSave = () => {
    // Save to parent state
    setApiKey(tempKey);

    // Save to cookies
    const currentKeys = getApiKeysFromCookies();
    const newKeys = { ...currentKeys, [provider.name]: tempKey };
    Cookies.set('apiKeys', JSON.stringify(newKeys));

    setIsEditing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-1 gap-3 sm:gap-2"> {/* Responsive flex, gap */}
      {/* Left part: Provider Name and Status */}
      <div className="flex items-center gap-2 w-full sm:w-auto"> {/* Allow text to wrap better on mobile */}
        <span className="text-sm font-medium text-bolt-elements-textSecondary whitespace-nowrap">{provider?.name} API Key:</span>
        {!isEditing && (
          <div className="flex items-center gap-1.5"> {/* Slightly reduced gap for status */}
            {apiKey ? (
              <>
                <div className="i-ph:check-circle-fill text-green-500 w-4 h-4 shrink-0" />
                <span className="text-xs text-green-500">Set via UI</span>
              </>
            ) : isEnvKeySet ? (
              <>
                <div className="i-ph:check-circle-fill text-green-500 w-4 h-4 shrink-0" />
                <span className="text-xs text-green-500">Set via ENV</span> {/* Shorter text */}
              </>
            ) : (
              <>
                <div className="i-ph:x-circle-fill text-red-500 w-4 h-4 shrink-0" />
                <span className="text-xs text-red-500">Not Set</span> {/* Shorter text */}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right part: Input field and Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end"> {/* Control width and justification */}
        {isEditing ? (
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full"> {/* Stack on very small, then row */}
            <input
              type="password"
              value={tempKey}
              placeholder="Enter API Key"
              onChange={(e) => setTempKey(e.target.value)}
              className="flex-grow w-full xs:w-auto xs:min-w-[150px] sm:min-w-[200px] md:min-w-[250px] px-3 py-1.5 text-sm rounded border border-bolt-elements-borderColor 
                        bg-bolt-elements-prompt-background text-bolt-elements-textPrimary 
                        focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus" // Responsive width
            />
            <div className="flex gap-2 justify-end xs:justify-start"> {/* Align buttons */}
              <IconButton
                onClick={handleSave}
                title="Save API Key"
                className="bg-green-500/10 hover:bg-green-500/20 text-green-500 p-2 sm:p-1.5" // Adjusted padding for tap target
              >
                <div className="i-ph:check w-4 h-4" />
              </IconButton>
              <IconButton
                onClick={() => setIsEditing(false)}
                title="Cancel"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 sm:p-1.5" // Adjusted padding
              >
                <div className="i-ph:x w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full sm:w-auto"> {/* Allow buttons to wrap and align */}
            <IconButton
              onClick={() => setIsEditing(true)}
              title="Edit API Key"
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 p-2 sm:p-1.5" // Adjusted padding
            >
              <div className="i-ph:pencil-simple w-4 h-4" />
            </IconButton>
            {provider?.getApiKeyLink && !apiKey && !isEnvKeySet && ( // Also check isEnvKeySet before showing "Get API Key"
              <IconButton
                onClick={() => window.open(provider?.getApiKeyLink)}
                title="Get API Key"
                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 flex items-center gap-1 sm:gap-2 p-2 sm:p-1.5" // Adjusted padding and gap
              >
                <span className="text-xs whitespace-nowrap">{provider?.labelForGetApiKey || 'Get API Key'}</span>
                <div className={`${provider?.icon || 'i-ph:key'} w-4 h-4`} />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
