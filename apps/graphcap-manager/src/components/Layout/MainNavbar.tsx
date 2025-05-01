import { Link } from "@tanstack/react-router";
import { HomeIcon, InfoIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@graphcap/ui/components/Frame/NavigationMenu/NavigationMenu";

export function MainNavbar() {
  return (
    <div className="bg-background border-b">
      <div className="container flex h-14 items-center px-4">
        <NavigationMenu className="max-w-none w-full justify-start">
          <NavigationMenuList className="justify-start space-x-4">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/"
                  className="[&.active]:font-bold"
                  activeProps={{ className: "data-[active=true]" }}
                >
                  <div className="inline-flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    <span>Home</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/about"
                  className="[&.active]:font-bold"
                  activeProps={{ className: "data-[active=true]" }}
                >
                  <div className="inline-flex items-center gap-2">
                    <InfoIcon className="h-4 w-4" />
                    <span>About</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
} 