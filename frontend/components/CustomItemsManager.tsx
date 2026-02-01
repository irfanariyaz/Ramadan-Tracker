'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { customItemAPI } from '@/lib/api';

interface CustomItemsManagerProps {
    memberId: number;
}

export default function CustomItemsManager({ memberId }: CustomItemsManagerProps) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newItem, setNewItem] = useState({ title: '', description: '' });
    const [editItem, setEditItem] = useState({ title: '', description: '' });

    // Fetch custom items
    const { data: customItems } = useQuery({
        queryKey: ['customItems', memberId],
        queryFn: () => customItemAPI.getByMemberId(memberId),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => customItemAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customItems', memberId] });
            queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
            setIsAdding(false);
            setNewItem({ title: '', description: '' });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => customItemAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customItems', memberId] });
            setEditingId(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => customItemAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customItems', memberId] });
            queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
        },
    });

    const handleCreate = () => {
        if (!newItem.title.trim()) return;
        createMutation.mutate({
            member_id: memberId,
            title: newItem.title,
            description: newItem.description,
        });
    };

    const handleUpdate = (id: number) => {
        if (!editItem.title.trim()) return;
        updateMutation.mutate({
            id,
            data: {
                title: editItem.title,
                description: editItem.description,
            },
        });
    };

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditItem({ title: item.title, description: item.description || '' });
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ramadan-gold">Custom Checklist Items</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-secondary text-sm py-2 px-4"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span className="ml-2">{isAdding ? 'Cancel' : 'Add Item'}</span>
                </button>
            </div>

            {/* Add New Item Form */}
            {isAdding && (
                <div className="bg-ramadan-navy/50 rounded-lg p-4 mb-4">
                    <input
                        type="text"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Item title (e.g., 'Give charity')"
                        className="input-field w-full mb-2"
                    />
                    <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Description (optional)"
                        className="input-field w-full mb-3"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newItem.title.trim() || createMutation.isPending}
                        className="btn-primary w-full"
                    >
                        {createMutation.isPending ? 'Adding...' : 'Add Custom Item'}
                    </button>
                </div>
            )}

            {/* Custom Items List */}
            <div className="space-y-2">
                {customItems && customItems.length > 0 ? (
                    customItems.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-ramadan-navy/50 rounded-lg p-3 hover:bg-ramadan-navy/70 transition-all"
                        >
                            {editingId === item.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editItem.title}
                                        onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                                        className="input-field w-full mb-2"
                                    />
                                    <input
                                        type="text"
                                        value={editItem.description}
                                        onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                        placeholder="Description (optional)"
                                        className="input-field w-full mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(item.id)}
                                            className="btn-primary flex-1 text-sm py-2"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="btn-secondary flex-1 text-sm py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{item.title}</div>
                                        {item.description && (
                                            <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="text-ramadan-gold hover:text-ramadan-gold-light transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this custom item?')) {
                                                    deleteMutation.mutate(item.id);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No custom items yet</p>
                        <p className="text-xs mt-1">Click "Add Item" to create your own tracking items</p>
                    </div>
                )}
            </div>
        </div>
    );
}
