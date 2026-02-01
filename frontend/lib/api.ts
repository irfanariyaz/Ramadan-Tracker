export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Utility to normalize photo paths (fixes legacy typos like "photo s" -> "photos")
export const normalizePhotoPath = (path: string | null | undefined): string | null => {
    if (!path) return null;
    return path.replace('static/photo s/', 'static/photos/');
};

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || `API Error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API Request failed: ${url}`, error);
        throw error;
    }
}

// Family API
export const familyAPI = {
    getAll: () => fetchAPI<any[]>('/api/families'),
    getById: (id: number) => fetchAPI<any>(`/api/families/${id}`),
    create: (data: any) => fetchAPI<any>('/api/families', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetchAPI<any>(`/api/families/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchAPI<any>(`/api/families/${id}`, {
        method: 'DELETE',
    }),
};

// Member API
export const memberAPI = {
    getByFamilyId: (familyId: number) => fetchAPI<any[]>(`/api/families/${familyId}/members`),
    getById: (id: number) => fetchAPI<any>(`/api/members/${id}`),
    create: (data: any) => fetchAPI<any>('/api/members', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => fetchAPI<any>(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: number) => fetchAPI<any>(`/api/members/${id}`, {
        method: 'DELETE',
    }),
    uploadPhoto: async (memberId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/members/${memberId}/photo`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload photo');
        }

        return response.json();
    },
};

// Custom Checklist Item API
export const customItemAPI = {
    getByMemberId: (memberId: number, activeOnly: boolean = true) =>
        fetchAPI<any[]>(`/api/members/${memberId}/custom-items?active_only=${activeOnly}`),
    create: (data: any) => fetchAPI<any>('/api/custom-items', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (itemId: number, data: any) => fetchAPI<any>(`/api/custom-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (itemId: number) => fetchAPI<any>(`/api/custom-items/${itemId}`, {
        method: 'DELETE',
    }),
};

// Daily Entry API
export const dailyEntryAPI = {
    getStats: (memberId: number, date?: string) => {
        const params = date ? `?entry_date=${date}` : '';
        return fetchAPI<any>(`/api/daily-stats/${memberId}${params}`);
    },
    update: (memberId: number, date: string, data: any) =>
        fetchAPI<any>(`/api/update-entry?member_id=${memberId}&entry_date=${date}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// Family Progress API
export const progressAPI = {
    getFamily: (familyId: number, date?: string) => {
        const params = date ? `?entry_date=${date}` : '';
        return fetchAPI<any>(`/api/family-progress/${familyId}${params}`);
    },
    getMonthly: (familyId: number, month?: string) => {
        const params = month ? `?month=${month}` : '';
        return fetchAPI<any>(`/api/family/${familyId}/monthly-stats${params}`);
    },
    getLeaderboard: (familyId: number) => {
        return fetchAPI<any>(`/api/family/${familyId}/leaderboard`);
    },
};

// Prayer Times API
export const prayerTimesAPI = {
    get: (params?: { date?: string; city?: string; country?: string; latitude?: string; longitude?: string }) => {
        const queryParams = new URLSearchParams(params as any).toString();
        return fetchAPI<any>(`/api/prayer-times${queryParams ? `?${queryParams}` : ''}`);
    },
};
