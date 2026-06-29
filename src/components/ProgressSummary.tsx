import type { CSSProperties } from "react";
import { getCompletionPercent } from "../utils";

type ProgressSummaryProps = {
  completedCount: number;
  totalCount: number;
  monthKey: string;
};

export function ProgressSummary({ completedCount, totalCount, monthKey }: ProgressSummaryProps) {
  const percent = getCompletionPercent(completedCount, totalCount);

  return (
    <section className="progress-panel" aria-label="Monthly completion progress">
      <div>
        <p className="eyebrow">{monthKey}</p>
        <h2>{percent}% complete</h2>
        <p>
          {completedCount} of {totalCount} store walks marked complete.
        </p>
      </div>

      <div
        className="progress-ring"
        aria-label={`${percent}% complete`}
        style={{ "--progress": `${percent}%` } as CSSProperties}
      >
        <span>{percent}%</span>
      </div>
    </section>
  );
}
