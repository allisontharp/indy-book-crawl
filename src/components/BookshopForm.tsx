'use client';

import { useState, useEffect } from 'react';
import { Bookshop, DayOfWeek, ShopHours, } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import AddressAutocomplete from './AddressAutocomplete';

/*
TODO: 
- add categories 
- add website 
- add social links
- shop hours should be start/end
*/

interface BookshopFormProps {
  initialData?: Partial<Bookshop>;
  onSubmit: (data: Partial<Bookshop>) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  showCancelButton?: boolean;
  isAdmin?: boolean;
}

export default function BookshopForm({
  initialData,
  onSubmit,
  onCancel,
  submitText = 'Submit Bookshop',
  showCancelButton = false,
  isAdmin = false,
}: BookshopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [addressData, setAddressData] = useState({
    location: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0
  });

  const [hours, setHours] = useState<ShopHours[]>(
    initialData?.hours ? initialData.hours.map(time => ({
      ...time,
      openTime: time.openTime || '',
      closeTime: time.closeTime || ''
    })) : [
      {
        id: uuidv4(),
        dayOfWeek: DayOfWeek.MONDAY,
        openTime: '',
        closeTime: ''
      }
    ]
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    hours: initialData?.hours || [],
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    website: initialData?.website || '',
    categories: initialData?.categories || [],
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    twitter: initialData?.twitter || '',
  });

  // Update formData when addressData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: addressData.location,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    }));
  }, [addressData]);

  const handleAddressSelect = (data: typeof addressData) => {
    setAddressData(data);
    // Update formData with the new location data
    setFormData(prev => ({
      ...prev,
      name: data.location,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      await onSubmit({
        ...formData,
      });
    } catch (err) {
      setFormError('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTime = () => {
    setHours([
      ...hours,
      {
        id: uuidv4(),
        dayOfWeek: DayOfWeek.MONDAY,
        openTime: '',
        closeTime: ''
      }
    ]);
  };

  const removeTime = (id: string) => {
    setHours(hours.filter(time => time.id !== id));
  };

  const updateTime = (id: string, updates: Partial<ShopHours>) => {
    setHours(hours.map(time =>
      time.id === id ? { ...time, ...updates } : time
    ));
  };

  return (
    <div className={isAdmin ? '' : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
      {formError && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl">
        <div>
          <label htmlFor="location" className="block text-lg font-medium text-gray-200">
            Bookshop *
          </label>
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            defaultLocation={formData.name}
            initialAddressData={addressData}
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-lg font-medium text-gray-200">
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            value={addressData.address}
            onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2">
            <label htmlFor="city" className="block text-lg font-medium text-gray-200">
              City *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={addressData.city}
              onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-lg font-medium text-gray-200">
              State
            </label>
            <input
              type="text"
              name="state"
              id="state"
              value={addressData.state}
              onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-lg font-medium text-gray-200">
              ZIP Code *
            </label>
            <input
              type="text"
              name="zipCode"
              id="zipCode"
              required
              pattern="[0-9]{5}"
              value={addressData.zipCode}
              onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-lg font-medium text-gray-200">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your event..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-200">Operating Hours</h3>
            <button
              type="button"
              onClick={addTime}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Hours
            </button>
          </div>

          {hours.map((time, index) => (
            <div key={time.id} className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-lg">
              <div className="w-40">
                <select
                  value={time.dayOfWeek}
                  onChange={(e) => updateTime(time.id, { dayOfWeek: e.target.value as DayOfWeek })}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(DayOfWeek).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={time.openTime}
                  onChange={(e) => updateTime(time.id, { openTime: e.target.value })}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />

                <input
                  type="time"
                  value={time.closeTime}
                  onChange={(e) => updateTime(time.id, { closeTime: e.target.value })}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {hours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTime(time.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 rounded-md bg-red-900/30 hover:bg-red-900/50 transition-colors"
                  aria-label="Remove time"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">Social Links</h3>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-300">
              Instagram URL
            </label>
            <input
              type="url"
              name="instagram"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.instagram.com/yourusername"
            />
          </div>

          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-300">
              Facebook URL
            </label>
            <input
              type="url"
              name="facebook"
              id="facebook"
              value={formData.facebook}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.facebook.com/yourpage"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-300">
              Twitter URL
            </label>
            <input
              type="url"
              name="twitter"
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://twitter.com/yourusername"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-lg font-medium text-gray-200">
            Website
          </label>
          <input
            type="url"
            name="website"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.example.com"
          />
        </div>

        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            {showCancelButton && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none px-4 py-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : submitText}
            </button>
          </div>

          {!isAdmin && (
            <p className="text-base text-gray-400 mt-6">
              * Required fields. Submitted shows will be reviewed before appearing on the site.
            </p>
          )}
        </div>
      </form >
    </div >
  );
}