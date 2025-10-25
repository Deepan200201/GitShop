"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProducts, addToCart, getImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    seller_id: string;
    stock: number;
    category: string;
    images?: string[];
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 8; // Smaller limit to demonstrate pagination easily

    const { user, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        fetchProducts(page, LIMIT)
            .then(setProducts)
            .catch((err) => console.error(err))
            .finally(() => {
                setLoading(false);
                window.scrollTo(0, 0);
            });
    }, [page]);

    const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
        e.preventDefault(); // Prevent navigation if clicking button inside Link
        e.stopPropagation();

        if (!user || !token) {
            router.push("/login?redirect=/");
            return;
        }
        try {
            await addToCart(token, product);
            alert(`${product.name} added to cart!`);
        } catch (e) {
            alert("Failed to add to cart");
            console.error(e);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Hero / Filter Section */}
            <div className="flex space-x-4 mb-8">
                <Input
                    placeholder="Search products..."
                    className="max-w-md bg-background/50 border-primary/20 focus:border-primary backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-xl backdrop-blur-md border border-border/50">
                    No products found on this page.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                        <Link href={`/product/${p.id}`} key={p.id} className="block h-full">
                            <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-md border-primary/10 hover:border-primary/30">
                                <CardHeader className="p-0">
                                    <div className="aspect-square bg-muted w-full relative overflow-hidden rounded-t-lg">
                                        {/* Placeholder for real image - use first image if available */}
                                        {p.images && p.images.length > 0 ? (
                                            <img src={getImageUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                        {p.stock <= 0 && (
                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                                                <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pt-4 space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg line-clamp-1 text-card-foreground">{p.name}</CardTitle>
                                        <span className="font-bold text-lg text-primary">${p.price}</span>
                                    </div>
                                    <CardDescription className="line-clamp-2 text-muted-foreground">{p.description}</CardDescription>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md">Stock: {p.stock}</span>
                                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md">Seller: {p.seller_id.slice(0, 8)}...</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 pb-4">
                                    <Button
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                        onClick={(e) => handleAddToCart(e, p)}
                                        disabled={p.stock <= 0}
                                    >
                                        {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8 pt-4">
                <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-background/50 backdrop-blur-sm border-primary/20"
                >
                    Back
                </Button>
                <div className="text-sm font-medium text-foreground bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/10">
                    Page {page}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={products.length < LIMIT}
                    className="bg-background/50 backdrop-blur-sm border-primary/20"
                >
                    Next
                </Button>
            </div>
        </div >
    );
}
