import { ReactElement } from "react";
import { observer } from "mobx-react";
// layouts
import { PageHead } from "@/components/core";
import { ProjectSettingHeader } from "@/components/headers";
import { ProjectSettingsLabelList } from "@/components/labels";
import { useProject } from "@/hooks/store";
import { AppLayout } from "@/layouts/app-layout";
import { ProjectSettingLayout } from "@/layouts/settings-layout";
// components
// types
import { NextPageWithLayout } from "@/lib/types";
// hooks
export { getStaticProps, getStaticPaths } from "@/lib/i18next";

const LabelsSettingsPage: NextPageWithLayout = observer(() => {
  const { currentProjectDetails } = useProject();
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Labels` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="w-full h-full gap-10 py-8 overflow-y-auto pr-9">
        <ProjectSettingsLabelList />
      </div>
    </>
  );
});

LabelsSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout withProjectWrapper header={<ProjectSettingHeader title="Labels Settings" />}>
      <ProjectSettingLayout>{page}</ProjectSettingLayout>
    </AppLayout>
  );
};

export default LabelsSettingsPage;
