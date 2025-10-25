"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Address {
    flat_no?: string;
    street_name?: string;
    city?: string;
    pincode?: string;
    country?: string;
}

interface AddressFormProps {
    value: Address;
    onChange: (address: Address) => void;
    disabled?: boolean;
}

export function AddressForm({ value, onChange, disabled }: AddressFormProps) {
    const handleChange = (field: keyof Address, val: string) => {
        onChange({ ...value, [field]: val });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Flat/House No.</Label>
                <Input
                    value={value?.flat_no || ""}
                    onChange={(e) => handleChange("flat_no", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. 101, Apt 4B"
                />
            </div>
            <div className="space-y-2">
                <Label>Street Name</Label>
                <Input
                    value={value?.street_name || ""}
                    onChange={(e) => handleChange("street_name", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. MG Road, 5th Avenue"
                />
            </div>
            <div className="space-y-2">
                <Label>City</Label>
                <Input
                    value={value?.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. Bangalore, New York"
                />
            </div>
            <div className="space-y-2">
                <Label>Pincode/Zip</Label>
                <Input
                    value={value?.pincode || ""}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. 560001, 10001"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Country</Label>
                <Input
                    value={value?.country || ""}
                    onChange={(e) => handleChange("country", e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. India, USA"
                />
            </div>
        </div>
    );
}
