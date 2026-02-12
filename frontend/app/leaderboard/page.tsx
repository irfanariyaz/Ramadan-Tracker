'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trophy, Flame, BookOpen, Star } from 'lucide-react';
import { familyAPI, progressAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import Image from 'next/image';

function LeaderboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const familyId = searchParams.get('familyId');

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard', familyId],
        queryFn: () => progressAPI.getLeaderboard(Number(familyId)),
        enabled: !!familyId,
    });

    if (!familyId) return <div className="p-8 text-center text-red-400">Family ID missing</div>;
    if (isLoading) return <div className="p-8 text-center text-ramadan-gold">Loading...</div>;

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-glow" />;
            case 1: return <Trophy className="w-7 h-7 text-gray-300" />;
            case 2: return <Trophy className="w-6 h-6 text-amber-600" />;
            default: return <span className="text-xl font-bold text-gray-500">#{index + 1}</span>;
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-ramadan-gold flex items-center gap-2">
                        <Trophy className="w-6 h-6" /> Leaderboard
                    </h1>
                </div>

                <div className="card animate-fade-in space-y-4">
                    {leaderboard?.entries?.map((entry: any, index: number) => (
                        <div
                            key={entry.member_id}
                            className={`flex items-center p-4 rounded-xl border transition-all hover:scale-[1.01] ${index === 0 ? 'bg-gradient-to-r from-ramadan-gold/20 to-transparent border-ramadan-gold/50' : 'bg-ramadan-navy/30 border-ramadan-navy'}`}
                        >
                            <div className="w-12 flex justify-center mr-4">
                                {getRankIcon(index)}
                            </div>

                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-ramadan-gold/50 mr-4">
                                {entry.photo_path ? (
                                    <Image
                                        src={normalizePhotoPath(entry.photo_path) || ''}
                                        alt={entry.member_name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />

                                ) : (
                                    <div className="w-full h-full bg-ramadan-navy flex items-center justify-center text-ramadan-gold font-bold">
                                        {entry.member_name[0]}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {entry.member_name}
                                    {entry.role === 'child' && (
                                        <span className="text-xs bg-ramadan-teal/20 text-ramadan-teal px-2 py-0.5 rounded-full border border-ramadan-teal/30">
                                            Junior
                                        </span>
                                    )}
                                </h3>
                                <div className="text-sm text-gray-400 flex gap-4 mt-1">
                                    <span className="flex items-center gap-1" title="Reading Streak">
                                        <Flame className="w-3 h-3 text-orange-400" /> {entry.quran_streak} Day Reading Streak
                                    </span>
                                    <span className="flex items-center gap-1" title="Progress">
                                        <BookOpen className="w-3 h-3 text-blue-400" /> {entry.quran_pages_total} Pages • {entry.fasting_total} Fasts
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-ramadan-gold">
                                    {Math.round(entry.total_score)}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Points</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function Leaderboard() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-ramadan-gold">Loading leaderboard...</div>}>
            <LeaderboardContent />
        </Suspense>
    );
}
