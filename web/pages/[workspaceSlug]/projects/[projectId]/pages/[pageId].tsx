import { ReactElement, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { Sparkle } from "lucide-react";
import { DocumentEditorWithRef, DocumentReadOnlyEditorWithRef } from "@plane/document-editor";
import { IPage } from "@plane/types";
// hooks

import { Spinner, TOAST_TYPE, setToast } from "@plane/ui";
import { GptAssistantPopover, PageHead } from "@/components/core";
import { PageDetailsHeader } from "@/components/headers/page-details";
import { IssuePeekOverview } from "@/components/issues";
import { EUserProjectRoles } from "@/constants/project";
import { getDate } from "@/helpers/date-time.helper";
import { useApplication, usePage, useUser, useWorkspace } from "@/hooks/store";
import { useProjectPages } from "@/hooks/store/use-project-specific-pages";
import useReloadConfirmations from "@/hooks/use-reload-confirmation";
// services
import { AppLayout } from "@/layouts/app-layout";
import { NextPageWithLayout } from "@/lib/types";
import { FileService } from "@/services/file.service";
export {getStaticProps,getStaticPaths} from "@/lib/i18next";
// layouts
// components
// ui
// assets
// helpers
// types
// fetch-keys
// constants

// services
const fileService = new FileService();

const PageDetailsPage: NextPageWithLayout = observer(() => {
  // states
  const [gptModalOpen, setGptModal] = useState(false);
  // refs
  const editorRef = useRef<any>(null);
  // router
  const router = useRouter();

  const { workspaceSlug, projectId, pageId } = router.query;
  const workspaceStore = useWorkspace();
  const workspaceId = workspaceStore.getWorkspaceBySlug(workspaceSlug as string)?.id as string;

  // store hooks
  const {
    config: { envConfig },
  } = useApplication();
  const {
    currentUser,
    membership: { currentProjectRole },
  } = useUser();

  const { handleSubmit, getValues, control, reset } = useForm<IPage>({
    defaultValues: { name: "", description_html: "" },
  });

  const {
    archivePage: archivePageAction,
    restorePage: restorePageAction,
    createPage: createPageAction,
    projectPageMap,
    projectArchivedPageMap,
    fetchProjectPages,
    fetchArchivedProjectPages,
  } = useProjectPages();

  useSWR(
    workspaceSlug && projectId ? `ALL_PAGES_LIST_${projectId}` : null,
    workspaceSlug && projectId && !projectPageMap[projectId as string] && !projectArchivedPageMap[projectId as string]
      ? () => fetchProjectPages(workspaceSlug.toString(), projectId.toString())
      : null
  );
  // fetching archived pages from API
  useSWR(
    workspaceSlug && projectId ? `ALL_ARCHIVED_PAGES_LIST_${projectId}` : null,
    workspaceSlug && projectId && !projectArchivedPageMap[projectId as string] && !projectPageMap[projectId as string]
      ? () => fetchArchivedProjectPages(workspaceSlug.toString(), projectId.toString())
      : null
  );

  const pageStore = usePage(pageId as string);

  const { setShowAlert } = useReloadConfirmations(pageStore?.isSubmitting === "submitting");

  useEffect(
    () => () => {
      if (pageStore) {
        pageStore.cleanup();
      }
    },
    [pageStore]
  );

  if (!pageStore) {
    return (
      <div className="grid w-full h-full place-items-center">
        <Spinner />
      </div>
    );
  }

  // We need to get the values of title and description from the page store but we don't have to subscribe to those values
  const pageTitle = pageStore?.name;
  const pageDescription = pageStore?.description_html;
  const {
    lockPage: lockPageAction,
    unlockPage: unlockPageAction,
    updateName: updateNameAction,
    updateDescription: updateDescriptionAction,
    id: pageIdMobx,
    isSubmitting,
    setIsSubmitting,
    owned_by,
    is_locked,
    archived_at,
    created_at,
    created_by,
    updated_at,
    updated_by,
  } = pageStore;

  const updatePage = async (formData: IPage) => {
    if (!workspaceSlug || !projectId || !pageId) return;
    updateDescriptionAction(formData.description_html);
  };

  const handleAiAssistance = async (response: string) => {
    if (!workspaceSlug || !projectId || !pageId) return;

    editorRef.current?.setEditorValueAtCursorPosition(response);
  };

  const actionCompleteAlert = ({
    title,
    message,
    type,
  }: {
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }) => {
    setToast({
      title,
      message,
      type: type as TOAST_TYPE,
    });
  };

  const updatePageTitle = (title: string) => {
    if (!workspaceSlug || !projectId || !pageId) return;
    updateNameAction(title);
  };

  const createPage = async (payload: Partial<IPage>) => {
    if (!workspaceSlug || !projectId) return;
    await createPageAction(workspaceSlug as string, projectId as string, payload);
  };

  // ================ Page Menu Actions ==================
  const duplicate_page = async () => {
    const currentPageValues = getValues();

    if (!currentPageValues?.description_html) {
      // TODO: We need to get latest data the above variable will give us stale data
      currentPageValues.description_html = pageDescription as string;
    }

    const formData: Partial<IPage> = {
      name: "Copy of " + pageTitle,
      description_html: currentPageValues.description_html,
    };

    try {
      await createPage(formData);
    } catch (error) {
      actionCompleteAlert({
        title: `Page could not be duplicated`,
        message: `Sorry, page could not be duplicated, please try again later`,
        type: "error",
      });
    }
  };

  const archivePage = async () => {
    if (!workspaceSlug || !projectId || !pageId) return;
    try {
      await archivePageAction(workspaceSlug as string, projectId as string, pageId as string);
    } catch (error) {
      actionCompleteAlert({
        title: `Page could not be archived`,
        message: `Sorry, page could not be archived, please try again later`,
        type: "error",
      });
    }
  };

  const unArchivePage = async () => {
    if (!workspaceSlug || !projectId || !pageId) return;
    try {
      await restorePageAction(workspaceSlug as string, projectId as string, pageId as string);
    } catch (error) {
      actionCompleteAlert({
        title: `Page could not be restored`,
        message: `Sorry, page could not be restored, please try again later`,
        type: "error",
      });
    }
  };

  const lockPage = async () => {
    if (!workspaceSlug || !projectId || !pageId) return;
    try {
      await lockPageAction();
    } catch (error) {
      actionCompleteAlert({
        title: `Page could not be locked`,
        message: `Sorry, page could not be locked, please try again later`,
        type: "error",
      });
    }
  };

  const unlockPage = async () => {
    if (!workspaceSlug || !projectId || !pageId) return;
    try {
      await unlockPageAction();
    } catch (error) {
      actionCompleteAlert({
        title: `Page could not be unlocked`,
        message: `Sorry, page could not be unlocked, please try again later`,
        type: "error",
      });
    }
  };

  const isPageReadOnly =
    is_locked ||
    archived_at ||
    (currentProjectRole && [EUserProjectRoles.VIEWER, EUserProjectRoles.GUEST].includes(currentProjectRole));

  const isCurrentUserOwner = owned_by === currentUser?.id;

  const userCanDuplicate =
    currentProjectRole && [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER].includes(currentProjectRole);
  const userCanArchive = isCurrentUserOwner || currentProjectRole === EUserProjectRoles.ADMIN;
  const userCanLock =
    currentProjectRole && [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER].includes(currentProjectRole);

  return pageIdMobx ? (
    <>
      <PageHead title={pageTitle} />
      <div className="flex flex-col justify-between h-full">
        <div className="w-full h-full overflow-hidden">
          {isPageReadOnly ? (
            <DocumentReadOnlyEditorWithRef
              onActionCompleteHandler={actionCompleteAlert}
              ref={editorRef}
              value={pageDescription}
              customClassName={"tracking-tight w-full px-0"}
              borderOnFocus={false}
              noBorder
              documentDetails={{
                title: pageTitle,
                created_by: created_by,
                created_on: getDate(created_at) ?? new Date(created_at ?? ""),
                last_updated_at: getDate(updated_at) ?? new Date(created_at ?? ""),
                last_updated_by: updated_by,
              }}
              pageLockConfig={userCanLock && !archived_at ? { action: unlockPage, is_locked: is_locked } : undefined}
              pageDuplicationConfig={userCanDuplicate && !archived_at ? { action: duplicate_page } : undefined}
              pageArchiveConfig={
                userCanArchive
                  ? {
                      action: archived_at ? unArchivePage : archivePage,
                      is_archived: archived_at ? true : false,
                      archived_at: getDate(archived_at),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <Controller
                name="description_html"
                control={control}
                render={({ field: { onChange } }) => (
                  <DocumentEditorWithRef
                    isSubmitting={isSubmitting}
                    documentDetails={{
                      title: pageTitle,
                      created_by: created_by,
                      created_on: getDate(created_at) ?? new Date(created_at ?? ""),
                      last_updated_at: getDate(updated_at) ?? new Date(created_at ?? ""),
                      last_updated_by: updated_by,
                    }}
                    uploadFile={fileService.getUploadFileFunction(workspaceSlug as string)}
                    deleteFile={fileService.getDeleteImageFunction(workspaceId)}
                    restoreFile={fileService.getRestoreImageFunction(workspaceId)}
                    value={pageDescription}
                    setShouldShowAlert={setShowAlert}
                    cancelUploadImage={fileService.cancelUpload}
                    ref={editorRef}
                    debouncedUpdatesEnabled={false}
                    setIsSubmitting={setIsSubmitting}
                    updatePageTitle={updatePageTitle}
                    onActionCompleteHandler={actionCompleteAlert}
                    customClassName="tracking-tight self-center h-full w-full right-[0.675rem]"
                    onChange={(_description_json: any, description_html: string) => {
                      setShowAlert(true);
                      onChange(description_html);
                      handleSubmit(updatePage)();
                    }}
                    duplicationConfig={userCanDuplicate ? { action: duplicate_page } : undefined}
                    pageArchiveConfig={
                      userCanArchive
                        ? {
                            is_archived: archived_at ? true : false,
                            action: archived_at ? unArchivePage : archivePage,
                          }
                        : undefined
                    }
                    pageLockConfig={userCanLock ? { is_locked: false, action: lockPage } : undefined}
                  />
                )}
              />
              {projectId && envConfig?.has_openai_configured && (
                <div className="absolute right-[68px] top-2.5">
                  <GptAssistantPopover
                    isOpen={gptModalOpen}
                    projectId={projectId.toString()}
                    handleClose={() => {
                      setGptModal((prevData) => !prevData);
                      // this is done so that the title do not reset after gpt popover closed
                      reset(getValues());
                    }}
                    onResponse={(response) => {
                      handleAiAssistance(response);
                    }}
                    placement="top-end"
                    button={
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs hover:bg-custom-background-90"
                        onClick={() => setGptModal((prevData) => !prevData)}
                      >
                        <Sparkle className="w-4 h-4" />
                        AI
                      </button>
                    }
                    className="!min-w-[38rem]"
                  />
                </div>
              )}
            </div>
          )}
          <IssuePeekOverview />
        </div>
      </div>
    </>
  ) : (
    <div className="grid w-full h-full place-items-center">
      <Spinner />
    </div>
  );
});

PageDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<PageDetailsHeader />} withProjectWrapper>
      {page}
    </AppLayout>
  );
};

export default PageDetailsPage;
