import { Home, Calendar, Upload, Trophy, Shield } from '@/lib/icons';
import { type ComponentType } from 'react';

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: ComponentType<{
        size?: number | string;
        strokeWidth?: number | string;
    }>;
}

/**
 * Primary navigation. `href` values assume the conventional Inertia route names
 * below — adjust to match your `routes/web.php` if they differ.
 */
export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
    { id: 'events', label: 'Events', href: '/events', icon: Calendar },
    { id: 'submit', label: 'Submit Run', href: '/runs/create', icon: Upload },
    {
        id: 'halloffame',
        label: 'Hall of Fame',
        href: '/hall-of-fame',
        icon: Trophy,
    },
    { id: 'admin', label: 'Admin', href: '/admin/verification', icon: Shield },
];
