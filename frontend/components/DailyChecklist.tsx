'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, BookOpen, Target, Star } from 'lucide-react';
import { dailyEntryAPI, customItemAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import CircularProgress from './CircularProgress';
import Image from 'next/image';

interface DailyChecklistProps {
    memberId: number;
    memberName: string;
    memberPhoto?: string | null;
    selectedDate: string;
}

export default function DailyChecklist({ memberId, memberName, memberPhoto, selectedDate }: DailyChecklistProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        fasting_status: 'not_fasting',
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
        taraweeh: false,
        quran_juz: 0,
        quran_page: 0,
        daily_goal: '',
        custom_items: {} as Record<string, boolean>,
    });

    // Fetch custom items for this member
    const { data: customItems } = useQuery({
        queryKey: ['customItems', memberId],
        queryFn: () => customItemAPI.getByMemberId(memberId),
    });

    // Fetch daily stats
    const { data: dailyStats } = useQuery({
        queryKey: ['dailyStats', memberId, selectedDate],
        queryFn: () => dailyEntryAPI.getStats(memberId, selectedDate),
    });

    // Update form when data loads
    useEffect(() => {
        if (dailyStats) {
            setFormData({
                fasting_status: dailyStats.fasting_status,
                fajr: dailyStats.fajr,
                dhuhr: dailyStats.dhuhr,
                asr: dailyStats.asr,
                maghrib: dailyStats.maghrib,
                isha: dailyStats.isha,
                taraweeh: dailyStats.taraweeh,
                quran_juz: dailyStats.quran_juz,
                quran_page: dailyStats.quran_page,
                daily_goal: dailyStats.daily_goal || '',
                custom_items: dailyStats.custom_items || {},
            });
        }
    }, [dailyStats]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => dailyEntryAPI.update(memberId, selectedDate, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyStats', memberId, selectedDate] });
            queryClient.invalidateQueries({ queryKey: ['familyProgress'] });
        },
    });

    const handleUpdate = (field: string, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        updateMutation.mutate({ [field]: value });
    };

    const handleCustomItemToggle = (itemId: string) => {
        const newCustomItems = {
            ...formData.custom_items,
            [itemId]: !formData.custom_items[itemId],
        };
        setFormData({ ...formData, custom_items: newCustomItems });
        updateMutation.mutate({ custom_items: newCustomItems });
    };

    const prayers = [
        { name: 'Fajr', key: 'fajr' },
        { name: 'Dhuhr', key: 'dhuhr' },
        { name: 'Asr', key: 'asr' },
        { name: 'Maghrib', key: 'maghrib' },
        { name: 'Isha', key: 'isha' },
        { name: 'Taraweeh', key: 'taraweeh' },
    ];

    const completedPrayers = prayers.filter(p => formData[p.key as keyof typeof formData]).length;

    return (
        <div className="card animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-ramadan-gold/20">
                <div className="flex items-center gap-4">
                    {memberPhoto ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-ramadan-gold">
                            <Image
                                src={`${API_BASE_URL}/${normalizePhotoPath(memberPhoto)?.startsWith('/') ? normalizePhotoPath(memberPhoto)?.slice(1) : normalizePhotoPath(memberPhoto)}`}
                                alt={memberName}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-ramadan-navy/50 border-2 border-ramadan-gold/30 flex items-center justify-center">
                            <Star className="w-8 h-8 text-ramadan-gold/50" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-ramadan-gold">
                            {memberName}'s Checklist
                        </h2>
                        <p className="text-gray-400 text-sm">Tracking for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-ramadan-teal bg-ramadan-teal/10 px-4 py-2 rounded-full border border-ramadan-teal/20">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">{Math.round((completedPrayers / 6) * 100)}% Prayers Done</span>
                </div>
            </div>

            {/* Fasting Status */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-ramadan-gold-light">
                    Fasting Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {['fasting', 'not_fasting', 'excused'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleUpdate('fasting_status', status)}
                            className={`py-3 px-4 rounded-lg font-medium transition-all ${formData.fasting_status === status
                                ? 'bg-gold-gradient text-ramadan-dark shadow-glow'
                                : 'bg-ramadan-navy/50 text-gray-300 hover:bg-ramadan-navy/70'
                                }`}
                        >
                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prayers */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-ramadan-gold-light">
                        Prayers ({completedPrayers}/6)
                    </label>
                    <div className="text-xs text-gray-400">
                        {Math.round((completedPrayers / 6) * 100)}% Complete
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {prayers.map((prayer) => {
                        const isChecked = formData[prayer.key as keyof typeof formData] as boolean;
                        return (
                            <button
                                key={prayer.key}
                                onClick={() => handleUpdate(prayer.key, !isChecked)}
                                className={`flex items-center gap-2 p-3 rounded-lg transition-all ${isChecked
                                    ? 'bg-ramadan-teal/20 border-2 border-ramadan-teal'
                                    : 'bg-ramadan-navy/50 border-2 border-ramadan-gold/20 hover:border-ramadan-gold/40'
                                    }`}
                            >
                                {isChecked ? (
                                    <CheckCircle2 className="w-5 h-5 text-ramadan-teal" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                )}
                                <span className={isChecked ? 'text-white font-medium' : 'text-gray-300'}>
                                    {prayer.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quran Progress */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-ramadan-gold-light flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Quran Progress
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <CircularProgress
                            value={formData.quran_juz}
                            max={30}
                            label="Juz"
                            color="gold"
                        />
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={formData.quran_juz}
                            onChange={(e) => handleUpdate('quran_juz', Number(e.target.value))}
                            className="w-full mt-4"
                        />
                        <div className="text-center mt-2 text-sm text-gray-300">
                            Juz {formData.quran_juz} of 30
                        </div>
                    </div>
                    <div>
                        <CircularProgress
                            value={formData.quran_page}
                            max={604}
                            label="Pages"
                            color="teal"
                        />
                        <input
                            type="range"
                            min="0"
                            max="604"
                            value={formData.quran_page}
                            onChange={(e) => handleUpdate('quran_page', Number(e.target.value))}
                            className="w-full mt-4"
                        />
                        <div className="text-center mt-2 text-sm text-gray-300">
                            Page {formData.quran_page} of 604
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Checklist Items */}
            {customItems && customItems.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-ramadan-gold-light flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Custom Items
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {customItems.map((item: any) => {
                            const isChecked = formData.custom_items[item.id.toString()] || false;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleCustomItemToggle(item.id.toString())}
                                    className={`flex items-center gap-2 p-3 rounded-lg transition-all ${isChecked
                                        ? 'bg-ramadan-purple/20 border-2 border-ramadan-purple'
                                        : 'bg-ramadan-navy/50 border-2 border-ramadan-gold/20 hover:border-ramadan-gold/40'
                                        }`}
                                    title={item.description || ''}
                                >
                                    {isChecked ? (
                                        <CheckCircle2 className="w-5 h-5 text-ramadan-purple" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span className={isChecked ? 'text-white font-medium' : 'text-gray-300'}>
                                        {item.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Daily Goal */}
            <div>
                <label className="block text-sm font-medium mb-3 text-ramadan-gold-light flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Daily Goal
                </label>
                <textarea
                    value={formData.daily_goal}
                    onChange={(e) => setFormData({ ...formData, daily_goal: e.target.value })}
                    onBlur={() => handleUpdate('daily_goal', formData.daily_goal)}
                    placeholder="e.g., Give charity, help a neighbor, make dua for family..."
                    className="input-field w-full h-24 resize-none"
                />
            </div>

            {updateMutation.isPending && (
                <div className="mt-4 text-center text-sm text-ramadan-teal">
                    Saving...
                </div>
            )}
        </div>
    );
}
