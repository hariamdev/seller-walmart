import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WalmartTokenService, WalmartTokenRecord } from '../../services/walmartTokenService';
import { 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Key,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format } from 'date-fns';

const WalmartConnection: React.FC = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<WalmartTokenRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    isExpiring?: boolean;
    needsRefresh?: boolean;
  }>({ isConnected: false });

  useEffect(() => {
    checkConnectionStatus();
    
    // Check for authorization code in URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      setError(`Authorization failed: ${error}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      handleAuthorizationCallback(code, state);
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      const status = await WalmartTokenService.getConnectionStatus(user.id);
      setConnectionStatus(status);
      setToken(status.token || null);

      // Auto-refresh if needed
      if (status.needsRefresh && status.token?.refresh_token) {
        await refreshToken(true); // Silent refresh
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus({ isConnected: false });
    }
  };

  const handleAuthorizationCallback = async (code: string, state: string | null) => {
    if (!user) return;
    
    setConnecting(true);
    setError('');

    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const tokenData = await WalmartTokenService.getAccessToken(code, redirectUri);
      const storedToken = await WalmartTokenService.storeToken(user.id, tokenData);
      setToken(storedToken);
      setConnectionStatus({ isConnected: true });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error: any) {
      setError(error.message || 'Failed to complete Walmart authorization');
    } finally {
      setConnecting(false);
    }
  };

  const connectToWalmart = async () => {
    if (!user) return;
    
    setError('');

    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state = crypto.randomUUID(); // Generate random state for security
      const authUrl = WalmartTokenService.generateAuthorizationUrl(redirectUri, state);
      
      // Store state in sessionStorage for validation
      sessionStorage.setItem('walmart_oauth_state', state);
      
      // Redirect to Walmart authorization page
      window.location.href = authUrl;
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Walmart');
    }
  };

  const refreshToken = async (silent: boolean = false) => {
    if (!user || !token?.refresh_token) return;
    
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const newTokenData = await WalmartTokenService.refreshAccessToken(token.refresh_token);
      const updatedToken = await WalmartTokenService.storeToken(user.id, newTokenData, token.seller_id);
      setToken(updatedToken);
      setConnectionStatus({ isConnected: true });
      
      if (!silent) {
        // Show success message for manual refresh
        setError('');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh token';
      if (!silent) {
        setError(errorMessage);
      }
      console.error('Token refresh failed:', errorMessage);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const disconnectWalmart = async () => {
    if (!user) return;
    await WalmartTokenService.deleteToken(user.id);
    setToken(null);
    setConnectionStatus({ isConnected: false });
  };

  const getConnectionStatusDisplay = () => {
    if (!connectionStatus.isConnected) {
      return {
        icon: WifiOff,
        text: 'Not Connected',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
      };
    }

    if (connectionStatus.needsRefresh) {
      return {
        icon: AlertCircle,
        text: 'Token Expired',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }

    if (connectionStatus.isExpiring) {
      return {
        icon: Clock,
        text: 'Token Expiring Soon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    }

    return {
      icon: Wifi,
      text: 'Connected',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  };

  const statusDisplay = getConnectionStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Walmart Marketplace</h3>
            <p className="text-sm text-gray-500">Connect to Walmart's API to manage your listings</p>
          </div>
        </div>
        
        {/* Connection Status Indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusDisplay.bgColor}`}>
          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
          <span className={`text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {!connectionStatus.isConnected ? (
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
                <ExternalLink className="h-4 w-4 mr-2" />
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
                  Connected on {format(new Date(token!.created_at), 'MMM d, yyyy HH:mm')}
                </p>
                {token?.seller_id && (
                  <p className="text-xs text-green-600">
                    Seller ID: {token.seller_id}
                  </p>
                )}
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
                {token!.access_token.substring(0, 20)}... (encrypted)
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Expires</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600">
                  {format(new Date(token!.expires_at), 'MMM d, yyyy HH:mm')}
                </p>
                {connectionStatus.isExpiring && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex space-x-2">
              {token?.refresh_token && (
                <button
                  onClick={() => refreshToken(false)}
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
              )}
              <button
                onClick={disconnectWalmart}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalmartConnection;