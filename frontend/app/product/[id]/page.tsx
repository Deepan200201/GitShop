"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductDetails, addToCart, fetchReviews, createReview, getImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, User as UserIcon, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ReviewModal } from "@/components/ReviewModal";

interface Review {
    id: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    seller_id: string;
    stock: number;
    category: string;
    images?: string[];
    videos?: string[];
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const productId = Array.isArray(id) ? id[0] : id;
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review form state
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const { user, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!productId) return;

        Promise.all([
            fetchProductDetails(productId),
            fetchReviews(productId).catch(() => []) // gracefully handle no reviews
        ])
            .then(([prodData, reviewsData]) => {
                setProduct(prodData);
                setReviews(reviewsData);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load product");
            })
            .finally(() => setLoading(false));
    }, [productId]);

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        if (!product?.images) return;
        setCurrentImageIndex((prev) => (prev + 1) % product.images!.length);
    };

    const prevImage = () => {
        if (!product?.images) return;
        setCurrentImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
    };

    // Check for existing review explicitly by user_id
    const userReview = reviews.find(r => r.user_id === user?.id);


    const handleAddToCart = async () => {
        if (!product) return;
        if (!user || !token) {
            router.push(`/login?redirect=/product/${productId}`);
            return;
        }
        try {
            await addToCart(token, product);
            alert("Added to cart!");
        } catch (e: any) {
            alert(e.message || "Failed to add to cart");
        }
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!user || !token || !productId) return;

        setSubmittingReview(true);
        try {
            const newReview = await createReview(token, {
                product_id: productId,
                rating,
                comment
            });
            // Upsert in local state
            const existingIdx = reviews.findIndex(r => r.user_id === user.id);
            let updatedReviews = [...reviews];
            if (existingIdx >= 0) {
                updatedReviews[existingIdx] = newReview;
            } else {
                updatedReviews = [newReview, ...reviews];
            }
            setReviews(updatedReviews);
            alert(existingIdx >= 0 ? "Review updated successfully!" : "Review posted successfully!");
            setIsReviewModalOpen(false);
        } catch (e: any) {
            // Check for specific purchase error
            if (e.detail && e.detail.includes("Please buy")) {
                alert("Please buy the product before giving review");
            } else {
                alert("Failed to post/update review");
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (error || !product) return <div className="p-10 text-center text-red-500">{error || "Product not found"}</div>;

    const hasMultipleImages = product.images && product.images.length > 1;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Product Header & Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative p-6 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 shadow-xl">
                <Button
                    variant="ghost"
                    className="absolute top-4 left-4 z-10 hidden md:flex bg-background/50 backdrop-blur-sm hover:bg-background/80"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {/* Mobile Back Button */}
                <Button
                    variant="ghost"
                    className="md:hidden mb-4"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="mr-2" /> Back to Shop
                </Button>

                <div className="space-y-4">
                    {/* Main Image Carousel */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group shadow-inner">
                        {product.images && product.images.length > 0 ? (
                            <>
                                <img
                                    src={getImageUrl(product.images[currentImageIndex])}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={(e) => { e.preventDefault(); prevImage(); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); nextImage(); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &gt;
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                        )}
                    </div>
                    {/* Gallery Thumbnails (Images & Videos) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {product.images?.map((img, i) => (
                            <div
                                key={i}
                                className={`w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden cursor-pointer border-2 transition-all ${i === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                                onClick={() => setCurrentImageIndex(i)}
                            >
                                <img src={getImageUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {/* Video Player Section if videos exist */}
                    {product.videos && product.videos.length > 0 && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mt-4 shadow-md">
                            <video controls className="w-full h-full" key={product.videos[0]}>
                                <source src={product.videos[0]} />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </div>

                <div className="space-y-6 pt-8 md:pt-0">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">{product.name}</h1>
                        <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1">
                            Sold by <span className="font-semibold text-foreground">{product.seller_id.slice(0, 8)}...</span>
                        </p>
                    </div>

                    <div className="text-4xl font-bold text-primary">${product.price}</div>

                    <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                        {product.description}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                        </span>
                    </div>

                    <Button size="lg" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleAddToCart} disabled={product.stock <= 0}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                </div>
            </div>

            <hr className="border-border/50" />

            {/* Reviews Section */}
            <div className="bg-card/40 backdrop-blur-md rounded-xl p-6 border border-border/30">
                {/* Review Header & Action */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Customer Reviews</h2>

                    {user ? (
                        <Button onClick={() => setIsReviewModalOpen(true)} variant="secondary">
                            {userReview ? "Edit Your Review" : "Write a Review"}
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => router.push(`/login?redirect=/product/${productId}`)}>
                            Log in to write a review
                        </Button>
                    )}
                </div>

                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                    productName={product.name}
                    initialData={userReview ? { rating: userReview.rating, comment: userReview.comment } : undefined}
                    submitting={submittingReview}
                />

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
                    ) : (
                        reviews.map(review => (
                            <Card key={review.id} className="bg-card/80 backdrop-blur-sm border-primary/5">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-secondary p-2 rounded-full">
                                                <UserIcon size={16} className="text-secondary-foreground" />
                                            </div>
                                            <span className="font-semibold text-card-foreground">{review.user_name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-card-foreground/90 leading-relaxed">{review.comment}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
