import { Command } from "cmdk";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Check } from "lucide-react";
import { TIssue, TIssuePriorities } from "@plane/types";
// mobx store
import { PriorityIcon } from "@plane/ui";
import { EIssuesStoreType, ISSUE_PRIORITIES } from "@/constants/issue";
import { useIssues } from "@/hooks/store";
// ui
// types
// constants

type Props = {
  closePalette: () => void;
  issue: TIssue;
};

export const ChangeIssuePriority: React.FC<Props> = observer((props) => {
  const { closePalette, issue } = props;
  const { t } = useTranslation(undefined, { keyPrefix: "issue.priorities" });

  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const {
    issues: { updateIssue },
  } = useIssues(EIssuesStoreType.PROJECT);

  const submitChanges = async (formData: Partial<TIssue>) => {
    if (!workspaceSlug || !projectId || !issue) return;

    const payload = { ...formData };
    await updateIssue(workspaceSlug.toString(), projectId.toString(), issue.id, payload).catch((e) => {
      console.error(e);
    });
  };

  const handleIssueState = (priority: TIssuePriorities) => {
    submitChanges({ priority });
    closePalette();
  };

  return (
    <>
      {ISSUE_PRIORITIES.map((priority) => (
        <Command.Item key={priority.key} onSelect={() => handleIssueState(priority.key)} className="focus:outline-none">
          <div className="flex items-center space-x-3">
            <PriorityIcon priority={priority.key} />
            <span className="capitalize">{t(priority.key) ?? "None"}</span>
          </div>
          <div>{priority.key === issue.priority && <Check className="w-3 h-3" />}</div>
        </Command.Item>
      ))}
    </>
  );
});
