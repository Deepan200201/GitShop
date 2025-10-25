"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, ChangeEvent } from "react";

interface PhoneInputProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const COUNTRY_CODES = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA" },
    { code: "+44", country: "UK" },
    { code: "+81", country: "Japan" },
    { code: "+61", country: "Australia" },
    { code: "+86", country: "China" },
];

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
    const [countryCode, setCountryCode] = useState("+91");
    const [number, setNumber] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (value) {
            // Try to split existing value
            const matchedStart = COUNTRY_CODES.find(c => value.startsWith(c.code));
            if (matchedStart) {
                setCountryCode(matchedStart.code);
                setNumber(value.slice(matchedStart.code.length).trim());
            } else {
                setNumber(value);
            }
        }
    }, [value]);

    const handleNumberChange = (newNumber: string) => {
        // Allow only digits
        const cleaned = newNumber.replace(/\D/g, "");
        setNumber(cleaned);

        const fullNumber = `${countryCode}${cleaned}`;
        onChange(fullNumber);

        // Simple validation
        if (cleaned.length < 8 || cleaned.length > 15) {
            setError("Invalid phone number length");
        } else {
            setError(null);
        }
    };

    const handleCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setCountryCode(newCode);
        const fullNumber = `${newCode}${number}`;
        onChange(fullNumber);
    };

    return (
        <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="flex gap-2">
                <select
                    disabled={disabled}
                    value={countryCode}
                    onChange={handleCodeChange}
                    className="flex h-10 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code} ({c.country})
                        </option>
                    ))}
                </select>
                <Input
                    value={number}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    disabled={disabled}
                    placeholder="Enter phone number"
                    className="flex-1"
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
