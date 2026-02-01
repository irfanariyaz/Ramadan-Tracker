export interface Family {
    id: number;
    name: string;
    location_city?: string;
    location_country?: string;
    latitude?: string;
    longitude?: string;
    created_at: string;
}

export interface FamilyMember {
    id: number;
    family_id: number;
    name: string;
    photo_path?: string;
    created_at: string;
}

export interface CustomChecklistItem {
    id: number;
    member_id: number;
    title: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

export interface DailyEntry {
    id: number;
    member_id: number;
    date: string;
    fasting_status: "fasting" | "not_fasting" | "excused";
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    taraweeh: boolean;
    quran_juz: number;
    quran_page: number;
    daily_goal?: string;
    custom_items?: Record<string, boolean>;
    created_at: string;
    updated_at: string;
}

export interface PrayerTimes {
    date: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

export interface MemberProgress {
    member_id: number;
    member_name: string;
    photo_path?: string;
    fasting_status: string;
    prayers_completed: number;
    quran_progress: number;
    daily_goal?: string;
}

export interface FamilyProgress {
    family_id: number;
    family_name: string;
    date: string;
    members: MemberProgress[];
}
