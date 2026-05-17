import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("Please agree to the terms to proceed.");
      return;
    }
    alert("Checkout strictly simulates success!");
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h2>
          <p className="mt-2 text-sm text-gray-500">Review your order and accept user agreements.</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Order Summary */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
                    Pro
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Professional License</h4>
                    <p className="text-xs text-gray-500 mt-1">Billed annually</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">$299.00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-100 mt-2">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">$299.00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-semibold text-gray-900">$299.00</span>
              </div>
            </div>

            {/* Payment & Legal Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Simulated Payment fields */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Payment Details</h3>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 border p-2.5 outline-none transition-colors"
                      placeholder="Card number"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 border p-2.5 outline-none transition-colors"
                      placeholder="MM / YY"
                      disabled
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 border p-2.5 outline-none transition-colors"
                      placeholder="CVC"
                      disabled
                    />
                  </div>
                </div>

                {/* Legal Checkboxes */}
                <div className="pt-4 space-y-4">
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                        Terms of Service
                      </label>
                      <p className="text-gray-500 text-xs mt-1">
                        I agree to the Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!agreedToTerms}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all
                      ${agreedToTerms ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-300 cursor-not-allowed'}
                    `}
                  >
                    Complete Checkout
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center">
                    <Lock className="w-3 h-3 mr-1" /> All transactions are secure and encrypted.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
