
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceUrl: string | null;
    filename: string;
}

export function InvoiceModal({ isOpen, onClose, invoiceUrl, filename }: InvoiceModalProps) {
    if (!isOpen || !invoiceUrl) return null;

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = invoiceUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Invoice Preview</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
                    <iframe
                        src={invoiceUrl}
                        className="w-full h-full min-h-[500px] border rounded"
                        title="Invoice Preview"
                    />
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handleDownload}>Download PDF</Button>
                </div>
            </div>
        </div>
    );
}
