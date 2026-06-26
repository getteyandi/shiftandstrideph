import { Home, Calendar, Upload, Trophy } from '@/lib/icons';
import { ClipboardList, Folder, Users } from 'lucide-react';
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
export const ADMIN_NAV_ITEMS: NavItem[] = [
    {
        id: 'admin-dashboard',
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: Home,
    },
    {
        id: 'events',
        label: 'Events',
        href: '/admin/events',
        icon: Calendar,
    },
    {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        id: 'registrations',
        label: 'Registrations',
        href: '/admin/registrations',
        icon: ClipboardList,
    },
    {
        id: 'runs',
        label: 'Run Submissions',
        href: '/admin/run-submissions',
        icon: Upload,
    },
    {
        id: 'halloffame',
        label: 'Hall of Fame',
        href: '/leaderboards',
        icon: Trophy,
    },
];

export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
    { id: 'events', label: 'Events', href: '/events', icon: Calendar },
    {
        id: 'submit',
        label: 'Submit Run',
        href: '/run-submissions',
        icon: Upload,
    },
    {
        id: 'halloffame',
        label: 'Hall of Fame',
        href: '/leaderboards',
        icon: Trophy,
    },
];

