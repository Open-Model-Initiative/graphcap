import { Toaster } from "@graphcap/ui/components/Notifications/Toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MainNavbar } from "../components/Layout/MainNavbar";
import { MainSidebar } from "../components/Layout/MainSidebar";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <MainSidebar>
        <MainNavbar />
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
      </MainSidebar>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors />
    </QueryClientProvider>
  ),
});
