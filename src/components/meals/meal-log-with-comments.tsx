import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";
import { CommentComposer } from "@/components/meals/comment-composer";

export type SalonComment = {
  id: string;
  body: string;
  author_role: "therapist" | "salon_admin";
  created_at: string;
};

export type MealLogWithComments = {
  id: string;
  meal_type: MealType;
  memo: string | null;
  logged_at: string;
  comments: SalonComment[];
};

export function MealLogWithCommentsList({
  rows,
  composer = true,
}: {
  rows: MealLogWithComments[];
  composer?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        食事ログはまだありません。
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((m) => (
        <Card key={m.id}>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge tone="brand">{MEAL_TYPE_LABEL[m.meal_type]}</Badge>
              <span className="text-xs text-stone-500">
                {new Date(m.logged_at).toLocaleString("ja-JP")}
              </span>
            </div>
            {m.memo ? (
              <p className="mt-2 text-sm text-stone-700">{m.memo}</p>
            ) : null}
            {m.comments.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-stone-100 pt-3">
                {m.comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-md bg-stone-50 px-3 py-2 text-xs"
                  >
                    <p className="font-medium text-stone-700">
                      {c.author_role === "therapist"
                        ? "セラピスト"
                        : "サロン管理者"}
                      <span className="ml-2 text-stone-400">
                        {new Date(c.created_at).toLocaleString("ja-JP")}
                      </span>
                    </p>
                    <p className="mt-1 text-stone-600">{c.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {composer ? <CommentComposer mealLogId={m.id} /> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
