import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@graphcap/ui/components/Frame/Sidebar'
import { FileTextIcon, HomeIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import * as React from 'react'

interface MainSidebarProps {
  readonly children: React.ReactNode
}

export function MainSidebar({ children }: MainSidebarProps) {
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon-only">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <SidebarTrigger />
            <h1 className="font-semibold">graphcap Manager</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Home">
                  <HomeIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Documents">
                  <FileTextIcon />  
                  <span>Providers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem> 
                <SidebarMenuButton tooltip="Settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-gray-500">v1.0.0</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children as any}
      </SidebarInset>
    </SidebarProvider>
  )
} 