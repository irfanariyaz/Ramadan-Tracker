'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { progressAPI } from '@/lib/api';
import Link from 'next/link';

interface MemberDailyScore {
    member_id: number;
    member_name: string;
    role: string;
    score: number;
    fasting_status: string;
}

function MonthlyViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const familyId = searchParams.get('familyId');

    // Default to current month
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

    const { data: monthlyStats, isLoading } = useQuery({
        queryKey: ['monthlyStats', familyId, monthStr],
        queryFn: () => progressAPI.getMonthly(Number(familyId), monthStr),
        enabled: !!familyId,
    });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
    };

    const getScoreColor = (score: number) => {
        if (score >= 40) return 'text-green-400';
        if (score >= 20) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (!familyId) return <div className="p-8 text-center text-red-400">Family ID missing</div>;
    if (isLoading) return <div className="p-8 text-center text-ramadan-gold">Loading...</div>;

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-ramadan-gold flex items-center gap-2">
                        <Calendar className="w-6 h-6" /> Monthly Overview
                    </h1>
                </div>

                <div className="card animate-fade-in">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-ramadan-navy rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6 text-ramadan-gold" />
                        </button>
                        <h2 className="text-xl font-bold text-white">
                            {monthName} {year}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-ramadan-navy rounded-full transition-colors">
                            <ChevronRight className="w-6 h-6 text-ramadan-gold" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for start of month */}
                        {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-transparent" />
                        ))}

                        {/* Days */}
                        {monthlyStats?.dates.map((dayStat: any) => (
                            <div
                                key={dayStat.date}
                                className="min-h-[120px] rounded-lg border border-gray-700 bg-ramadan-navy/30 p-2 hover:border-ramadan-gold/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-gray-400">
                                        {new Date(dayStat.date).getDate()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {dayStat.fasting_count} fasting
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayStat.members_scores?.map((member: MemberDailyScore) => (
                                        <div key={member.member_id} className="flex justify-between items-center text-xs">
                                            <span className="text-gray-300 truncate max-w-[80px]" title={member.member_name}>
                                                {member.member_name}
                                            </span>
                                            <span className={`font-mono ${getScoreColor(member.score)}`}>
                                                {Math.round(member.score)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
                            <span>Excellent (40+)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
                            <span>Good (20-39)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
                            <span>Needs Improvement (&lt;20)</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MonthlyView() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-ramadan-gold">Loading monthly view...</div>}>
            <MonthlyViewContent />
        </Suspense>
    );
}
