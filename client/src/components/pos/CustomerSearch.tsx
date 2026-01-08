import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, Plus, X, Star, Phone } from "lucide-react";
import { useLazyGetCustomerByPhoneQuery } from "@/api/customersApi";
import { Customer } from "@/types/customer.types";
import { CustomerQuickCreateModal } from "./CustomerQuickCreateModal";

interface CustomerSearchProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

export const CustomerSearch = ({
  selectedCustomer,
  onCustomerSelect,
}: CustomerSearchProps) => {
  const [phone, setPhone] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [searchCustomer, { data: searchResult, isFetching, isError }] =
    useLazyGetCustomerByPhoneQuery();

  // Debounced search
  const debouncedSearch = useCallback(
    (phoneNumber: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (phoneNumber.length >= 8) {
        setIsSearching(true);
        debounceRef.current = setTimeout(() => {
          searchCustomer(phoneNumber);
        }, 300);
      } else {
        setIsSearching(false);
      }
    },
    [searchCustomer]
  );

  useEffect(() => {
    debouncedSearch(phone);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [phone, debouncedSearch]);

  // Update searching state when fetch completes
  useEffect(() => {
    if (!isFetching) {
      setIsSearching(false);
    }
  }, [isFetching]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only numbers
    setPhone(value);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelect(customer);
    setPhone("");
  };

  const handleClearCustomer = () => {
    onCustomerSelect(null);
    setPhone("");
  };

  const handleCreateSuccess = (customer: Customer) => {
    onCustomerSelect(customer);
    setShowCreateModal(false);
    setPhone("");
  };

  const showNotFound =
    phone.length >= 8 && !isFetching && !isSearching && (isError || !searchResult?.data);
  const showResult =
    phone.length >= 8 && !isFetching && !isSearching && searchResult?.data;

  // If customer is selected, show the selected customer card
  if (selectedCustomer) {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {selectedCustomer.name || "عميل"}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {selectedCustomer.phone}
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Star className="w-3 h-3 fill-current" />
                  {selectedCustomer.loyaltyPoints} نقطة
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearCustomer}
            className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-full transition-colors"
            title="إزالة العميل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="🔍 رقم الهاتف..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          dir="ltr"
        />
        {(isFetching || isSearching) && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Result - Customer Found */}
      {showResult && searchResult.data && (
        <div
          onClick={() => handleSelectCustomer(searchResult.data!)}
          className="mt-2 bg-success-50 border border-success-200 rounded-lg p-3 cursor-pointer hover:bg-success-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {searchResult.data.name || "عميل"}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{searchResult.data.phone}</span>
                  <span className="text-amber-600">
                    ⭐ {searchResult.data.loyaltyPoints} نقطة
                  </span>
                </p>
              </div>
            </div>
            <span className="text-xs text-success-600 font-medium">
              اضغط للاختيار
            </span>
          </div>
        </div>
      )}

      {/* Search Result - Not Found */}
      {showNotFound && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">لم يتم العثور على عميل</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              إضافة عميل جديد
            </button>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CustomerQuickCreateModal
          initialPhone={phone}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
