import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { WalmartToken } from '../../types';
import { 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Key
} from 'lucide-react';
import { format, isAfter, subHours } from 'date-fns';

const WalmartConnection: React.FC = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<WalmartToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchToken();
  }, [user]);

  const fetchToken = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('walmart_tokens')
        .select('*')
        .eq('seller_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setToken(data);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const connectToWalmart = async () => {
    setConnecting(true);
    setError('');

    try {
      // Simulate Walmart Token API call
      // In real implementation, this would call Walmart's Token API
      const mockTokenResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 3600, // 1 hour
      };

      const expiresAt = new Date(Date.now() + mockTokenResponse.expires_in * 1000);

      const tokenData = {
        seller_id: user!.id,
        access_token: mockTokenResponse.access_token,
        token_type: mockTokenResponse.token_type,
        expires_at: expiresAt.toISOString(),
      };

      const { data, error } = await supabase
        .from('walmart_tokens')
        .upsert(tokenData)
        .select()
        .single();

      if (error) throw error;
      setToken(data);
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Walmart');
    } finally {
      setConnecting(false);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate token refresh
      const mockTokenResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9_refreshed...',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const expiresAt = new Date(Date.now() + mockTokenResponse.expires_in * 1000);

      const { data, error } = await supabase
        .from('walmart_tokens')
        .update({
          access_token: mockTokenResponse.access_token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', token!.id)
        .select()
        .single();

      if (error) throw error;
      setToken(data);
    } catch (error: any) {
      setError(error.message || 'Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  const isTokenExpired = token ? isAfter(new Date(), new Date(token.expiresAt)) : false;
  const isTokenExpiringSoon = token ? isAfter(new Date(), subHours(new Date(token.expiresAt), 1)) : false;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0">
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Walmart Marketplace</h3>
          <p className="text-sm text-gray-500">Connect to Walmart's API to manage your listings</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {!token ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <Key className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Not Connected</h4>
          <p className="text-sm text-gray-500 mb-6">
            Connect to Walmart Marketplace to start managing your products and orders.
          </p>
          <button
            onClick={connectToWalmart}
            disabled={connecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Connect to Walmart
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Connected to Walmart</p>
                <p className="text-xs text-green-600">
                  Connected on {format(new Date(token.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Key className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Access Token</span>
              </div>
              <p className="text-xs font-mono text-gray-600 break-all">
                {token.accessToken.substring(0, 20)}...
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Expires</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600">
                  {format(new Date(token.expiresAt), 'MMM d, yyyy HH:mm')}
                </p>
                {isTokenExpired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Expired
                  </span>
                )}
                {!isTokenExpired && isTokenExpiringSoon && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={refreshToken}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Token
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalmartConnection;