import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WalmartConnection from '../Walmart/WalmartConnection';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setStats({
      totalProducts: 156,
      activeListings: 142,
      totalRevenue: 45678.90,
      pendingOrders: 23
    });
  }, []);

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Active Listings',
      value: stats.activeListings,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+23%',
      changeType: 'increase'
    },
    {
      name: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-5%',
      changeType: 'decrease'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      message: 'New order received for SKU-001',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Low inventory alert for SKU-045',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'listing',
      message: 'Product listing approved for SKU-123',
      time: '1 hour ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'error',
      message: 'Failed to sync inventory for SKU-089',
      time: '2 hours ago',
      status: 'error'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.first_name || 'Seller'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`self-center flex-shrink-0 h-4 w-4 ${
                            stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500 transform rotate-180'
                          }`} />
                          <span className="sr-only">
                            {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                          </span>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Walmart Connection */}
        <div className="lg:col-span-2">
          <WalmartConnection />
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                            {activity.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.message}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <Package className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Add Product
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new product listing
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ShoppingCart className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Orders
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check recent orders
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View performance metrics
                </p>
              </div>
            </button>

            <button className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                  <AlertCircle className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Support
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get help and support
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;