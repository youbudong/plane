import { FC, ReactNode } from "react";
// layout
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronDown } from "lucide-react";
import { CustomMenu } from "@plane/ui";
import { SidebarHamburgerToggle } from "@/components/core/sidebar/sidebar-menu-hamburger-toggle";
import { useApplication } from "@/hooks/store";
import { ProfileSettingsLayout } from "@/layouts/settings-layout";
import { ProfilePreferenceSettingsSidebar } from "./sidebar";
import { useTranslation } from "next-i18next";

interface IProfilePreferenceSettingsLayout {
  children: ReactNode;
  header?: ReactNode;
}

export const ProfilePreferenceSettingsLayout: FC<IProfilePreferenceSettingsLayout> = (props) => {
  const { children, header } = props;
  const router = useRouter();
  const { theme: themeStore } = useApplication();
  const {t} = useTranslation();

  const showMenuItem = () => {
    const item = router.asPath.split("/");
    let splittedItem = item[item.length - 1];
    splittedItem = splittedItem.replace(splittedItem[0], splittedItem[0].toUpperCase());
    return splittedItem;
  };

  const profilePreferenceLinks: Array<{
    label: string;
    href: string;
  }> = [
    {
      label: "profile.preferences.theme",
      href: `/profile/preferences/theme`,
    },
    {
      label: "email",
      href: `/profile/preferences/email`,
    },
  ];

  return (
    <ProfileSettingsLayout
      header={
        <div className="flex items-center justify-start flex-shrink-0 gap-4 p-4 border-b md:hidden border-custom-border-200">
          <SidebarHamburgerToggle onClick={() => themeStore.toggleSidebar()} />
          <CustomMenu
            maxHeight={"md"}
            className="flex justify-center flex-grow text-sm text-custom-text-200"
            placement="bottom-start"
            customButton={
              <div className="flex gap-2 items-center px-2 py-1.5 border rounded-md border-custom-border-400">
                <span className="flex justify-center flex-grow text-sm text-custom-text-200">{showMenuItem()}</span>
                <ChevronDown className="w-4 h-4 text-custom-text-400" />
              </div>
            }
            customButtonClassName="flex flex-grow justify-start text-custom-text-200 text-sm"
          >
            <></>
            {profilePreferenceLinks.map((link) => (
              <CustomMenu.MenuItem className="flex items-center gap-2" key={link.href}>
                <Link key={link.href} href={link.href} className="w-full text-custom-text-300">
                  {t(link.label)}
                </Link>
              </CustomMenu.MenuItem>
            ))}
          </CustomMenu>
        </div>
      }
    >
      <div className="relative flex w-full h-screen overflow-hidden">
        <ProfilePreferenceSettingsSidebar />
        <main className="relative flex flex-col w-full h-full overflow-hidden bg-custom-background-100">
          {header}
          <div className="w-full h-full overflow-hidden">{children}</div>
        </main>
      </div>
    </ProfileSettingsLayout>
  );
};
