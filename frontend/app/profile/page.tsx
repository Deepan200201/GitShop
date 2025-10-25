"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchMe, updateProfile, fetchOrders, deleteAccount } from "@/lib/api";
import { PhoneInput } from "@/components/PhoneInput";
import { AddressForm } from "@/components/AddressForm";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [orderPage, setOrderPage] = useState(1);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetchMe(token).catch(e => console.error(e)),
            fetchOrders(token, orderPage, 5).catch(e => console.error(e))
        ]).then(([profileData, ordersData]) => {
            if (profileData) {
                setProfile(profileData);
                setFormData({
                    ...profileData,
                    address_details: profileData.address_details || {}
                });
            }
            if (ordersData) setOrders(ordersData);
        }).finally(() => {
            setLoading(false);
        });
    }, [token, orderPage]);

    if (authLoading) return <div>Loading...</div>;

    if (!user) {
        if (typeof window !== 'undefined') router.push("/login");
        return null;
    }

    if (loading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    const displayUser = profile || user;
    if (!displayUser) return null;

    const handleSave = async () => {
        if (!token) return;
        try {
            const updated = await updateProfile(token, formData);
            setProfile(updated);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert("Failed to update profile");
        }
    };

    const isSeller = displayUser.role === 'seller';

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        if (!token) return;
        try {
            await deleteAccount(token);
            logout();
            router.push("/");
        } catch (e) {
            console.error(e);
            alert("Failed to delete account");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            <Card className="bg-card/85 backdrop-blur-md border border-border/50">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl">User Profile</CardTitle>
                        <CardDescription>Manage your account settings and preferences.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(isSeller ? "/dashboard" : "/")}>Home</Button>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.full_name || ""}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg font-medium">{displayUser.full_name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <p className="text-lg font-medium text-muted-foreground">{displayUser.email}</p>
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            {isEditing ? (
                                <PhoneInput
                                    value={formData.phone_number || ""}
                                    onChange={(val) => setFormData({ ...formData, phone_number: val })}
                                />
                            ) : (
                                <div>
                                    <Label>Phone Number</Label>
                                    <p className="text-lg font-medium">{displayUser.phone_number || <span className="text-muted-foreground italic">Not provided</span>}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label className="text-base font-semibold">Address Details</Label>
                            {isEditing ? (
                                <AddressForm
                                    value={formData.address_details || {}}
                                    onChange={(addr) => setFormData({ ...formData, address_details: addr })}
                                />
                            ) : (
                                <div className="bg-muted/40 p-4 rounded-md border border-border/40">
                                    {displayUser.address_details ? (
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p><span className="text-muted-foreground">Flat/House:</span> {displayUser.address_details.flat_no}</p>
                                            <p><span className="text-muted-foreground">Street:</span> {displayUser.address_details.street_name}</p>
                                            <p><span className="text-muted-foreground">City:</span> {displayUser.address_details.city}</p>
                                            <p><span className="text-muted-foreground">Pincode:</span> {displayUser.address_details.pincode}</p>
                                            <p><span className="text-muted-foreground">Country:</span> {displayUser.address_details.country}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No detailed address provided.</p>
                                    )}
                                    {displayUser.address && !displayUser.address_details && (
                                        <p className="mt-2 text-sm text-muted-foreground">Legacy Address: {displayUser.address}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {isSeller && (
                            <div className="col-span-2 space-y-4 border-t border-border/50 pt-4 mt-2">
                                <h3 className="text-lg font-semibold">Merchant Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Business Name</Label>
                                        {isEditing ? (
                                            <Input value={formData.business_name || ""} onChange={e => setFormData({ ...formData, business_name: e.target.value })} />
                                        ) : <p className="font-medium">{displayUser.business_name || "-"}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>GSTIN</Label>
                                        {isEditing ? (
                                            <Input value={formData.gstin || ""} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                                        ) : <p className="font-medium">{displayUser.gstin || "-"}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bank Account</Label>
                                        {isEditing ? (
                                            <Input value={formData.bank_account_number || ""} onChange={e => setFormData({ ...formData, bank_account_number: e.target.value })} />
                                        ) : <p className="font-medium">{displayUser.bank_account_number || "-"}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IFSC Code</Label>
                                        {isEditing ? (
                                            <Input value={formData.ifsc_code || ""} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} />
                                        ) : <p className="font-medium">{displayUser.ifsc_code || "-"}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Member Since</Label>
                            <p className="text-lg font-medium">{displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <p className="text-lg font-medium capitalize">{displayUser.role}</p>
                        </div>

                    </div>

                    <div className="pt-6 border-t border-border/50 flex justify-between gap-2">
                        {isEditing ? (
                            <div className="flex gap-2 justify-end w-full">
                                <Button variant="ghost" onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        ...profile,
                                        address_details: profile.address_details || {}
                                    });
                                }}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </div>
                        ) : (
                            <>
                                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                                <Button variant="outline" onClick={logout}>Sign Out</Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!isSeller && (
                <Card className="mt-8 bg-card/85 backdrop-blur-md border border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading orders...</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <p className="text-muted-foreground py-8 text-center">No orders found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border border-border/50 rounded-lg p-4 bg-muted/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">${order.total_amount}</p>
                                                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                                            Global: {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t border-border/50 pt-4">
                                                    <h4 className="text-sm font-semibold mb-2">Items</h4>
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm py-1">
                                                            <span>{item.product_name} x{item.quantity}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span>${item.price_at_purchase}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                                            ${item.status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                                        'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                                                                    {item.status ? item.status.toUpperCase() : 'PENDING'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-4">
                                    <Button
                                        variant="outline"
                                        disabled={orderPage === 1}
                                        onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                                    >
                                        Back
                                    </Button>
                                    <span className="text-sm">Page {orderPage}</span>
                                    <Button
                                        variant="outline"
                                        disabled={orders.length < 5}
                                        onClick={() => setOrderPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
