import { Link } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    Flag,
    FolderGit2,
    Footprints,
    History,
    LayoutGrid,
    ListTree,
    Trophy,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    // PARTICIPANT
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Events',
        href: '/events',
        icon: CalendarDays,
    },
    {
        title: 'Submit Run',
        href: '/run-submissions',
        icon: Footprints,
    },
    {
        title: 'My Runs',
        href: '/my-runs',
        icon: History,
    },
    {
        title: 'Leaderboards',
        href: '/leaderboards',
        icon: Trophy,
    },

    // ADMIN
    {
        title: 'Manage Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Manage Events',
        href: '/admin/events',
        icon: Flag,
    },
    {
        title: 'Event Categories',
        href: '/admin/event-categories',
        icon: ListTree,
    },
    {
        title: 'Registrations',
        href: '/admin/registrations',
        icon: ClipboardList,
    },
    {
        title: 'Run Submissions',
        href: '/admin/run-submissions',
        icon: ClipboardCheck,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
