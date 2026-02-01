'use client';

interface CircularProgressProps {
    value: number;
    max: number;
    label: string;
    color?: 'gold' | 'teal' | 'purple';
}

export default function CircularProgress({ value, max, label, color = 'gold' }: CircularProgressProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorMap = {
        gold: {
            stroke: 'url(#goldGradient)',
            text: 'text-ramadan-gold',
        },
        teal: {
            stroke: 'url(#tealGradient)',
            text: 'text-ramadan-teal',
        },
        purple: {
            stroke: 'url(#purpleGradient)',
            text: 'text-ramadan-purple',
        },
    };

    const colors = colorMap[color];

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#f4d03f" />
                        </linearGradient>
                        <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1dd3b0" />
                            <stop offset="100%" stopColor="#4fd1c5" />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4a3b6e" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                    </defs>
                    {/* Background circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke={colors.stroke}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 ease-out"
                        style={{
                            filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-2xl font-bold ${colors.text}`}>
                        {value}
                    </div>
                    <div className="text-xs text-gray-400">
                        {label}
                    </div>
                </div>
            </div>
            <div className="mt-2 text-sm text-gray-300">
                {percentage.toFixed(0)}%
            </div>
        </div>
    );
}
