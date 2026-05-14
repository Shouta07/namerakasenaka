import { cn } from "@/lib/utils/cn";

export type ThreadMessage = {
  id: string;
  body: string | null;
  imageUrl?: string | null;
  createdAt: string;
  isMine: boolean;
  isAutoReply?: boolean;
};

export function ThreadView({ messages }: { messages: ThreadMessage[] }) {
  return (
    <ol className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className={cn("flex", m.isMine ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
              m.isMine
                ? "bg-brand-500 text-white"
                : m.isAutoReply
                ? "bg-stone-100 text-stone-600 italic"
                : "bg-white text-stone-900 border border-stone-200",
            )}
          >
            {m.body ? <p className="whitespace-pre-wrap">{m.body}</p> : null}
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.imageUrl} alt="添付" className="mt-2 max-h-64 rounded-lg" />
            ) : null}
            <p className={cn("mt-1 text-[10px]", m.isMine ? "text-brand-50" : "text-stone-400")}>
              {new Date(m.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
