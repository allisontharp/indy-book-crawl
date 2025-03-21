'use client';

import { useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface SocialLinks {
    instagram?: string;
    facebook?: string;
    twitter?: string;
}

interface OperatingHours {
    day: string;
    open: string;
    close: string;
}

interface Event {
    title: string;
    description: string;
    date: string;
    time: string;
}

interface AddressData {
    location: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
}

export default function AdminPage() {
    const [name, setName] = useState('');
    const [addressData, setAddressData] = useState<AddressData>({
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        latitude: 0,
        longitude: 0
    });
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [socials, setSocials] = useState<SocialLinks>({});
    const [hours, setHours] = useState<OperatingHours[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const addHours = () => {
        setHours([...hours, { day: daysOfWeek[0], open: '09:00', close: '17:00' }]);
    };

    const updateHours = (index: number, field: keyof OperatingHours, value: string) => {
        const newHours = [...hours];
        newHours[index] = { ...newHours[index], [field]: value };
        setHours(newHours);
    };

    const removeHours = (index: number) => {
        setHours(hours.filter((_, i) => i !== index));
    };

    const addEvent = () => {
        setEvents([...events, { title: '', description: '', date: '', time: '' }]);
    };

    const updateEvent = (index: number, field: keyof Event, value: string) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEvents(newEvents);
    };

    const removeEvent = (index: number) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('API URL not configured');
            }

            const response = await fetch(`${apiUrl}bookstores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Add authorization header once Cognito is set up
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    address: {
                        street: addressData.address,
                        city: addressData.city,
                        state: addressData.state,
                        zip: addressData.zipCode,
                        latitude: addressData.latitude,
                        longitude: addressData.longitude
                    },
                    website,
                    description,
                    categories,
                    socials,
                    operatingHours: hours,
                    events,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit bookstore');
            }

            // Reset form
            setName('');
            setAddressData({
                location: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                latitude: 0,
                longitude: 0
            });
            setWebsite('');
            setDescription('');
            setCategories([]);
            setSocials({});
            setHours([]);
            setEvents([]);

            alert('Bookstore added successfully!');
        } catch (error) {
            console.error('Error submitting bookstore:', error);
            alert('Failed to add bookstore. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Add New Bookstore</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    {/* Name & Address */}
                    <div>
                        <label className="block text-lg font-medium">Name *</label>
                        <AddressAutocomplete
                            onAddressSelect={(data) => {
                                setAddressData(data);
                                setName(data.location);
                            }}
                            defaultLocation={name || addressData.location}
                            initialAddressData={addressData}
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-lg font-medium">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            required
                            value={addressData.address}
                            onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="col-span-2">
                            <label htmlFor="city" className="block text-lg font-medium">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                required
                                value={addressData.city}
                                onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-lg font-medium">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                id="state"
                                value={addressData.state}
                                onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="zipCode" className="block text-lg font-medium">
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
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Categories</label>
                        <input
                            type="text"
                            value={categories.join(', ')}
                            onChange={(e) => setCategories(e.target.value.split(',').map(cat => cat.trim()))}
                            placeholder="Enter categories separated by commas"
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Instagram</label>
                                <input
                                    type="text"
                                    value={socials.instagram || ''}
                                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Facebook</label>
                                <input
                                    type="text"
                                    value={socials.facebook || ''}
                                    onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Twitter</label>
                                <input
                                    type="text"
                                    value={socials.twitter || ''}
                                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Operating Hours</h3>
                            <button
                                type="button"
                                onClick={addHours}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Add Hours
                            </button>
                        </div>
                        {hours.map((hour, index) => (
                            <div key={index} className="flex space-x-4 items-center">
                                <select
                                    value={hour.day}
                                    onChange={(e) => updateHours(index, 'day', e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    {daysOfWeek.map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="time"
                                    value={hour.open}
                                    onChange={(e) => updateHours(index, 'open', e.target.value)}
                                    className="p-2 border rounded"
                                />
                                <input
                                    type="time"
                                    value={hour.close}
                                    onChange={(e) => updateHours(index, 'close', e.target.value)}
                                    className="p-2 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeHours(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Events */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Events</h3>
                            <button
                                type="button"
                                onClick={addEvent}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Add Event
                            </button>
                        </div>
                        {events.map((event, index) => (
                            <div key={index} className="space-y-2 p-4 border rounded">
                                <input
                                    type="text"
                                    value={event.title}
                                    onChange={(e) => updateEvent(index, 'title', e.target.value)}
                                    placeholder="Event Title"
                                    className="w-full p-2 border rounded"
                                />
                                <textarea
                                    value={event.description}
                                    onChange={(e) => updateEvent(index, 'description', e.target.value)}
                                    placeholder="Event Description"
                                    className="w-full p-2 border rounded"
                                />
                                <div className="flex space-x-4">
                                    <input
                                        type="date"
                                        value={event.date}
                                        onChange={(e) => updateEvent(index, 'date', e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                    <input
                                        type="time"
                                        value={event.time}
                                        onChange={(e) => updateEvent(index, 'time', e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeEvent(index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Submitting...' : 'Add Bookstore'}
                </button>
            </form>
        </div>
    );
} 