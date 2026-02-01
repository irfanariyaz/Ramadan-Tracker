'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Sunset } from 'lucide-react';
import { prayerTimesAPI, familyAPI } from '@/lib/api';

interface IftarCountdownProps {
    familyId: number | null;
}

export default function IftarCountdown({ familyId }: IftarCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);

    // Fetch family for location
    const { data: family } = useQuery({
        queryKey: ['family', familyId],
        queryFn: () => familyId ? familyAPI.getById(familyId) : Promise.resolve(null),
        enabled: !!familyId,
    });

    // Fetch prayer times
    const { data: prayerTimes } = useQuery({
        queryKey: ['prayerTimes', family?.location_city, family?.location_country],
        queryFn: () => prayerTimesAPI.get({
            city: family?.location_city,
            country: family?.location_country,
            latitude: family?.latitude,
            longitude: family?.longitude,
        }),
        enabled: !!family,
    });

    useEffect(() => {
        if (!prayerTimes?.maghrib) return;

        const interval = setInterval(() => {
            const now = new Date();
            const [hours, minutes] = prayerTimes.maghrib.split(':');
            const maghribTime = new Date();
            maghribTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const diff = maghribTime.getTime() - now.getTime();

            if (diff <= 0) {
                setIsPast(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setIsPast(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    return (
        <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
                <Sunset className="w-5 h-5 text-ramadan-gold" />
                <h3 className="text-lg font-semibold text-ramadan-gold">Iftar Countdown</h3>
            </div>

            {prayerTimes ? (
                <>
                    <div className="text-center mb-4">
                        <div className="text-sm text-gray-400 mb-2">Time until Maghrib</div>
                        {isPast ? (
                            <div className="text-2xl font-bold text-ramadan-teal">
                                Time to break your fast! 🌙
                            </div>
                        ) : (
                            <div className="flex justify-center gap-2">
                                <div className="bg-ramadan-navy/50 rounded-lg p-3 min-w-[60px]">
                                    <div className="text-3xl font-bold text-ramadan-gold">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-400">Hours</div>
                                </div>
                                <div className="text-3xl font-bold text-ramadan-gold flex items-center">:</div>
                                <div className="bg-ramadan-navy/50 rounded-lg p-3 min-w-[60px]">
                                    <div className="text-3xl font-bold text-ramadan-gold">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-400">Minutes</div>
                                </div>
                                <div className="text-3xl font-bold text-ramadan-gold flex items-center">:</div>
                                <div className="bg-ramadan-navy/50 rounded-lg p-3 min-w-[60px]">
                                    <div className="text-3xl font-bold text-ramadan-gold">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-400">Seconds</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center pt-4 border-t border-ramadan-gold/20">
                        <div className="text-sm text-gray-400">Maghrib Time</div>
                        <div className="text-xl font-semibold text-ramadan-gold-light">
                            {prayerTimes.maghrib}
                        </div>
                    </div>

                    {prayerTimes.fajr && (
                        <div className="text-center mt-3 pt-3 border-t border-ramadan-gold/20">
                            <div className="text-sm text-gray-400">Tomorrow's Suhoor (before Fajr)</div>
                            <div className="text-lg font-semibold text-ramadan-teal">
                                {prayerTimes.fajr}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                    <p>Loading prayer times...</p>
                </div>
            )}
        </div>
    );
}
