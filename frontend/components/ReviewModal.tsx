import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    initialData?: { rating: number; comment: string };
    productName: string;
    submitting: boolean;
}

export function ReviewModal({ isOpen, onClose, onSubmit, initialData, productName, submitting }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRating(initialData.rating);
                setComment(initialData.comment);
            } else {
                setRating(5);
                setComment("");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(rating, comment);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">
                        {initialData ? "Edit Your Review" : "Write a Review"}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 space-y-4 overflow-y-auto">
                        <p className="text-sm text-gray-500">For product: <span className="font-medium text-black">{productName}</span></p>

                        <div>
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        className={`cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Share your thoughts about this product..."
                                required
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : (initialData ? "Update Review" : "Post Review")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
