import { ReactElement, useState } from "react";
import { observer } from "mobx-react";
//hooks
import { Button } from "@plane/ui";
import { PageHead } from "@/components/core";
import { SidebarHamburgerToggle } from "@/components/core/sidebar/sidebar-menu-hamburger-toggle";
import { ProfileActivityListPage } from "@/components/profile";
import { useApplication } from "@/hooks/store";
// layouts
import { ProfileSettingsLayout } from "@/layouts/settings-layout";
// components
// ui
// type
import { NextPageWithLayout } from "@/lib/types";
export {getStaticProps} from "@/lib/i18next";

const PER_PAGE = 100;

const ProfileActivityPage: NextPageWithLayout = observer(() => {
  // states
  const [pageCount, setPageCount] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  // store hooks
  const { theme: themeStore } = useApplication();

  const updateTotalPages = (count: number) => setTotalPages(count);

  const updateResultsCount = (count: number) => setResultsCount(count);

  const handleLoadMore = () => setPageCount((prev) => prev + 1);

  const activityPages: JSX.Element[] = [];
  for (let i = 0; i < pageCount; i++)
    activityPages.push(
      <ProfileActivityListPage
        key={i}
        cursor={`${PER_PAGE}:${i}:0`}
        perPage={PER_PAGE}
        updateResultsCount={updateResultsCount}
        updateTotalPages={updateTotalPages}
      />
    );

  const isLoadMoreVisible = pageCount < totalPages && resultsCount !== 0;

  return (
    <>
      <PageHead title="Profile - Activity" />
      <section className="flex flex-col w-full h-full px-8 pb-8 mx-auto overflow-hidden lg:w-3/5">
        <div className="flex items-center border-b border-custom-border-100 gap-4 pb-3.5 mt-5 md:mt-16">
          <SidebarHamburgerToggle onClick={() => themeStore.toggleSidebar()} />
          <h3 className="text-xl font-medium">Activity</h3>
        </div>
        <div className="flex flex-col w-full h-full overflow-y-auto vertical-scrollbar scrollbar-md">
          {activityPages}
          {isLoadMoreVisible && (
            <div className="flex items-center justify-center w-full text-xs">
              <Button variant="accent-primary" size="sm" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
});

ProfileActivityPage.getLayout = function getLayout(page: ReactElement) {
  return <ProfileSettingsLayout>{page}</ProfileSettingsLayout>;
};

export default ProfileActivityPage;
