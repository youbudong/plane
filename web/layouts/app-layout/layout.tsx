import { FC, ReactNode } from "react";
import { observer } from "mobx-react-lite";
// components
import { CommandPalette } from "@/components/command-palette";
import { SidebarHamburgerToggle } from "@/components/core/sidebar/sidebar-menu-hamburger-toggle";
// layouts
import { UserAuthWrapper, WorkspaceAuthWrapper, ProjectAuthWrapper } from "@/layouts/auth-layout";
import { AppSidebar } from "./sidebar";

export interface IAppLayout {
  children: ReactNode;
  header: ReactNode;
  withProjectWrapper?: boolean;
  mobileHeader?: ReactNode;
}

export const AppLayout: FC<IAppLayout> = observer((props) => {
  const { children, header, withProjectWrapper = false, mobileHeader } = props;

  return (
    <>
      <UserAuthWrapper>
        <CommandPalette />
        <WorkspaceAuthWrapper>
          <div className="relative flex w-full h-screen overflow-hidden">
            <AppSidebar />
            <main className="relative flex flex-col w-full h-full overflow-hidden bg-custom-background-100">
              <div className="z-[15]">
                <div className="z-10 flex items-center w-full border-b border-custom-border-200">
                  <div className="block py-4 pl-5 bg-custom-sidebar-background-100 md:hidden">
                    <SidebarHamburgerToggle />
                  </div>
                  <div className="w-full">{header}</div>
                </div>
                {mobileHeader && mobileHeader}
              </div>
              <div className="w-full h-full overflow-hidden">
                <div className="relative w-full h-full overflow-x-hidden overflow-y-scroll">
                  {withProjectWrapper ? <ProjectAuthWrapper>{children}</ProjectAuthWrapper> : <>{children}</>}
                </div>
              </div>
            </main>
          </div>
        </WorkspaceAuthWrapper>
      </UserAuthWrapper>
    </>
  );
});
