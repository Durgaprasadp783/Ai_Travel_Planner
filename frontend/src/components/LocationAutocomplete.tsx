"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const AddressAutofill = dynamic(() => import('@mapbox/search-js-react').then(mod => mod.AddressAutofill), { ssr: false });

interface LocationAutocompleteProps {
    value?: string;
    onChange?: (value: string) => void;
    onSelectLocation?: (location: { name: string; coordinates: [number, number] }) => void;
    placeholder?: string;
    prefix?: React.ReactNode;
    className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function LocationAutocomplete({
    value,
    onChange,
    onSelectLocation,
    placeholder,
    prefix,
    className
}: LocationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    const handleRetrieve = (res: any) => {
        const feature = res.features[0];
        if (feature) {
            const name = feature.place_name;
            const coords = feature.geometry.coordinates; // [lng, lat]

            setInputValue(name);
            if (onChange) onChange(name);
            if (onSelectLocation) onSelectLocation({ name, coordinates: coords as [number, number] });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (onChange) onChange(val);
    };

    return (
        // We use a wrapper to position the prefix icon if needed, 
        // though typically AntD handles prefixes inside Input. 
        // Since we are replacing AntD Input with a native input wrapped by AddressAutofill,
        // we need to mimic the AntD input structure or just use the class.
        // The user wants .glass-effect on the input.
        <div className="relative w-full">
            {/* 
                AddressAutofill requires a child <input>. 
                We apply the passed className (which contains .glass-effect) to this input.
            */}
            <AddressAutofill accessToken={MAPBOX_TOKEN} onRetrieve={handleRetrieve}>
                <div className="relative">
                    {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            {prefix}
                        </span>
                    )}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={`${className} w-full pl-10 pr-4 outline-none transition-all`}
                        autoComplete="shipping address-level2"
                    />
                </div>
            </AddressAutofill>
        </div>
    );
}
