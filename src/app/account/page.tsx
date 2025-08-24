'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerContext } from '@/contexts/CustomerContext';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import CustomerAuth from '@/components/CustomerAuth';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, loading, update } = useCustomerContext();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    acceptsMarketing: false
  });
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsAuthOpen(true);
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        acceptsMarketing: customer.acceptsMarketing
      });
    }
  }, [customer]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage('');
    
    const result = await update(formData);
    
    if (result.success) {
      setUpdateMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setUpdateMessage(''), 3000);
    } else if (result.errors) {
      setUpdateMessage(result.errors[0].message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen pt-32">
          <CustomerAuth 
            isOpen={isAuthOpen}
            onClose={() => {
              setIsAuthOpen(false);
              router.push('/');
            }}
            redirectTo="/account"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <OldFashionedNavigation />
      
      <main className="min-h-screen pt-32">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
          <h1 className="font-cormorant text-4xl tracking-[0.15em] text-center mb-12">
            MY ACCOUNT
          </h1>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <nav className="space-y-4">
                <Link 
                  href="/account"
                  className="block py-2 px-4 text-sm tracking-[0.1em] bg-gold text-white"
                >
                  ACCOUNT DETAILS
                </Link>
                <Link 
                  href="/account/orders"
                  className="block py-2 px-4 text-sm tracking-[0.1em] text-gray-700 hover:text-gold transition-colors"
                >
                  ORDER HISTORY
                </Link>
                <Link 
                  href="/account/addresses"
                  className="block py-2 px-4 text-sm tracking-[0.1em] text-gray-700 hover:text-gold transition-colors"
                >
                  ADDRESSES
                </Link>
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white p-8 border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-cormorant text-2xl tracking-[0.1em]">
                    Account Details
                  </h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-sm tracking-[0.1em] text-gold hover:underline"
                    >
                      EDIT
                    </button>
                  )}
                </div>

                {updateMessage && (
                  <div className={`mb-4 p-3 text-sm ${
                    updateMessage.includes('success') 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {updateMessage}
                  </div>
                )}

                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        value={customer?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                        PHONE
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="acceptsMarketing"
                        checked={formData.acceptsMarketing}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="tracking-[0.1em]">
                        Receive exclusive offers and event updates
                      </span>
                    </label>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold text-white text-sm tracking-[0.1em] hover:bg-gold/90 transition-colors"
                      >
                        SAVE CHANGES
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-sm tracking-[0.1em] hover:border-gray-400 transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs tracking-[0.1em] text-gray-600 mb-1">NAME</p>
                      <p className="text-gray-900">
                        {customer?.firstName || customer?.lastName 
                          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs tracking-[0.1em] text-gray-600 mb-1">EMAIL</p>
                      <p className="text-gray-900">{customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-[0.1em] text-gray-600 mb-1">PHONE</p>
                      <p className="text-gray-900">{customer?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-[0.1em] text-gray-600 mb-1">MARKETING PREFERENCES</p>
                      <p className="text-gray-900">
                        {customer?.acceptsMarketing 
                          ? 'Subscribed to marketing emails' 
                          : 'Not subscribed to marketing emails'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}