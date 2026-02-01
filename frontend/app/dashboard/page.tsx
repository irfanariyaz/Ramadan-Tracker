'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft, Trophy, BookOpen, Utensils, Calendar, Settings } from 'lucide-react';
import { familyAPI, progressAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import CircularProgress from '@/components/CircularProgress';

interface MemberProgress {
    member_id: number;
    member_name: string;
    photo_path: string | null;
    fasting_status: string;
    prayers_completed: number;
    quran_progress: number;
    daily_goal: string | null;
    custom_items_completed: number;
    custom_items_total: number;
}

interface FamilyProgressResponse {
    family_id: number;
    family_name: string;
    date: string;
    members: MemberProgress[];
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const familyId = searchParams.get('familyId');
    const getTodayLocal = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const today = getTodayLocal();

    const { data: familyProgress, isLoading } = useQuery<FamilyProgressResponse | null>({
        queryKey: ['familyProgress', familyId, today],
        queryFn: () => familyId ? progressAPI.getFamily(Number(familyId), today) : Promise.resolve(null),
        enabled: !!familyId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ramadan-gold mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading family progress...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in">
                    <div>
                        <Link href="/">
                            <button className="btn-secondary mb-4">
                                <ArrowLeft className="inline w-4 h-4 mr-2" />
                                Back to Tracker
                            </button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-ramadan-gold" />
                            <h1 className="text-3xl md:text-4xl font-bold text-ramadan-gold">
                                {familyProgress?.family_name} Dashboard
                            </h1>
                            <Link href={`/settings?familyId=${familyId}`}>
                                <button className="p-2 hover:bg-ramadan-navy rounded-full text-gray-400 hover:text-ramadan-gold transition-colors ml-2" title="Family Settings">
                                    <Settings className="w-6 h-6" />
                                </button>
                            </Link>
                        </div>
                        <p className="text-gray-400 mt-2">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href={`/dashboard/monthly?familyId=${familyId}`} className="flex-1 md:flex-initial">
                            <button className="btn-secondary w-full">
                                <Calendar className="inline w-4 h-4 mr-2" />
                                Monthly
                            </button>
                        </Link>
                        <Link href={`/leaderboard?familyId=${familyId}`} className="flex-1 md:flex-initial">
                            <button className="btn-primary w-full">
                                <Trophy className="inline w-4 h-4 mr-2" />
                                Leaderboard
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Family Members Progress */}
                {familyProgress && familyProgress.members.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {familyProgress?.members?.map((member) => (
                            <Link
                                key={member.member_id}
                                href={`/?familyId=${familyId}&memberId=${member.member_id}`}
                                className="block group"
                            >
                                <div className="card h-full animate-slide-up hover:shadow-glow-strong transition-all cursor-pointer group-hover:border-ramadan-teal/40">
                                    {/* Member Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        {member.photo_path ? (
                                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-ramadan-gold shrink-0 group-hover:border-ramadan-teal transition-colors">
                                                <Image
                                                    src={`${API_BASE_URL}/${normalizePhotoPath(member.photo_path)?.startsWith('/') ? normalizePhotoPath(member.photo_path)?.slice(1) : normalizePhotoPath(member.photo_path)}`}
                                                    alt={member.member_name}
                                                    fill
                                                    sizes="(max-width: 768px) 64px, 80px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-ramadan-navy/50 border-2 border-ramadan-gold/30 flex items-center justify-center group-hover:border-ramadan-teal transition-colors">
                                                <Users className="w-8 h-8 text-ramadan-gold/50 group-hover:text-ramadan-teal/50" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-ramadan-teal transition-colors">{member.member_name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Utensils className="w-4 h-4 text-ramadan-teal" />
                                                <span className={`text-sm font-medium ${member.fasting_status === 'fasting' ? 'text-ramadan-teal' :
                                                    member.fasting_status === 'excused' ? 'text-ramadan-gold-light' :
                                                        'text-gray-400'
                                                    }`}>
                                                    {member.fasting_status.replace('_', ' ').charAt(0).toUpperCase() +
                                                        member.fasting_status.slice(1).replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Stats */}
                                    <div className={`grid grid-cols-2 ${member.custom_items_total > 0 ? 'md:grid-cols-3' : ''} gap-4 mb-4`}>
                                        {/* Prayers */}
                                        <div className="bg-ramadan-navy/50 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold text-ramadan-teal">
                                                {member.prayers_completed}/6
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Prayers</div>
                                            <div className="w-full bg-ramadan-dark/50 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-gradient-to-r from-ramadan-teal to-ramadan-teal/70 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(member.prayers_completed / 6) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Quran */}
                                        <div className="bg-ramadan-navy/50 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold text-ramadan-gold">
                                                {member.quran_progress}%
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Quran</div>
                                            <div className="w-full bg-ramadan-dark/50 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-gold-gradient h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${member.quran_progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Custom Items */}
                                        {member.custom_items_total > 0 && (
                                            <div className="bg-ramadan-navy/50 rounded-lg p-4 text-center">
                                                <div className="text-3xl font-bold text-ramadan-purple">
                                                    {member.custom_items_completed}/{member.custom_items_total}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">Checklist</div>
                                                <div className="w-full bg-ramadan-dark/50 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-gradient-to-r from-ramadan-purple to-ramadan-purple/70 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${(member.custom_items_completed / member.custom_items_total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Daily Goal */}
                                    {member.daily_goal && (
                                        <div className="bg-ramadan-purple/20 border border-ramadan-purple/30 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <Trophy className="w-4 h-4 text-ramadan-gold-light mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-xs text-ramadan-gold-light font-medium mb-1">
                                                        Today's Goal
                                                    </div>
                                                    <p className="text-sm text-gray-300">{member.daily_goal}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!member.daily_goal && (
                                        <div className="bg-ramadan-navy/30 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-400">No goal set today</p>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <Users className="w-16 h-16 text-ramadan-gold mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No Progress Yet</h2>
                        <p className="text-gray-300">
                            Family members haven't started tracking today
                        </p>
                    </div>
                )}

                {/* Motivational Section */}
                {familyProgress && familyProgress.members.length > 0 && (
                    <div className="card mt-8 bg-gradient-to-r from-ramadan-purple/30 to-ramadan-blue/30 border-ramadan-gold/40">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-ramadan-gold mb-4">
                                🌙 Family Stats 🌙
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-4xl font-bold text-ramadan-teal">
                                        {familyProgress.members.filter(m => m.fasting_status === 'fasting').length}
                                    </div>
                                    <div className="text-sm text-gray-300 mt-1">Fasting Today</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-ramadan-gold">
                                        {Math.round(
                                            familyProgress.members.reduce((sum, m) => sum + m.prayers_completed, 0) /
                                            familyProgress.members.length
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-300 mt-1">Avg Prayers</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-ramadan-pink">
                                        {Math.round(
                                            familyProgress.members.reduce((sum, m) => sum + m.quran_progress, 0) /
                                            familyProgress.members.length
                                        )}%
                                    </div>
                                    <div className="text-sm text-gray-300 mt-1">Avg Quran Progress</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ramadan-gold mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
