import React, { useEffect, useState, useRef, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface AddressComponentProps {
  onAddressSelect: (addressData: {
    location: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => void;
  defaultLocation?: string;
  initialAddressData?: {
    location: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
}

interface SearchResult {
  place_name: string;
  text: string;
  center: [number, number];
  properties: {
    address?: string;
    postalcode?: string;
    city?: string;
    state?: string;
  };
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultLocation = '',
  initialAddressData
}: AddressComponentProps) {
  const [inputValue, setInputValue] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentAddressData, setCurrentAddressData] = useState(initialAddressData || {
    location: defaultLocation,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: 0,
    longitude: 0
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update currentAddressData when initialAddressData changes
  useEffect(() => {
    if (initialAddressData) {
      setCurrentAddressData(initialAddressData);
    }
  }, [initialAddressData]);

  // Create a memoized search function that won't change between renders
  const searchAddress = useCallback(
    debounce(async (searchText: string) => {
      if (!searchText || searchText.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchText
          )}&countrycodes=us&limit=20&addressdetails=1`
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const formattedResults = data.map((item: any) => ({
          place_name: item.display_name,
          text: item.address?.road || item.address?.neighbourhood || '',
          center: [parseFloat(item.lon), parseFloat(item.lat)],
          properties: {
            address: item.address?.road ? `${item.address.house_number || ''} ${item.address.road}`.trim() : '',
            postalcode: item.address?.postcode,
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state
          }
        }));

        setSuggestions(formattedResults);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching address:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    [] // Empty dependency array since this function doesn't depend on any props or state
  );

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      searchAddress.cancel();
    };
  }, [searchAddress]);

  // Handle clicking outside of suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update the location field, preserving other address data
    const updatedData = {
      ...currentAddressData,
      location: value
    };
    setCurrentAddressData(updatedData);
    onAddressSelect(updatedData);

    // Only trigger search if we have enough characters
    if (value.length >= 3) {
      searchAddress(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (result: SearchResult) => {
    const selectedData = {
      location: result.place_name ?
        (result.place_name.includes(',') ? result.place_name.split(',')[0] : result.place_name)
        : result.text || 'Unknown Location',
      address: result.properties.address || '',
      city: result.properties.city || '',
      state: result.properties.state || '',
      zipCode: result.properties.postalcode || '',
      latitude: result.center[1],
      longitude: result.center[0]
    };

    setInputValue(selectedData.location);
    setShowSuggestions(false);
    setCurrentAddressData(selectedData);
    onAddressSelect(selectedData);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
        placeholder="Search for a venue..."
        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <ul className="py-1">
            {suggestions.map((result, index) => (
              <li
                key={index}
                onClick={() => handleSelectAddress(result)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 text-sm"
              >
                {result.place_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}