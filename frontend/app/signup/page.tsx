"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// We need an API helper for signup if not present
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("consumer"); // consumer vs seller
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/signup?role=${role}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, full_name: name, password, role })
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.detail || "Signup failed");
            }

            router.push("/login?signup=success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full py-12">
            <Card className="w-[400px] backdrop-blur-md bg-card/85 shadow-xl border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription>Join GitShop today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="bg-background/50 border-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="bg-background/50 border-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="bg-background/50 border-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Account Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-primary/20 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option value="consumer">Consumer (Buyer)</option>
                                <option value="seller">Seller (Merchant)</option>
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" disabled={loading}>
                            {loading ? "Creating..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" className="text-primary" onClick={() => router.push('/login')}>
                        Already have an account? Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
