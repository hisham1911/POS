import { Phone, Plus, Search, Star, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLazyGetCustomerByPhoneQuery } from "@/api/customersApi";
import type { Customer } from "@/types/customer.types";
import { formatNumber } from "@/utils/formatters";

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

  const [searchCustomer, { data: searchResult, isFetching, isError }] = useLazyGetCustomerByPhoneQuery();

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

  useEffect(() => {
    if (!isFetching) {
      setIsSearching(false);
    }
  }, [isFetching]);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "");
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

  const showNotFound = phone.length >= 8 && !isFetching && !isSearching && (isError || !searchResult?.data);
  const showResult = phone.length >= 8 && !isFetching && !isSearching && searchResult?.data;

  if (selectedCustomer) {
    return (
      <div className="feedback-panel mb-4" data-tone="info">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedCustomer.name || "عميل"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-numeric flex items-center gap-1" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {selectedCustomer.phone}
                </span>
                <span className="font-numeric flex items-center gap-1 text-warning">
                  <Star className="h-3 w-3 fill-current" />
                  {formatNumber(selectedCustomer.loyaltyPoints ?? 0)} نقطة
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearCustomer}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            title="إزالة العميل"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="group relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="🔍 رقم الهاتف..."
          className="font-numeric w-full rounded-2xl border border-border bg-card/82 py-2.5 pl-4 pr-10 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          dir="ltr"
        />
        {isFetching || isSearching ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : null}
      </div>

      {showResult && searchResult.data ? (
        <div
          onClick={() => handleSelectCustomer(searchResult.data)}
          className="surface-outline mt-2 cursor-pointer rounded-2xl border-success/24 bg-success/8 p-3 transition-colors hover:bg-success/12"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">{searchResult.data.name || "عميل"}</p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-numeric" dir="ltr">{searchResult.data.phone}</span>
                  <span className="font-numeric text-warning">⭐ {formatNumber(searchResult.data.loyaltyPoints ?? 0)} نقطة</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-success">اضغط للاختيار</span>
          </div>
        </div>
      ) : null}

      {showNotFound ? (
        <div className="surface-outline mt-2 rounded-2xl border-dashed p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">لم يتم العثور على عميل</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
            >
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </button>
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <CustomerQuickCreateModal
          initialPhone={phone}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      ) : null}
    </div>
  );
};
