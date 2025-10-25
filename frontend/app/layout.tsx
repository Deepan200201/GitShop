import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from "@/components/ThemeProvider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'GitShop',
    description: 'E-commerce powered by Git',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="min-h-screen gitshop-bg text-foreground flex flex-col transition-colors duration-300">
                            <Navbar />
                            <main className="p-8 container mx-auto flex-1 z-10 relative">
                                {children}
                            </main>
                        </div>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
