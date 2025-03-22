'use client';

import { useState } from 'react';
import { Event } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface EventFormProps {
    events: Event[];
    onChange: (events: Event[]) => void;
}

export default function EventForm({ events, onChange }: EventFormProps) {
    const addEvent = () => {
        const newEvent: Event = {
            id: uuidv4(),
            title: '',
            description: '',
            date: '',
            time: '',
            endTime: ''
        };
        onChange([...events, newEvent]);
    };

    const removeEvent = (id: string) => {
        onChange(events.filter(event => event.id !== id));
    };

    const updateEvent = (id: string, updates: Partial<Event>) => {
        onChange(events.map(event =>
            event.id === id ? { ...event, ...updates } : event
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-200">Events</h3>
                <button
                    type="button"
                    onClick={addEvent}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Event
                </button>
            </div>

            {events.map((event) => (
                <div key={event.id} className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                    <div>
                        <input
                            type="text"
                            value={event.title}
                            onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                            placeholder="Event Title"
                            className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <textarea
                            value={event.description}
                            onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                            placeholder="Event Description"
                            rows={4}
                            className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 text-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <input
                                type="date"
                                value={event.date}
                                onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                                className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={event.time}
                                    onChange={(e) => updateEvent(event.id, { time: e.target.value })}
                                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={event.endTime}
                                    onChange={(e) => updateEvent(event.id, { endTime: e.target.value })}
                                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => removeEvent(event.id)}
                            className="text-red-400 hover:text-red-300 px-3 py-1 rounded-md bg-red-900/30 hover:bg-red-900/50 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 