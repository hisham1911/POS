import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import {
  useGetCurrentBalanceQuery,
  useGetTransactionsQuery,
  useDepositMutation,
  useWithdrawMutation,
} from '../../api/cashRegisterApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import type { CashRegisterTransactionType } from '../../types/cashRegister.types';

export function CashRegisterDashboard() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');

  const { data: balanceResponse, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetCurrentBalanceQuery();
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useGetTransactionsQuery({
    pageNumber: 1,
    pageSize: 10,
  });
  const [deposit, { isLoading: isDepositing }] = useDepositMutation();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();

  const balance = balanceResponse?.data;
  const transactions = transactionsResponse?.data?.items || [];

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!depositDescription.trim()) {
      alert('يرجى إدخال وصف للإيداع');
      return;
    }

    try {
      await deposit({
        amount,
        description: depositDescription,
      }).unwrap();
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositDescription('');
      refetchBalance();
    } catch (error) {
      console.error('Failed to deposit:', error);
      alert('حدث خطأ أثناء الإيداع');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!withdrawDescription.trim()) {
      alert('يرجى إدخال وصف للسحب');
      return;
    }

    try {
      await withdraw({
        amount,
        description: withdrawDescription,
      }).unwrap();
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawDescription('');
      refetchBalance();
    } catch (error) {
      console.error('Failed to withdraw:', error);
      alert('حدث خطأ أثناء السحب');
    }
  };

  const getTransactionTypeLabel = (type: CashRegisterTransactionType) => {
    const labels: Record<CashRegisterTransactionType, string> = {
      Opening: 'فتح وردية',
      Deposit: 'إيداع',
      Withdrawal: 'سحب',
      Sale: 'مبيعات',
      Refund: 'مرتجع',
      Expense: 'مصروف',
      SupplierPayment: 'دفع لمورد',
      Adjustment: 'تسوية',
      Transfer: 'تحويل',
    };
    return labels[type];
  };

  const getTransactionTypeColor = (type: CashRegisterTransactionType) => {
    const colors: Record<CashRegisterTransactionType, string> = {
      Opening: 'text-blue-600',
      Deposit: 'text-green-600',
      Withdrawal: 'text-red-600',
      Sale: 'text-green-600',
      Refund: 'text-red-600',
      Expense: 'text-red-600',
      SupplierPayment: 'text-red-600',
      Adjustment: 'text-yellow-600',
      Transfer: 'text-purple-600',
    };
    return colors[type];
  };

  if (isLoadingBalance) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الخزينة</h1>
          <p className="text-gray-600 mt-1">إدارة الخزينة والمعاملات النقدية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" onClick={() => setShowDepositModal(true)}>
            <ArrowUpCircle className="w-4 h-4 ml-2" />
            إيداع
          </Button>
          <Button variant="danger" onClick={() => setShowWithdrawModal(true)}>
            <ArrowDownCircle className="w-4 h-4 ml-2" />
            سحب
          </Button>
          <Button variant="outline" onClick={() => refetchBalance()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-sm font-medium text-gray-600 mb-2">الرصيد الحالي</h2>
          <p className="text-4xl font-bold text-gray-900">{balance?.currentBalance.toFixed(2)} جنيه</p>
          {balance?.lastTransactionDate && (
            <p className="text-sm text-gray-500 mt-2">
              آخر معاملة: {new Date(balance.lastTransactionDate).toLocaleString('ar-EG')}
            </p>
          )}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">آخر المعاملات</h3>
          <a href="/cash-register/transactions" className="text-blue-600 hover:text-blue-800 text-sm">
            عرض الكل
          </a>
        </div>

        {isLoadingTransactions ? (
          <Loading />
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">لا توجد معاملات</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.amount >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {getTransactionTypeLabel(transaction.type)}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p
                    className={`text-lg font-bold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    {transaction.amount.toFixed(2)} جنيه
                  </p>
                  <p className="text-xs text-gray-500">
                    الرصيد: {transaction.balanceAfter.toFixed(2)} جنيه
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="إيداع نقدي">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المبلغ (جنيه) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف <span className="text-red-500">*</span>
            </label>
            <textarea
              value={depositDescription}
              onChange={(e) => setDepositDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="وصف الإيداع..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDepositModal(false)}>
              إلغاء
            </Button>
            <Button variant="success" onClick={handleDeposit} disabled={isDepositing}>
              {isDepositing ? 'جاري الإيداع...' : 'تأكيد الإيداع'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="سحب نقدي">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المبلغ (جنيه) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف <span className="text-red-500">*</span>
            </label>
            <textarea
              value={withdrawDescription}
              onChange={(e) => setWithdrawDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="وصف السحب..."
              required
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>الرصيد الحالي:</strong> {balance?.currentBalance.toFixed(2)} جنيه
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? 'جاري السحب...' : 'تأكيد السحب'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
