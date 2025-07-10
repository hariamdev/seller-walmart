import { supabase } from '../lib/supabase';

// Walmart API configuration
const WALMART_API_BASE_URL = 'https://marketplace.walmartapis.com';
const WALMART_TOKEN_URL = `${WALMART_API_BASE_URL}/v3/token`;

// These should be stored in environment variables in production
const WALMART_CLIENT_ID = import.meta.env.VITE_WALMART_CLIENT_ID;
const WALMART_CLIENT_SECRET = import.meta.env.VITE_WALMART_CLIENT_SECRET;

export interface WalmartTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface WalmartTokenRecord {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  scope?: string;
  seller_id?: string;
  created_at: string;
  updated_at: string;
}

export class WalmartTokenService {
  /**
   * Get access token using authorization code flow
   * Reference: https://developer.walmart.com/us-marketplace/reference/tokenapi
   */
  static async getAccessToken(authorizationCode: string, redirectUri: string): Promise<WalmartTokenResponse> {
    if (!WALMART_CLIENT_ID || !WALMART_CLIENT_SECRET) {
      throw new Error('Walmart API credentials not configured. Please set VITE_WALMART_CLIENT_ID and VITE_WALMART_CLIENT_SECRET in your environment variables.');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
      client_id: WALMART_CLIENT_ID,
      client_secret: WALMART_CLIENT_SECRET,
    });

    try {
      const response = await fetch(WALMART_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Walmart API Error: ${response.status} - ${errorData.error_description || response.statusText}`);
      }

      const tokenData: WalmartTokenResponse = await response.json();
      return tokenData;
    } catch (error) {
      console.error('Error getting Walmart access token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * Reference: https://developer.walmart.com/us-marketplace/reference/tokenapi
   */
  static async refreshAccessToken(refreshToken: string): Promise<WalmartTokenResponse> {
    if (!WALMART_CLIENT_ID || !WALMART_CLIENT_SECRET) {
      throw new Error('Walmart API credentials not configured. Please set VITE_WALMART_CLIENT_ID and VITE_WALMART_CLIENT_SECRET in your environment variables.');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: WALMART_CLIENT_ID,
      client_secret: WALMART_CLIENT_SECRET,
    });

    try {
      const response = await fetch(WALMART_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Walmart API Error: ${response.status} - ${errorData.error_description || response.statusText}`);
      }

      const tokenData: WalmartTokenResponse = await response.json();
      return tokenData;
    } catch (error) {
      console.error('Error refreshing Walmart access token:', error);
      throw error;
    }
  }

  /**
   * Store token in database
   */
  static async storeToken(userId: string, tokenData: WalmartTokenResponse, sellerId?: string): Promise<WalmartTokenRecord> {
    try {
      const { data, error } = await supabase
        .from('walmart_tokens')
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing Walmart token:', error);
      throw error;
    }
  }

  /**
   * Get stored token from database
   */
  static async getStoredToken(userId: string): Promise<WalmartTokenRecord | null> {
    try {
      const { data, error } = await supabase
        .from('walmart_tokens')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting stored Walmart token:', error);
      throw error;
    }
  }

  /**
   * Check if token is expired or expiring soon
   */
  static isTokenExpiring(token: WalmartTokenRecord, bufferMinutes: number = 5): boolean {
    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
    
    return (expiresAt.getTime() - now.getTime()) <= bufferTime;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  static async getValidAccessToken(userId: string): Promise<{ token: string; isRefreshed: boolean }> {
    const storedToken = await this.getStoredToken(userId);
    
    if (!storedToken) {
      throw new Error('No Walmart token found. Please connect to Walmart first.');
    }

    // If token is not expiring, return it
    if (!this.isTokenExpiring(storedToken)) {
      return { token: storedToken.access_token, isRefreshed: false };
    }

    // If token is expiring and we have a refresh token, refresh it
    if (storedToken.refresh_token) {
      try {
        const newTokenData = await this.refreshAccessToken(storedToken.refresh_token);
        const updatedToken = await this.storeToken(userId, newTokenData, storedToken.seller_id);
        return { token: updatedToken.access_token, isRefreshed: true };
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Token expired and refresh failed. Please reconnect to Walmart.');
      }
    }

    throw new Error('Token expired and no refresh token available. Please reconnect to Walmart.');
  }

  /**
   * Delete stored token
   */
  static async deleteToken(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('walmart_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting Walmart token:', error);
      throw error;
    }
  }

  /**
   * Generate Walmart authorization URL
   */
  static generateAuthorizationUrl(redirectUri: string, state?: string): string {
    if (!WALMART_CLIENT_ID) {
      throw new Error('Walmart Client ID not configured. Please set VITE_WALMART_CLIENT_ID in your environment variables.');
    }

    const params = new URLSearchParams({
      client_id: WALMART_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'item orders inventory reports', // Adjust scopes as needed
    });

    if (state) {
      params.append('state', state);
    }

    return `${WALMART_API_BASE_URL}/v3/token/authorize?${params.toString()}`;
  }

  /**
   * Check connection status and get token info
   */
  static async getConnectionStatus(userId: string): Promise<{
    isConnected: boolean;
    token?: WalmartTokenRecord;
    isExpiring?: boolean;
    needsRefresh?: boolean;
  }> {
    try {
      const token = await this.getStoredToken(userId);
      
      if (!token) {
        return { isConnected: false };
      }

      const isExpiring = this.isTokenExpiring(token, 60); // 1 hour buffer
      const needsRefresh = this.isTokenExpiring(token, 5); // 5 minutes buffer

      return {
        isConnected: true,
        token,
        isExpiring,
        needsRefresh
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return { isConnected: false };
    }
  }
}