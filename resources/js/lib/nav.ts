import { Home, Calendar, Upload, Trophy } from '@/lib/icons';
import { ClipboardList, Users, Package, ShieldCheck } from 'lucide-react';
import { type ComponentType } from 'react';

type IconType = ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
}>;

export interface NavItem {
    id: string;
    label: string;
    /** A leaf item has an href; a group item has children instead. */
    href?: string;
    icon: IconType;
    children?: NavItem[];
}

/**
 * Admin navigation. Related review queues are grouped under an "Approvals"
 * dropdown to keep the bar compact.
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
        id: 'approvals',
        label: 'Approvals',
        icon: ShieldCheck,
        children: [
            {
                id: 'users',
                label: 'Runners',
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
        ],
    },
    {
        id: 'shipments',
        label: 'Shipments',
        href: '/admin/shipments',
        icon: Package,
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
        id: 'shipments',
        label: 'Shipments',
        href: '/shipments',
        icon: Package,
    },
    {
        id: 'halloffame',
        label: 'Hall of Fame',
        href: '/leaderboards',
        icon: Trophy,
    },
];
