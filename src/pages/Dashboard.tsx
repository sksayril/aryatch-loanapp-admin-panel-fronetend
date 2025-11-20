import { useState, useEffect } from 'react';
import { categoriesApi, loansApi } from '../services/api';
import {
  TrendingUp,
  FolderTree,
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface Stats {
  totalCategories: number;
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  totalLoanAmount: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalLoanAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [categoriesData, loansData] = await Promise.all([
        categoriesApi.getAll(),
        loansApi.getAll(),
      ]);

      const loans = loansData.loans || [];
      const categories = categoriesData.categories || [];

      const activeLoans = loans.filter((l: any) => l.isActive).length;
      const pendingLoans = loans.filter((l: any) => l.status === 'pending').length;
      const approvedLoans = loans.filter((l: any) => l.status === 'approved').length;
      const rejectedLoans = loans.filter((l: any) => l.status === 'rejected').length;
      const totalLoanAmount = loans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);

      setStats({
        totalCategories: categories.length,
        totalLoans: loans.length,
        activeLoans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        totalLoanAmount,
      });

      setRecentActivity(loans.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Loans',
      value: stats.totalLoans,
      icon: Banknote,
      gradient: 'from-blue-600 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      icon: Activity,
      gradient: 'from-green-600 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: stats.pendingLoans,
      icon: Clock,
      gradient: 'from-amber-600 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Approved',
      value: stats.approvedLoans,
      icon: CheckCircle,
      gradient: 'from-emerald-600 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Rejected',
      value: stats.rejectedLoans,
      icon: XCircle,
      gradient: 'from-red-600 to-rose-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      gradient: 'from-violet-600 to-purple-500',
      bgColor: 'bg-violet-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your loan management system</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Total Loan Amount</p>
              <p className="text-xl font-bold">${stats.totalLoanAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${card.gradient}`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Loan Statistics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Approval Rate</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.totalLoans > 0
                  ? Math.round((stats.approvedLoans / stats.totalLoans) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Rejection Rate</span>
              <span className="text-2xl font-bold text-red-600">
                {stats.totalLoans > 0
                  ? Math.round((stats.rejectedLoans / stats.totalLoans) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Loan</span>
              <span className="text-2xl font-bold text-blue-600">
                ${stats.totalLoans > 0
                  ? Math.round(stats.totalLoanAmount / stats.totalLoans).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((loan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{loan.name || 'Loan Application'}</p>
                    <p className="text-sm text-gray-600">${loan.amount?.toLocaleString() || 0}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      loan.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : loan.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {loan.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
