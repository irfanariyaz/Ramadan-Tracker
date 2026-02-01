'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Settings, Trash2, Edit2, Save, X, UserPlus, Users, Camera } from 'lucide-react';
import { familyAPI, memberAPI, API_BASE_URL, normalizePhotoPath } from '@/lib/api';
import Link from 'next/link';

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const familyId = searchParams.get('familyId');
    const queryClient = useQueryClient();

    const [isEditingFamily, setIsEditingFamily] = useState(false);
    const [familyForm, setFamilyForm] = useState({ name: '', location_city: '', location_country: '' });
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [memberForm, setMemberForm] = useState({ name: '', role: '' });
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('adult');

    const { data: family, isLoading: familyLoading } = useQuery({
        queryKey: ['family', familyId],
        queryFn: () => familyId ? familyAPI.getById(Number(familyId)) : Promise.resolve(null),
        enabled: !!familyId,
    });

    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ['members', familyId],
        queryFn: () => familyId ? memberAPI.getByFamilyId(Number(familyId)) : Promise.resolve([]),
        enabled: !!familyId,
    });

    const updateFamilyMutation = useMutation({
        mutationFn: (data: any) => familyAPI.update(Number(familyId), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', familyId] });
            setIsEditingFamily(false);
        },
    });

    const deleteFamilyMutation = useMutation({
        mutationFn: () => familyAPI.delete(Number(familyId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            router.push('/');
        },
    });

    const updateMemberMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => memberAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', familyId] });
            setEditingMemberId(null);
        },
    });

    const deleteMemberMutation = useMutation({
        mutationFn: (id: number) => memberAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', familyId] });
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: (data: any) => memberAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', familyId] });
            setNewMemberName('');
        },
    });

    const handleEditFamily = () => {
        if (family) {
            setFamilyForm({
                name: family.name,
                location_city: family.location_city || '',
                location_country: family.location_country || '',
            });
            setIsEditingFamily(true);
        }
    };

    const handleSaveFamily = () => {
        updateFamilyMutation.mutate(familyForm);
    };

    const handleDeleteFamily = () => {
        if (confirm('Are you sure you want to delete this family? This will remove all members and their progress forever.')) {
            deleteFamilyMutation.mutate();
        }
    };

    const handleEditMember = (member: any) => {
        setMemberForm({ name: member.name, role: member.role });
        setEditingMemberId(member.id);
    };

    const handleSaveMember = (id: number) => {
        updateMemberMutation.mutate({ id, data: memberForm });
    };

    const handleDeleteMember = (id: number) => {
        if (confirm('Are you sure you want to delete this family member? All their data will be lost.')) {
            deleteMemberMutation.mutate(id);
        }
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMemberName && familyId) {
            addMemberMutation.mutate({
                family_id: Number(familyId),
                name: newMemberName,
                role: newMemberRole,
            });
        }
    };

    const handlePhotoUpload = async (memberId: number, file: File) => {
        try {
            await memberAPI.uploadPhoto(memberId, file);
            queryClient.invalidateQueries({ queryKey: ['members', familyId] });
            queryClient.invalidateQueries({ queryKey: ['family', familyId] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard', familyId] });
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Failed to upload photo. Please try again.');
        }
    };

    if (familyLoading || membersLoading || deleteFamilyMutation.isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-ramadan-gold">
                    {deleteFamilyMutation.isSuccess ? 'Redirecting...' : 'Loading settings...'}
                </div>
            </div>
        );
    }

    if (!family) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <div className="text-red-400 mb-4 text-xl font-bold">Family not found</div>
                <button
                    onClick={() => router.push('/')}
                    className="btn-primary"
                >
                    Return to home
                </button>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-ramadan-gold flex items-center gap-3">
                        <Settings className="w-8 h-8" /> Family Settings
                    </h1>
                </div>

                <div className="grid gap-8">
                    {/* Family Configuration */}
                    <section className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-ramadan-gold" />
                                Family Information
                            </h2>
                            {!isEditingFamily ? (
                                <button
                                    onClick={handleEditFamily}
                                    className="p-2 hover:bg-ramadan-navy rounded-full text-gray-400 hover:text-ramadan-gold transition-colors"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveFamily}
                                        className="p-2 hover:bg-ramadan-navy rounded-full text-ramadan-teal transition-colors"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsEditingFamily(false)}
                                        className="p-2 hover:bg-ramadan-navy rounded-full text-red-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditingFamily ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Family Name</label>
                                    <input
                                        type="text"
                                        value={familyForm.name}
                                        onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                                        className="input-field w-full"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-400">City</label>
                                        <input
                                            type="text"
                                            value={familyForm.location_city}
                                            onChange={(e) => setFamilyForm({ ...familyForm, location_city: e.target.value })}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-400">Country</label>
                                        <input
                                            type="text"
                                            value={familyForm.location_country}
                                            onChange={(e) => setFamilyForm({ ...familyForm, location_country: e.target.value })}
                                            className="input-field w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-ramadan-gold-light">{family.name}</p>
                                <p className="text-gray-400">
                                    {family.location_city}, {family.location_country}
                                </p>
                            </div>
                        )}

                        {!isEditingFamily && (
                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <button
                                    onClick={handleDeleteFamily}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Family
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Members Management */}
                    <section className="card">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-ramadan-gold" />
                            Manage Members
                        </h2>

                        <div className="space-y-4">
                            {members?.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="bg-ramadan-navy/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                                >
                                    {editingMemberId === member.id ? (
                                        <div className="flex-1 flex flex-col md:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={memberForm.name}
                                                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                                className="input-field flex-1"
                                            />
                                            <div className="flex gap-2 shrink-0">
                                                <select
                                                    value={memberForm.role}
                                                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                                    className="input-field flex-1 md:w-32"
                                                >
                                                    <option value="adult">Adult</option>
                                                    <option value="child">Child</option>
                                                </select>
                                                <button
                                                    onClick={() => handleSaveMember(member.id)}
                                                    className="p-2 text-ramadan-teal hover:bg-ramadan-navy rounded-full"
                                                >
                                                    <Save className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingMemberId(null)}
                                                    className="p-2 text-red-400 hover:bg-ramadan-navy rounded-full"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="relative group">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-ramadan-gold/30 bg-ramadan-navy flex items-center justify-center">
                                                        {member.photo_path ? (
                                                            <img
                                                                src={`${API_BASE_URL}/${normalizePhotoPath(member.photo_path)}`}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1a2b4b&color=D4AF37`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="text-ramadan-gold font-bold text-lg">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Camera className="w-5 h-5 text-white" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handlePhotoUpload(member.id, file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{member.name}</p>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditMember(member)}
                                                    className="p-2 text-gray-400 hover:text-ramadan-gold hover:bg-ramadan-navy rounded-full transition-all"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-ramadan-navy rounded-full transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Add New Member Inline */}
                            <form
                                onSubmit={handleAddMember}
                                className="bg-ramadan-gold/5 border border-dashed border-ramadan-gold/30 rounded-lg p-4 flex flex-col md:flex-row gap-3"
                            >
                                <input
                                    type="text"
                                    placeholder="New member name"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="input-field flex-1"
                                />
                                <div className="flex gap-3">
                                    <select
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        className="input-field flex-1 md:w-32"
                                    >
                                        <option value="adult">Adult</option>
                                        <option value="child">Child</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={!newMemberName || addMemberMutation.isPending}
                                        className="btn-primary min-w-[80px]"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-ramadan-gold">Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
