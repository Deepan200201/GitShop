export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getImageUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    // API_URL includes /api/v1, so we need to strip it to get the base URL
    const baseUrl = API_URL.replace("/api/v1", "");
    return `${baseUrl}${path}`;
}

export async function fetchProducts(page: number = 1, limit: number = 20) {
    const res = await fetch(`${API_URL}/products/?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function fetchProductDetails(productId: string) {
    const res = await fetch(`${API_URL}/products/details/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch product details");
    return res.json();
}

export async function fetchCart(token: string) {
    const res = await fetch(`${API_URL}/store/cart`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
}

export async function addToCart(token: string, product: any, quantity: number = 1) {
    const res = await fetch(`${API_URL}/store/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: product.id,
            product_name: product.name,
            quantity,
            price: product.price
        })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_URL}/auth/login/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
}

export async function checkout(token: string) {
    const res = await fetch(`${API_URL}/store/orders/checkout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function createProduct(token: string, product: any) {
    const res = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(product)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function updateProduct(token: string, productId: string, updates: any) {
    const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function deleteProduct(token: string, productId: string) {
    const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    // Check if response is JSON or just status
    if (!res.ok) {
        try {
            throw await res.json();
        } catch (e) {
            throw new Error("Failed to delete product");
        }
    }
    return res.json().catch(() => ({})); // Handle empty response
}

export async function fetchMe(token: string) {
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const text = await res.text();
            console.error("fetchMe failed:", res.status, text);
            throw new Error(`Failed to fetch user profile: ${res.status} ${text}`);
        }
        return res.json();
    } catch (e) {
        console.error("fetchMe Error:", e);
        throw e;
    }
}

export async function updateProfile(token: string, updates: any) {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}


export async function updateCartItem(token: string, productId: string, quantity: number) {
    const res = await fetch(`${API_URL}/store/cart/items/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function deleteCartItem(token: string, productId: string) {
    const res = await fetch(`${API_URL}/store/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function downloadInvoice(token: string, orderId: string) {
    const res = await fetch(`${API_URL}/store/orders/${orderId}/invoice`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to download invoice");
    return res.blob();
}

export async function fetchOrders(token: string, page: number = 1, limit: number = 20) {
    const res = await fetch(`${API_URL}/store/orders?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function fetchOrder(token: string, orderId: string) {
    const res = await fetch(`${API_URL}/store/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function fetchMerchantOrders(token: string) {
    const res = await fetch(`${API_URL}/store/merchant/orders`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function updateOrderItemStatus(token: string, orderId: string, productId: string, status: string) {
    const res = await fetch(`${API_URL}/store/merchant/orders/${orderId}/items/${productId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function deleteAccount(token: string) {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return true;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    seller_id: string;
    images?: string[];
    videos?: string[];
}

// Reviews
export async function createReview(token: string, review: any) {
    const res = await fetch(`${API_URL}/reviews/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(review)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function uploadFile(token: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) throw await res.json();
    return res.json();
}

export async function fetchReviews(productId: string) {
    const res = await fetch(`${API_URL}/reviews/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
}


