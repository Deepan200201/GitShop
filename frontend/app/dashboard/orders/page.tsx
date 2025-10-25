"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Assuming this context exists and provided user info
import { fetchMerchantOrders, updateOrderItemStatus } from "@/lib/api";
import { useRouter } from "next/navigation";


export default function MerchantOrdersPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== "seller")) {
            router.push("/");
            return;
        }

        if (token && user?.role === "seller") {
            loadOrders();
        }
    }, [user, token, loading, router]);

    const loadOrders = async () => {
        try {
            const data = await fetchMerchantOrders(token!);
            setOrders(data);
        } catch (e) {
            console.error("Failed to load orders", e);
            setFetchError("Failed to load orders");
        }
    };

    const handleStatusUpdate = async (orderId: string, productId: string, newStatus: string) => {
        setUpdating(`${orderId}-${productId}`);
        try {
            await updateOrderItemStatus(token!, orderId, productId, newStatus);
            // Refresh logic: Optimistically update local state or reload
            setOrders(prev => prev.map(order => {
                if (order.id !== orderId) return order;
                return {
                    ...order,
                    items: order.items.map((item: any) => {
                        if (item.product_id === productId) {
                            return { ...item, status: newStatus };
                        }
                        return item;
                    })
                };
            }));
        } catch (e: any) {
            alert(e.message || "Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user || user.role !== "seller") return <div className="p-8">Access Denied</div>;

    const STATUS_OPTIONS = [
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "packing", label: "Packing" },
        { value: "out_for_delivery", label: "Out for Delivery" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Merchant Order Dashboard</h1>

            {fetchError && (
                <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded mb-4">
                    {fetchError}
                </div>
            )}

            {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders received yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-border/50 rounded-lg shadow-sm bg-card/85 backdrop-blur-md overflow-hidden">
                            <div className="bg-muted/40 p-4 border-b border-border/50 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-semibold">Order ID:</span> {order.id.slice(0, 8)}...
                                    <span className="mx-2 text-muted-foreground">|</span>
                                    <span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="font-semibold">Customer ID:</span> {order.user_id.slice(0, 8)}...
                                </div>
                            </div>

                            <div className="p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground border-b border-border/50">
                                            <th className="py-2">Product</th>
                                            <th className="py-2">Qty</th>
                                            <th className="py-2">Price</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item: any) => {
                                            // Only show items belonging to this merchant
                                            if (item.seller_id !== user.id) return null;

                                            return (
                                                <tr key={item.product_id} className="border-b border-border/50 last:border-0">
                                                    <td className="py-3 font-medium">{item.product_name}</td>
                                                    <td className="py-3">{item.quantity}</td>
                                                    <td className="py-3">${item.price_at_purchase}</td>
                                                    <td className="py-3">
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                                                            ${item.status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                                item.status === 'cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                            {item.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <select
                                                            value={item.status}
                                                            disabled={updating === `${order.id}-${item.product_id}`}
                                                            onChange={(e) => handleStatusUpdate(order.id, item.product_id, e.target.value)}
                                                            className="text-sm border border-input rounded px-2 py-1 bg-background hover:bg-accent/50 text-foreground"
                                                        >
                                                            {STATUS_OPTIONS.map(opt => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {updating === `${order.id}-${item.product_id}` && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Updating...</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
