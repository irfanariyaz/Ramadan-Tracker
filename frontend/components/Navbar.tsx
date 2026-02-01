'use client';

import Link from 'next/link';
import { Moon, Home } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-ramadan-dark/40 backdrop-blur-md border-b border-ramadan-gold/10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-all hover:scale-105"
                >
                    <div className="w-10 h-10 rounded-full bg-ramadan-navy border border-ramadan-gold/30 flex items-center justify-center shadow-glow-gold group-hover:border-ramadan-gold">
                        <Moon className="w-6 h-6 text-ramadan-gold group-hover:animate-pulse" />
                    </div>
                    <span className="text-xl font-bold bg-gold-gradient bg-clip-text text-transparent hidden sm:block">
                        Ramadan Tracker
                    </span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ramadan-navy/50 border border-ramadan-gold/20 text-ramadan-gold-light hover:text-ramadan-gold hover:border-ramadan-gold transition-all"
                    title="Return to Home"
                >
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Home</span>
                </Link>
            </div>
        </nav>
    );
}
