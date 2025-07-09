import React, { useState, useEffect } from 'react';
import { WalmartEndpoint, ApiResponse } from '../../types';
import { 
  Search, 
  Play, 
  Code, 
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const ApiExplorer: React.FC = () => {
  const [endpoints, setEndpoints] = useState<WalmartEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<WalmartEndpoint | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Items']));

  useEffect(() => {
    // Mock Walmart API endpoints
    const mockEndpoints: WalmartEndpoint[] = [
      {
        id: '1',
        method: 'GET',
        path: '/v3/items',
        description: 'Retrieve all items for a seller',
        category: 'Items',
        parameters: [
          { name: 'limit', type: 'number', required: false, description: 'Number of items to return (max 200)' },
          { name: 'offset', type: 'number', required: false, description: 'Offset for pagination' },
          { name: 'sku', type: 'string', required: false, description: 'Filter by SKU' }
        ]
      },
      {
        id: '2',
        method: 'POST',
        path: '/v3/items',
        description: 'Create or update items in bulk',
        category: 'Items',
        parameters: [
          { name: 'feedType', type: 'string', required: true, description: 'Type of feed (item, MP_ITEM, etc.)' }
        ]
      },
      {
        id: '3',
        method: 'GET',
        path: '/v3/orders',
        description: 'Retrieve orders for a seller',
        category: 'Orders',
        parameters: [
          { name: 'createdStartDate', type: 'string', required: false, description: 'Start date for order creation' },
          { name: 'createdEndDate', type: 'string', required: false, description: 'End date for order creation' },
          { name: 'limit', type: 'number', required: false, description: 'Number of orders to return' }
        ]
      },
      {
        id: '4',
        method: 'POST',
        path: '/v3/orders/{purchaseOrderId}/acknowledge',
        description: 'Acknowledge an order',
        category: 'Orders',
        parameters: [
          { name: 'purchaseOrderId', type: 'string', required: true, description: 'Purchase Order ID' }
        ]
      },
      {
        id: '5',
        method: 'GET',
        path: '/v3/inventory',
        description: 'Get inventory for items',
        category: 'Inventory',
        parameters: [
          { name: 'sku', type: 'string', required: false, description: 'Filter by SKU' },
          { name: 'limit', type: 'number', required: false, description: 'Number of items to return' }
        ]
      },
      {
        id: '6',
        method: 'PUT',
        path: '/v3/inventory',
        description: 'Update inventory for items',
        category: 'Inventory',
        parameters: [
          { name: 'sku', type: 'string', required: true, description: 'SKU to update' },
          { name: 'quantity', type: 'number', required: true, description: 'New quantity' }
        ]
      }
    ];

    setEndpoints(mockEndpoints);
  }, []);

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, WalmartEndpoint[]>);

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const executeEndpoint = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setResponse(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResponse: ApiResponse = {
        status: 200,
        data: {
          message: 'Success',
          data: selectedEndpoint.method === 'GET' ? [
            { id: 1, name: 'Sample Item 1', sku: 'SKU001' },
            { id: 2, name: 'Sample Item 2', sku: 'SKU002' }
          ] : { success: true, id: 'created-123' },
          timestamp: new Date().toISOString()
        },
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '99'
        },
        timestamp: new Date().toISOString()
      };

      setResponse(mockResponse);
    } catch (error) {
      setResponse({
        status: 500,
        data: { error: 'Internal Server Error' },
        headers: {},
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Explorer</h1>
        <p className="mt-1 text-sm text-gray-600">
          Test Walmart Marketplace API endpoints directly from your browser
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{category}</span>
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {expandedCategories.has(category) && (
                  <div className="bg-gray-50">
                    {categoryEndpoints.map((endpoint) => (
                      <button
                        key={endpoint.id}
                        onClick={() => {
                          setSelectedEndpoint(endpoint);
                          setParameters({});
                          setResponse(null);
                        }}
                        className={`w-full px-6 py-3 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                          selectedEndpoint?.id === endpoint.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {endpoint.path}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Details */}
        <div className="space-y-6">
          {selectedEndpoint ? (
            <>
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedEndpoint.path}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {selectedEndpoint.description}
                </p>

                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Parameters</h4>
                    {selectedEndpoint.parameters.map((param) => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={parameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          placeholder={param.description}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">{param.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={executeEndpoint}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </>
                    )}
                  </button>
                </div>
              </div>

              {response && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Code className="h-5 w-5 text-gray-500" />
                    <h4 className="text-lg font-medium text-gray-900">Response</h4>
                    <div className="flex items-center space-x-2">
                      {response.status >= 200 && response.status < 300 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        response.status >= 200 && response.status < 300 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {response.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(response.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Headers</h5>
                      <div className="bg-gray-50 rounded-md p-3">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Body</h5>
                      <div className="bg-gray-50 rounded-md p-3 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Endpoint</h3>
              <p className="text-sm text-gray-500">
                Choose an endpoint from the list to test it with custom parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiExplorer;