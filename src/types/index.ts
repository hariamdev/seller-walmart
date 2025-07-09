export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  sellerId: string;
}

export interface WalmartToken {
  id: string;
  seller_id: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  scope?: string;
  created_at: string;
  updated_at: string;
}

export interface WalmartEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: EndpointParameter[];
  category: string;
}

export interface EndpointParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
}

export interface ApiResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timestamp: string;
}