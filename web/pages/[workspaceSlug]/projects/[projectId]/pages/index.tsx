import { useState, Fragment, ReactElement } from "react";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Tab } from "@headlessui/react";
// hooks
import { PageHead } from "@/components/core";
import { EmptyState } from "@/components/empty-state";
import { PagesHeader } from "@/components/headers";
import { RecentPagesList, CreateUpdatePageModal } from "@/components/pages";
import { PagesLoader } from "@/components/ui";
import { EmptyStateType } from "@/constants/empty-state";
import { PAGE_TABS_LIST } from "@/constants/page";
import { useApplication, useEventTracker, useUser, useProject } from "@/hooks/store";
import { useProjectPages } from "@/hooks/store/use-project-page";
import useLocalStorage from "@/hooks/use-local-storage";
import useUserAuth from "@/hooks/use-user-auth";
import useSize from "@/hooks/use-window-size";
// layouts
import { AppLayout } from "@/layouts/app-layout";
// components
// types
import { NextPageWithLayout } from "@/lib/types";
// constants
export {getStaticProps,getStaticPaths} from "@/lib/i18next";

const AllPagesList = dynamic<any>(() => import("@/components/pages").then((a) => a.AllPagesList), {
  ssr: false,
});

const FavoritePagesList = dynamic<any>(() => import("@/components/pages").then((a) => a.FavoritePagesList), {
  ssr: false,
});

const PrivatePagesList = dynamic<any>(() => import("@/components/pages").then((a) => a.PrivatePagesList), {
  ssr: false,
});

const ArchivedPagesList = dynamic<any>(() => import("@/components/pages").then((a) => a.ArchivedPagesList), {
  ssr: false,
});

const SharedPagesList = dynamic<any>(() => import("@/components/pages").then((a) => a.SharedPagesList), {
  ssr: false,
});

const ProjectPagesPage: NextPageWithLayout = observer(() => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // states
  const [createUpdatePageModal, setCreateUpdatePageModal] = useState(false);
  // store hooks
  const { currentUser, currentUserLoader } = useUser();
  const {
    commandPalette: { toggleCreatePageModal },
  } = useApplication();
  const { setTrackElement } = useEventTracker();
  const { getProjectById } = useProject();
  const { fetchProjectPages, fetchArchivedProjectPages, loader, archivedPageLoader, projectPageIds, archivedPageIds } =
    useProjectPages();
  // hooks
  const {} = useUserAuth({ user: currentUser, isLoading: currentUserLoader });
  const [windowWidth] = useSize();
  // local storage
  const { storedValue: pageTab, setValue: setPageTab } = useLocalStorage("pageTab", "Recent");
  // fetching pages from API
  useSWR(
    workspaceSlug && projectId ? `ALL_PAGES_LIST_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchProjectPages(workspaceSlug.toString(), projectId.toString()) : null
  );
  // fetching archived pages from API
  useSWR(
    workspaceSlug && projectId ? `ALL_ARCHIVED_PAGES_LIST_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchArchivedProjectPages(workspaceSlug.toString(), projectId.toString()) : null
  );

  const currentTabValue = (tab: string | null) => {
    switch (tab) {
      case "Recent":
        return 0;
      case "All":
        return 1;
      case "Favorites":
        return 2;
      case "Private":
        return 3;
      case "Shared":
        return 4;
      case "Archived":
        return 5;
      default:
        return 0;
    }
  };

  // derived values
  const project = projectId ? getProjectById(projectId.toString()) : undefined;
  const pageTitle = project?.name ? `${project?.name} - Pages` : undefined;

  const MobileTabList = () => (
    <Tab.List as="div" className="flex items-center justify-between px-3 pt-3 mb-4 border-b border-custom-border-200">
      <div className="flex flex-wrap items-center gap-4">
        {PAGE_TABS_LIST.map((tab) => (
          <Tab
            key={tab.key}
            className={({ selected }) =>
              `text-sm outline-none pb-3 ${
                selected ? "border-custom-primary-100 text-custom-primary-100 border-b" : ""
              }`
            }
          >
            {tab.title}
          </Tab>
        ))}
      </div>
    </Tab.List>
  );

  if (loader || archivedPageLoader) return <PagesLoader />;

  return (
    <>
      <PageHead title={pageTitle} />
      {projectPageIds && archivedPageIds && projectPageIds.length + archivedPageIds.length > 0 ? (
        <>
          {workspaceSlug && projectId && (
            <CreateUpdatePageModal
              isOpen={createUpdatePageModal}
              handleClose={() => setCreateUpdatePageModal(false)}
              projectId={projectId.toString()}
            />
          )}
          <div className="flex flex-col h-full overflow-hidden md:space-y-5 md:py-6">
            <div className="justify-between hidden gap-4 px-6 md:flex">
              <h3 className="text-2xl font-semibold text-custom-text-100">Pages</h3>
            </div>
            <Tab.Group
              as={Fragment}
              defaultIndex={currentTabValue(pageTab)}
              onChange={(i) => {
                switch (i) {
                  case 0:
                    return setPageTab("Recent");
                  case 1:
                    return setPageTab("All");
                  case 2:
                    return setPageTab("Favorites");
                  case 3:
                    return setPageTab("Private");
                  case 4:
                    return setPageTab("Shared");
                  case 5:
                    return setPageTab("Archived");
                  default:
                    return setPageTab("All");
                }
              }}
            >
              {windowWidth < 768 ? (
                <MobileTabList />
              ) : (
                <Tab.List as="div" className="items-center justify-between hidden px-6 mb-6 md:flex">
                  <div className="flex flex-wrap items-center gap-4">
                    {PAGE_TABS_LIST.map((tab) => (
                      <Tab
                        key={tab.key}
                        className={({ selected }) =>
                          `rounded-full border px-5 py-1.5 text-sm outline-none ${
                            selected
                              ? "border-custom-primary bg-custom-primary text-white"
                              : "border-custom-border-200 bg-custom-background-100 hover:bg-custom-background-90"
                          }`
                        }
                      >
                        {tab.title}
                      </Tab>
                    ))}
                  </div>
                </Tab.List>
              )}

              <Tab.Panels as={Fragment}>
                <Tab.Panel as="div" className="h-full pl-6 space-y-5 overflow-y-auto vertical-scrollbar scrollbar-lg">
                  <RecentPagesList />
                </Tab.Panel>
                <Tab.Panel as="div" className="h-full pl-6 overflow-hidden">
                  <AllPagesList />
                </Tab.Panel>
                <Tab.Panel as="div" className="h-full pl-6 overflow-hidden">
                  <FavoritePagesList />
                </Tab.Panel>
                <Tab.Panel as="div" className="h-full pl-6 overflow-hidden">
                  <PrivatePagesList />
                </Tab.Panel>
                <Tab.Panel as="div" className="h-full pl-6 overflow-hidden">
                  <SharedPagesList />
                </Tab.Panel>
                <Tab.Panel as="div" className="h-full pl-6 overflow-hidden">
                  <ArchivedPagesList />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </>
      ) : (
        <EmptyState
          type={EmptyStateType.PROJECT_PAGE}
          primaryButtonOnClick={() => {
            setTrackElement("Pages empty state");
            toggleCreatePageModal(true);
          }}
        />
      )}
    </>
  );
});

ProjectPagesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<PagesHeader />} withProjectWrapper>
      {page}
    </AppLayout>
  );
};

export default ProjectPagesPage;
