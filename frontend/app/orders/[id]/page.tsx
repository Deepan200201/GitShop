"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchOrder, downloadInvoice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Download, CheckCircle, Package } from "lucide-react";

export default function OrderDetailsPage() {
    const { id } = useParams() as { id: string };
    const { token, user } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        // Slight delay to ensure data consistency if redirected immediately after placement
        const timer = setTimeout(() => {
            fetchOrder(token, id)
                .then(data => setOrder(data))
                .catch(err => {
                    console.error(err);
                    setError("Failed to load order details.");
                })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [token, id]);

    const handleDownloadInvoice = async () => {
        if (!token || !order) return;
        setDownloading(true);
        try {
            const blob = await downloadInvoice(token, order.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice_${order.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error(e);
            alert("Failed to download invoice.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading order details...</div>;

    if (error) return (
        <div className="p-12 text-center">
            <h2 className="text-xl text-red-600 mb-4">{error}</h2>
            <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
    );

    if (!order) return null;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <Button variant="ghost" onClick={() => router.push("/profile")} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
            </Button>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Order Placed Successfully!</h1>
                <p className="text-muted-foreground mt-2">Thank you for your purchase. Your order ID is {order.id}</p>
            </div>

            <Card className="mb-8 bg-card/85 backdrop-blur-md border border-border/50 shadow-lg">
                <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                    <div>
                        <CardTitle className="text-foreground">Order Summary</CardTitle>
                        <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center border border-border/50">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{item.product_name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-foreground">${Number(item.price_at_purchase || item.price || 0).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border/50 pt-4 space-y-2">
                        <div className="flex justify-between text-lg font-bold text-foreground">
                            <span>Total Amount</span>
                            <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-6 flex justify-between items-center border-t border-border/50">
                    <div>
                        <p className="font-medium text-foreground">Need an invoice?</p>
                        <p className="text-sm text-muted-foreground">Download the tax invoice for your records.</p>
                    </div>
                    <Button onClick={handleDownloadInvoice} disabled={downloading} variant="outline" className="border-primary/20 hover:bg-primary/5">
                        {downloading ? "Downloading..." : (
                            <>
                                <Download className="mr-2 h-4 w-4 text-primary" /> Download Invoice
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push("/")}>Continue Shopping</Button>
                <Button onClick={() => router.push("/profile")}>View All Orders</Button>
            </div>
        </div>
    );
}
