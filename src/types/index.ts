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

export interface Order {
  id: string;
  purchaseOrderId: string;
  customerOrderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: 'created' | 'acknowledged' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  lastUpdated: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'exception';
  shippedDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: ShipmentItem[];
}

export interface ShipmentItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
}