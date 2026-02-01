'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { prayerTimesAPI, familyAPI } from '@/lib/api';

interface PrayerTimesProps {
    familyId: number | null;
}

export default function PrayerTimes({ familyId }: PrayerTimesProps) {
    // Fetch family for location
    const { data: family } = useQuery({
        queryKey: ['family', familyId],
        queryFn: () => familyId ? familyAPI.getById(familyId) : Promise.resolve(null),
        enabled: !!familyId,
    });

    // Fetch prayer times
    const { data: prayerTimes, isLoading } = useQuery({
        queryKey: ['prayerTimes', family?.location_city, family?.location_country],
        queryFn: () => prayerTimesAPI.get({
            city: family?.location_city,
            country: family?.location_country,
            latitude: family?.latitude,
            longitude: family?.longitude,
        }),
        enabled: !!family,
    });

    const prayers = [
        { name: 'Fajr', time: prayerTimes?.fajr, icon: '🌅' },
        { name: 'Dhuhr', time: prayerTimes?.dhuhr, icon: '☀️' },
        { name: 'Asr', time: prayerTimes?.asr, icon: '🌤️' },
        { name: 'Maghrib', time: prayerTimes?.maghrib, icon: '🌆' },
        { name: 'Isha', time: prayerTimes?.isha, icon: '🌙' },
    ];

    return (
        <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-ramadan-gold" />
                <h3 className="text-lg font-semibold text-ramadan-gold">Prayer Times</h3>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                    <p>Loading...</p>
                </div>
            ) : prayerTimes ? (
                <div className="space-y-3">
                    {prayers.map((prayer) => (
                        <div
                            key={prayer.name}
                            className="flex items-center justify-between p-3 bg-ramadan-navy/50 rounded-lg hover:bg-ramadan-navy/70 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{prayer.icon}</span>
                                <span className="font-medium">{prayer.name}</span>
                            </div>
                            <span className="text-ramadan-gold-light font-semibold">
                                {prayer.time}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-400">
                    <p className="text-sm">Set family location to view prayer times</p>
                </div>
            )}
        </div>
    );
}
