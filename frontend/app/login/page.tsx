"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin, fetchMe } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await apiLogin(email, password);
            const token = data.access_token;

            // Fetch User Profile
            const userProfile = await fetchMe(token);

            login(token, userProfile);
            // localStorage.setItem('user_data', JSON.stringify(userProfile)); // Handled by login now

            if (userProfile.role === 'seller' || userProfile.role === 'admin') {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/";
            }
        } catch (err: any) {
            console.error("Login error:", err);
            alert(`Login failed: ${err.message || "Unknown error"}`);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full py-12">
            <Card className="w-[350px] backdrop-blur-md bg-card/85 shadow-xl border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Login
                    </CardTitle>
                    <CardDescription>Enter your credentials to access your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
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
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <p className="text-xs text-muted-foreground">Don&apos;t have an account?</p>
                    <Button variant="link" className="h-auto p-0 text-primary" onClick={() => router.push('/signup')}>
                        Sign up
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
