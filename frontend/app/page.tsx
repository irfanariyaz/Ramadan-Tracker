'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Users, Calendar, Settings, UserPlus, Trophy } from 'lucide-react';
import { familyAPI, memberAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import DailyChecklist from '@/components/DailyChecklist';
import IftarCountdown from '@/components/IftarCountdown';
import PrayerTimes from '@/components/PrayerTimes';
import CustomItemsManager from '@/components/CustomItemsManager';
import Link from 'next/link';
import Image from 'next/image';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function HomePageContent() {
    const searchParams = useSearchParams();
    const urlFamilyId = searchParams.get('familyId');
    const urlMemberId = searchParams.get('memberId');

    const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const getTodayLocal = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());
    const [showCustomItems, setShowCustomItems] = useState(false);
    const queryClient = useQueryClient();

    // Fetch families
    const { data: families } = useQuery({
        queryKey: ['families'],
        queryFn: familyAPI.getAll,
    });

    // Fetch family members
    const { data: members } = useQuery({
        queryKey: ['members', selectedFamilyId],
        queryFn: () => selectedFamilyId ? memberAPI.getByFamilyId(selectedFamilyId) : Promise.resolve([]),
        enabled: !!selectedFamilyId,
    });

    // Auto-select from URL params
    useEffect(() => {
        if (urlFamilyId) {
            setSelectedFamilyId(Number(urlFamilyId));
        }
        if (urlMemberId) {
            setSelectedMemberId(Number(urlMemberId));
        }
    }, [urlFamilyId, urlMemberId]);

    // Auto-select first family if available, and validate selection
    useEffect(() => {
        if (families && families.length > 0) {
            if (!selectedFamilyId) {
                // If no family selected manually or via URL, pick the first one
                setSelectedFamilyId(families[0].id);
            } else {
                // Check if currently selected family still exists
                const familyExists = families.some(f => f.id === selectedFamilyId);
                if (!familyExists) {
                    setSelectedFamilyId(families[0].id);
                    setSelectedMemberId(null);
                }
            }
        } else if (families && families.length === 0) {
            setSelectedFamilyId(null);
            setSelectedMemberId(null);
        }
    }, [families, selectedFamilyId]);

    // Validate that the selected member belongs to the selected family
    useEffect(() => {
        if (selectedMemberId && members && members.length > 0) {
            const memberExists = members.some(m => m.id === selectedMemberId);
            if (!memberExists) {
                setSelectedMemberId(null);
            }
        }
    }, [members, selectedMemberId]);

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Moon className="w-12 h-12 text-ramadan-gold animate-pulse-glow" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                            Ramadan Tracker
                        </h1>
                        <Moon className="w-12 h-12 text-ramadan-gold animate-pulse-glow" />
                    </div>
                    <p className="text-ramadan-gold-light text-lg">
                        Track your spiritual journey this blessed month
                    </p>
                </header>

                {/* Family & Member Selection */}
                <div className="card mb-8 animate-slide-up">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-ramadan-gold">
                                <Users className="inline w-4 h-4 mr-2" />
                                Select Family
                            </label>
                            <select
                                className="input-field w-full"
                                value={selectedFamilyId || ''}
                                onChange={(e) => {
                                    setSelectedFamilyId(Number(e.target.value));
                                    setSelectedMemberId(null);
                                }}
                            >
                                <option value="">Choose a family...</option>
                                {families?.map((family) => (
                                    <option key={family.id} value={family.id}>
                                        {family.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-4 mt-1 ml-1">
                                {selectedFamilyId && (
                                    <Link
                                        href={`/settings?familyId=${selectedFamilyId}`}
                                        className="text-xs text-ramadan-gold hover:text-ramadan-gold-light flex items-center gap-1"
                                    >
                                        <Settings className="w-3 h-3" />
                                        Manage Family Settings
                                    </Link>
                                )}
                                <Link
                                    href="/setup"
                                    className="text-xs text-ramadan-teal hover:text-ramadan-teal-light flex items-center gap-1"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Create New Family
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Date Picker */}
                    {selectedMemberId && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-ramadan-gold">
                                <Calendar className="inline w-4 h-4 mr-2" />
                                Select Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={getTodayLocal()}
                                className="input-field w-full md:w-auto"
                            />
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                        {selectedFamilyId && (
                            <div className="flex gap-3">
                                <Link href={`/dashboard?familyId=${selectedFamilyId}`}>
                                    <button className="btn-secondary">
                                        <Users className="inline w-4 h-4 mr-2" />
                                        View Dashboard
                                    </button>
                                </Link>
                                <Link href={`/leaderboard?familyId=${selectedFamilyId}`}>
                                    <button className="btn-secondary">
                                        <Trophy className="inline w-4 h-4 mr-2 text-ramadan-gold" />
                                        Leaderboard
                                    </button>
                                </Link>
                            </div>
                        )}
                        {selectedMemberId && (
                            <button
                                onClick={() => setShowCustomItems(!showCustomItems)}
                                className="btn-secondary"
                            >
                                <Settings className="inline w-4 h-4 mr-2" />
                                {showCustomItems ? 'Hide' : 'Manage'} Custom Items
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                {selectedMemberId && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column - Prayer Times & Countdown */}
                        <div className="space-y-6">
                            {/* Selected Member Info card for desktop */}
                            <div className="card hidden lg:block bg-gold-gradient text-ramadan-dark">
                                <div className="flex items-center gap-4">
                                    {members?.find(m => m.id === selectedMemberId)?.photo_path ? (
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-ramadan-dark/20">
                                            <Image
                                                src={normalizePhotoPath(members?.find(m => m.id === selectedMemberId)?.photo_path) || ''}
                                                alt="Selected"
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />

                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-ramadan-dark/10 flex items-center justify-center border-2 border-ramadan-dark/20">
                                            <Users className="w-6 h-6 text-ramadan-dark/50" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-70">Active Tracker</div>
                                        <div className="text-lg font-bold">{members?.find(m => m.id === selectedMemberId)?.name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Items Manager */}
                            {showCustomItems && (
                                <CustomItemsManager memberId={selectedMemberId} />
                            )}
                            <IftarCountdown familyId={selectedFamilyId} />
                            <PrayerTimes familyId={selectedFamilyId} />
                        </div>

                        {/* Middle & Right Columns - Daily Checklist */}
                        <div className="lg:col-span-2">
                            <DailyChecklist
                                memberId={selectedMemberId}
                                memberName={members?.find(m => m.id === selectedMemberId)?.name || ''}
                                memberPhoto={members?.find(m => m.id === selectedMemberId)?.photo_path}
                                selectedDate={selectedDate}
                            />
                        </div>
                    </div>
                )}

                {/* Welcome Message & Member Selection */}
                {!selectedMemberId && selectedFamilyId && (
                    <div className="card text-center py-12 animate-fade-in">
                        <Moon className="w-16 h-16 text-ramadan-gold mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2 text-ramadan-gold">Who is tracking today?</h2>
                        <p className="text-gray-300 mb-8">
                            Select a member to start tracking your daily progress
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
                            {members?.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedMemberId(member.id)}
                                    className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
                                >
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-ramadan-gold bg-ramadan-navy/50 flex items-center justify-center transition-all shadow-lg group-hover:shadow-glow-gold">
                                        {member.photo_path ? (
                                            <Image
                                                src={normalizePhotoPath(member.photo_path) || ''}
                                                alt={member.name}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />

                                        ) : (
                                            <Users className="w-10 h-10 text-ramadan-gold/50" />
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-300 group-hover:text-ramadan-gold transition-colors">
                                        {member.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {members?.length === 0 && (
                            <p className="text-gray-400 mt-4 italic">No members found. Add one above!</p>
                        )}
                    </div>
                )}

                {!selectedFamilyId && (
                    <div className="card text-center py-12 animate-fade-in">
                        <Users className="w-16 h-16 text-ramadan-gold mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
                        <p className="text-gray-300 mb-4">
                            Create a family to begin tracking your Ramadan journey
                        </p>
                        <Link href="/setup">
                            <button className="btn-primary">
                                Create Family
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </main >
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Moon className="w-12 h-12 text-ramadan-gold animate-pulse" />
            </div>
        }>
            <HomePageContent />
        </Suspense>
    );
}
