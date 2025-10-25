"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchMerchantOrders, updateOrderItemStatus, uploadFile, Product, getImageUrl } from "@/lib/api";
import { Trash2, Edit, X } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    // Form State
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    // Images and Videos are arrays of URLs
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to load
        if (!user) {
            if (typeof window !== 'undefined') router.push("/login");
            return;
        }
        if (user.role !== "seller" && user.role !== "admin") {
            router.push("/");
            return;
        }
        if (token) {
            loadProducts();
            fetchMerchantOrders(token).then(setOrders).catch(console.error);
        }
    }, [user, token, router, authLoading]);

    const loadProducts = async () => {
        try {
            const allProducts = await fetchProducts(1, 100);
            if (user) {
                // Filter products by seller_id
                // API returns array directly
                const productList = Array.isArray(allProducts) ? allProducts : (allProducts.products || []);
                const myProducts = productList.filter((p: Product) => p.seller_id === user.id);
                setProducts(myProducts);
            }
        } catch (e) {
            console.error("Failed to load products", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (!e.target.files || e.target.files.length === 0 || !token) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const uploadedUrls: string[] = [];

        try {
            // Upload each file sequentially
            for (const file of files) {
                const res = await uploadFile(token, file);
                const apiUrlObj = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1");
                const fullUrl = `${apiUrlObj.origin}${res.url}`;
                uploadedUrls.push(fullUrl);
            }

            if (type === 'image') {
                setImages([...images, ...uploadedUrls]);
            } else {
                setVideos([...videos, ...uploadedUrls]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file(s)");
        } finally {
            setUploading(false);
            // Clear the input
            e.target.value = "";
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        const productData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            seller_id: user?.id,
            images,
            videos
        };

        try {
            if (editingProduct) {
                await updateProduct(token, editingProduct.id, productData);
                alert("Product updated!");
            } else {
                await createProduct(token, productData);
                alert("Product created!");
            }
            resetForm();
            loadProducts();
        } catch (e: any) {
            alert(e.message || "Operation failed");
            console.error(e);
        }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCategory(product.category);
        setImages(product.images || []);
        setVideos(product.videos || []);
    };

    const handleDelete = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        if (!token) return;
        try {
            await deleteProduct(token, productId);
            loadProducts();
        } catch (e) {
            alert("Failed to delete product");
        }
    };

    const handleStatusUpdate = async (orderId: string, productId: string, newStatus: string) => {
        if (!token) return;
        try {
            await updateOrderItemStatus(token, orderId, productId, newStatus);
            // Reload orders
            const updatedOrders = await fetchMerchantOrders(token);
            setOrders(updatedOrders);
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setCategory("");
        setImages([]);
        setVideos([]);
    };

    const removeMedia = (index: number, type: 'image' | 'video') => {
        if (type === 'image') {
            setImages(images.filter((_, i) => i !== index));
        } else {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You must be a seller to view this page.</p>
                <Button className="mt-4" onClick={() => router.push("/")}>Go Shop</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>

            {/* Product Management */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground">My Products</h2>
                    {editingProduct && (
                        <Button variant="outline" onClick={resetForm} className="border-destructive text-destructive hover:bg-destructive/10">
                            Cancel Edit
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="md:col-span-1">
                        <Card className="bg-card/90 backdrop-blur-md border-primary/20 sticky top-24">
                            <CardHeader className="bg-muted/20 pb-4">
                                <CardTitle className="text-foreground">{editingProduct ? "Edit Product" : "New Product"}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-foreground">Name</Label>
                                        <Input value={name} onChange={e => setName(e.target.value)} required className="bg-background/50" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-foreground">Description</Label>
                                        <Input value={description} onChange={e => setDescription(e.target.value)} required className="bg-background/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-foreground">Price ($)</Label>
                                            <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="bg-background/50" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-foreground">Stock</Label>
                                            <Input type="number" value={stock} onChange={e => setStock(e.target.value)} required className="bg-background/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-foreground">Category</Label>
                                        <Input value={category} onChange={e => setCategory(e.target.value)} required className="bg-background/50" />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-1">
                                        <Label className="text-foreground">Images</Label>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {images.map((url, i) => (
                                                    <div key={i} className="relative w-16 h-16 border border-border rounded overflow-hidden group">
                                                        <img src={getImageUrl(url)} alt="product" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedia(i, 'image')}
                                                            className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleFileUpload(e, 'image')}
                                                disabled={uploading}
                                                className="bg-background/50 file:text-foreground"
                                            />
                                            {uploading && <p className="text-xs text-primary animate-pulse">Uploading...</p>}
                                        </div>
                                    </div>

                                    {/* Video Upload */}
                                    <div className="space-y-1">
                                        <Label className="text-foreground">Videos</Label>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {videos.map((url, i) => (
                                                    <div key={i} className="relative w-16 h-16 border border-border rounded bg-muted flex items-center justify-center group">
                                                        <span className="text-xs text-muted-foreground">Video {i + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedia(i, 'video')}
                                                            className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Input
                                                type="file"
                                                accept="video/*"
                                                multiple
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                                disabled={uploading}
                                                className="bg-background/50 file:text-foreground"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={uploading}>
                                        {editingProduct ? "Update Product" : "Create Product"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Product List */}
                    <Card className="md:col-span-2 bg-card/80 backdrop-blur-md border-border/50">
                        <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
                            <CardTitle className="text-foreground">Your Products ({products.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {loading ? <p className="text-muted-foreground">Loading...</p> : (
                                <div className="space-y-4">
                                    {products.length === 0 && <p className="text-muted-foreground italic text-center py-8">No products yet.</p>}
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-muted/30 transition-colors shadow-sm">
                                            <div>
                                                <h3 className="font-semibold text-foreground text-lg">{p.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                                                <div className="flex gap-4 mt-2 text-sm">
                                                    <span className="font-medium text-green-600 dark:text-green-400">${p.price}</span>
                                                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                        Stock: {p.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="hover:bg-primary/10 hover:text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
