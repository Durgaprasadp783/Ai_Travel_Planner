"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/api';

interface LocationAutocompleteProps {
    value?: string;
    onChange?: (value: string) => void;
    onSelectLocation?: (location: { name: string; coordinates: [number, number] }) => void;
    placeholder?: string;
    prefix?: React.ReactNode;
    className?: string;
}

export default function LocationAutocomplete({
    value,
    onChange,
    onSelectLocation,
    placeholder,
    prefix,
    className
}: LocationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            // Using the backend maps/places endpoint we saw earlier
            const data = await apiRequest(`/maps/places?query=${encodeURIComponent(query)}`, { method: 'GET' });
            setSuggestions(Array.isArray(data) ? data : []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Geocoding fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (onChange) onChange(val);

        // Debounce search
        const timeoutId = setTimeout(() => fetchSuggestions(val), 500);
        return () => clearTimeout(timeoutId);
    };

    const handleSelect = (suggestion: any) => {
        const name = suggestion.name + (suggestion.address ? `, ${suggestion.address}` : "");
        setInputValue(name);
        setSuggestions([]);
        setShowSuggestions(false);

        if (onChange) onChange(name);
        if (onSelectLocation) {
            onSelectLocation({
                name,
                coordinates: [suggestion.location.lng, suggestion.location.lat]
            });
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        {prefix}
                    </span>
                )}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder={placeholder}
                    className={`${className} w-full pl-10 pr-4 outline-none transition-all`}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[9999] w-full mt-2 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-3 hover:bg-[#ff4d4f] cursor-pointer transition-colors border-b border-white/5 last:border-none"
                        >
                            <div className="text-white font-medium">{item.name}</div>
                            {item.address && <div className="text-xs text-white/60 truncate">{item.address}</div>}
                        </div>
                    ))}
                </div>
            )}

            {loading && showSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#ff4d4f] border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
