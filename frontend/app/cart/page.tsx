"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCart, updateCartItem, deleteCartItem, checkout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";


export default function CartPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        if (!token) return;
        loadCart();
    }, [token]);

    async function loadCart() {
        try {
            const data = await fetchCart(token!);
            setCart(data);
        } catch (e) {
            console.error("Failed to load cart", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateQuantity(productId: string, newQuantity: number) {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(token!, productId, newQuantity);
            loadCart();
        } catch (e) {
            console.error("Failed to update quantity", e);
            alert("Failed to update quantity");
        }
    }

    async function handleRemoveItem(productId: string) {
        if (!confirm("Remove this item?")) return;
        try {
            await deleteCartItem(token!, productId);
            loadCart();
        } catch (e) {
            console.error("Failed to remove item", e);
        }
    }

    async function handleCheckout() {
        if (!cart || cart.items.length === 0) return;
        if (!confirm(`Proceed to checkout for $${cart.total}?`)) return;

        setCheckingOut(true);
        try {
            const order = await checkout(token!);
            // alert("Order placed successfully!"); // Removed alert, better UX is direct redirection
            router.push(`/orders/${order.id}`);
        } catch (e: any) {
            console.error("Checkout failed", e);
            alert(e.message || "Checkout failed");
        } finally {
            setCheckingOut(false);
        }
    }

    if (loading) return <div className="p-10 text-center">Loading cart...</div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <ShoppingCart className="h-16 w-16 text-gray-300" />
                <h1 className="text-2xl font-semibold text-gray-600">Your cart is empty</h1>
                <Button onClick={() => router.push("/")}>Continue Shopping</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl cursor-default">
            <h1 className="text-3xl font-bold mb-8 text-foreground drop-shadow-sm">Shopping Cart</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {cart.items?.map((item: any) => (
                        <Card key={item.product_id} className="bg-card/80 backdrop-blur-sm border-primary/10 overflow-hidden group hover:border-primary/30 transition-all">
                            <CardContent className="p-4 flex gap-4 items-center">
                                {/* Placeholder for image if available */}
                                <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <ShoppingCart className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate text-foreground">{item.product_name}</h3>
                                    <p className="text-muted-foreground text-sm">${Number(item.price || 0).toFixed(2)}</p>
                                </div>

                                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background rounded-md text-foreground"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background rounded-md text-foreground"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="text-right min-w-[80px]">
                                    <p className="font-bold text-lg text-primary">${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-0 h-auto mt-1 px-2 py-1 text-xs"
                                        onClick={() => handleRemoveItem(item.product_id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-lg sticky top-24">
                        <CardHeader className="bg-muted/20 pb-4">
                            <CardTitle className="text-foreground">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${Number(cart.total || 0).toFixed(2)}</span>
                            </div>
                            <hr className="my-2 border-border/50" />
                            <div className="flex justify-between font-bold text-xl text-foreground">
                                <span>Total</span>
                                <span className="text-primary">${Number(cart.total || 0).toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 pt-4">
                            <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20" size="lg" onClick={handleCheckout} disabled={checkingOut}>
                                {checkingOut ? "Processing..." : "Checkout"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
