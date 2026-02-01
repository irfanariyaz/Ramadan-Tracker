'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, MapPin, ArrowLeft } from 'lucide-react';
import { familyAPI, memberAPI } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PhotoUpload from '@/components/PhotoUpload';

export default function Setup() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [step, setStep] = useState<'family' | 'members'>('family');
    const [createdFamilyId, setCreatedFamilyId] = useState<number | null>(null);
    const [createdMembers, setCreatedMembers] = useState<number[]>([]);

    const [familyData, setFamilyData] = useState({
        name: '',
        location_city: '',
        location_country: '',
    });

    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState('adult');

    const createFamilyMutation = useMutation({
        mutationFn: familyAPI.create,
        onSuccess: (data) => {
            setCreatedFamilyId(data.id);
            setStep('members');
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
        onError: (error) => {
            console.error('Create family error:', error);
            alert(`Failed to create family: ${error.message}`);
        },
    });

    const createMemberMutation = useMutation({
        mutationFn: memberAPI.create,
        onSuccess: (data) => {
            setCreatedMembers([...createdMembers, data.id]);
            setMemberName('');
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
        onError: (error) => {
            console.error('Create member error:', error);
            alert(`Failed to create member: ${error.message}`);
        },
    });

    const handleCreateFamily = (e: React.FormEvent) => {
        e.preventDefault();
        if (!familyData.name) {
            alert('Please enter a family name');
            return;
        }
        createFamilyMutation.mutate(familyData);
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberName || !createdFamilyId) return;

        createMemberMutation.mutate({
            family_id: createdFamilyId,
            name: memberName,
            role: memberRole,
        });
    };

    const handleFinish = () => {
        router.push('/');
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/">
                    <button className="btn-secondary mb-6">
                        <ArrowLeft className="inline w-4 h-4 mr-2" />
                        Back
                    </button>
                </Link>

                {step === 'family' && (
                    <div className="card animate-fade-in">
                        <div className="text-center mb-6">
                            <Users className="w-16 h-16 text-ramadan-gold mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-ramadan-gold mb-2">
                                Create Your Family
                            </h1>
                            <p className="text-gray-300">
                                Set up your family to start tracking Ramadan together
                            </p>
                        </div>

                        <form onSubmit={handleCreateFamily} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-ramadan-gold-light">
                                    Family Name *
                                </label>
                                <input
                                    type="text"
                                    value={familyData.name}
                                    onChange={(e) => setFamilyData({ ...familyData, name: e.target.value })}
                                    placeholder="e.g., The Ahmeds"
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-ramadan-gold-light">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={familyData.location_city}
                                        onChange={(e) => setFamilyData({ ...familyData, location_city: e.target.value })}
                                        placeholder="e.g., Dubai"
                                        className="input-field w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-ramadan-gold-light">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={familyData.location_country}
                                        onChange={(e) => setFamilyData({ ...familyData, location_country: e.target.value })}
                                        placeholder="e.g., UAE"
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-400">
                                Location is optional but helps display accurate prayer times
                            </p>

                            <button
                                type="submit"
                                disabled={createFamilyMutation.isPending}
                                className="btn-primary w-full"
                            >
                                {createFamilyMutation.isPending ? 'Creating...' : 'Create Family'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'members' && (
                    <div className="card animate-fade-in">
                        <div className="text-center mb-6">
                            <UserPlus className="w-16 h-16 text-ramadan-gold mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-ramadan-gold mb-2">
                                Add Family Members
                            </h1>
                            <p className="text-gray-300">
                                Add each person who will be tracking their progress
                            </p>
                        </div>

                        <form onSubmit={handleAddMember} className="mb-6">
                            <div className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    value={memberName}
                                    onChange={(e) => setMemberName(e.target.value)}
                                    placeholder="Member name"
                                    className="input-field flex-1"
                                />
                                <div className="flex gap-3">
                                    <select
                                        value={memberRole}
                                        onChange={(e) => setMemberRole(e.target.value)}
                                        className="input-field flex-1 md:w-32"
                                    >
                                        <option value="adult">Adult</option>
                                        <option value="child">Child</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={createMemberMutation.isPending || !memberName}
                                        className="btn-primary min-w-[80px]"
                                    >
                                        {createMemberMutation.isPending ? 'Adding...' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Created Members List */}
                        {createdMembers.length > 0 && (
                            <div className="space-y-4 mb-6">
                                <h3 className="text-lg font-semibold text-ramadan-gold">
                                    Added Members ({createdMembers.length})
                                </h3>
                                {createdMembers.map((memberId, index) => (
                                    <div key={memberId} className="bg-ramadan-navy/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-white font-medium">Member {index + 1}</span>
                                        </div>
                                        <PhotoUpload memberId={memberId} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('family')}
                                className="btn-secondary flex-1"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={createdMembers.length === 0}
                                className="btn-primary flex-1"
                            >
                                Finish Setup
                            </button>
                        </div>

                        {createdMembers.length === 0 && (
                            <p className="text-center text-sm text-gray-400 mt-4">
                                Add at least one member to continue
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
