import React, { useState, useEffect } from 'react';
import { Shipment } from '../../types';
import { 
  Truck, 
  Search, 
  Filter, 
  Eye,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const ShippingList: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    
    // Mock data
    const mockShipments: Shipment[] = [
      {
        id: '1',
        orderId: 'PO-2024-001',
        trackingNumber: '1Z999AA1234567890',
        carrier: 'UPS',
        status: 'in_transit',
        shippedDate: '2024-01-15T10:30:00Z',
        estimatedDelivery: '2024-01-18T17:00:00Z',
        shippingAddress: {
          name: 'John Smith',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        items: [
          {
            id: '1',
            sku: 'SKU-001',
            productName: 'Wireless Headphones',
            quantity: 1
          }
        ]
      },
      {
        id: '2',
        orderId: 'PO-2024-002',
        trackingNumber: '1Z999AA1234567891',
        carrier: 'FedEx',
        status: 'delivered',
        shippedDate: '2024-01-14T15:45:00Z',
        estimatedDelivery: '2024-01-17T12:00:00Z',
        actualDelivery: '2024-01-17T11:30:00Z',
        shippingAddress: {
          name: 'Sarah Johnson',
          address1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        },
        items: [
          {
            id: '2',
            sku: 'SKU-002',
            productName: 'Phone Case',
            quantity: 2
          }
        ]
      },
      {
        id: '3',
        orderId: 'PO-2024-003',
        trackingNumber: '1Z999AA1234567892',
        carrier: 'USPS',
        status: 'pending',
        shippedDate: '2024-01-16T09:15:00Z',
        estimatedDelivery: '2024-01-19T16:00:00Z',
        shippingAddress: {
          name: 'Mike Davis',
          address1: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'US'
        },
        items: [
          {
            id: '3',
            sku: 'SKU-003',
            productName: 'Bluetooth Speaker',
            quantity: 1
          }
        ]
      },
      {
        id: '4',
        orderId: 'PO-2024-004',
        trackingNumber: '1Z999AA1234567893',
        carrier: 'DHL',
        status: 'exception',
        shippedDate: '2024-01-13T14:20:00Z',
        estimatedDelivery: '2024-01-16T18:00:00Z',
        shippingAddress: {
          name: 'Emily Wilson',
          address1: '321 Elm St',
          city: 'Houston',
          state: 'TX',
          postalCode: '77001',
          country: 'US'
        },
        items: [
          {
            id: '4',
            sku: 'SKU-004',
            productName: 'Smart Watch',
            quantity: 1
          }
        ]
      },
      {
        id: '5',
        orderId: 'PO-2024-005',
        trackingNumber: '1Z999AA1234567894',
        carrier: 'UPS',
        status: 'in_transit',
        shippedDate: '2024-01-15T11:30:00Z',
        estimatedDelivery: '2024-01-18T14:00:00Z',
        shippingAddress: {
          name: 'David Brown',
          address1: '654 Maple Ave',
          city: 'Phoenix',
          state: 'AZ',
          postalCode: '85001',
          country: 'US'
        },
        items: [
          {
            id: '5',
            sku: 'SKU-005',
            productName: 'USB Cable',
            quantity: 1
          }
        ]
      }
    ];

    setTimeout(() => {
      setShipments(mockShipments);
      setLoading(false);
    }, 500);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      exception: 'bg-red-100 text-red-800',
    };

    const statusIcons = {
      pending: Clock,
      in_transit: Truck,
      delivered: CheckCircle,
      exception: AlertTriangle,
    };

    const statusLabels = {
      pending: 'Pending',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      exception: 'Exception',
    };

    const Icon = statusIcons[status as keyof typeof statusIcons];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const getCarrierLogo = (carrier: string) => {
    // In a real app, you would use actual carrier logos
    const colors = {
      'UPS': 'bg-yellow-600',
      'FedEx': 'bg-purple-600',
      'USPS': 'bg-blue-600',
      'DHL': 'bg-red-600',
    };

    return (
      <div className={`h-8 w-8 rounded-full ${colors[carrier as keyof typeof colors] || 'bg-gray-600'} flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">
          {carrier.substring(0, 2)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your shipments and deliveries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {shipments.filter(s => s.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Transit
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {shipments.filter(s => s.status === 'in_transit').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Delivered
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {shipments.filter(s => s.status === 'delivered').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Exceptions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {shipments.filter(s => s.status === 'exception').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="exception">Exception</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipped
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.trackingNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.items.length} item{shipment.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCarrierLogo(shipment.carrier)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {shipment.carrier}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {shipment.shippingAddress.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.shippingAddress.city}, {shipment.shippingAddress.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(shipment.shippedDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(shipment.estimatedDelivery), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(shipment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredShipments.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredShipments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredShipments.length === 0 && (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Shipments will appear here when orders are shipped.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingList;