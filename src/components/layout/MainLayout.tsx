import * as React from 'react';
import Link from 'next/link';
import { Home, List, Settings, User } from 'lucide-react';

import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
    SidebarInset
} from '@/components/ui/sidebar';
import { Header } from './Header'; // Import the Header component
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string; // Add title prop
  showAddButton?: boolean; // Prop to control Add button visibility in Header
}

export function MainLayout({ children, title, showAddButton }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
             {/* Placeholder for Logo if needed */}
             <User className="h-6 w-6" /> {/* Or a custom logo icon */}
             <span>ProfileAce</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home">
                <Link href="/">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Manage Statuses">
                <Link href="/statuses">
                  <List />
                  <span>Statuses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Add more menu items here if needed */}
          </SidebarMenu>
        </SidebarContent>
        {/* <SidebarFooter>
           Optional Footer Content
        </SidebarFooter> */}
      </Sidebar>
      <SidebarInset className="flex flex-col">
         {/* Mobile Trigger */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
           <SidebarTrigger className="sm:hidden" />
           <h1 className="text-lg font-semibold grow">{title}</h1>
           {/* Optional mobile-specific actions */}
         </header>
         {/* Desktop Header */}
         <Header title={title} showAddButton={showAddButton} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
