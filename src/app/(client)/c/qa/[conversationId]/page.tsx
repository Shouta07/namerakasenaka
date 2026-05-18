import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { MobileAppBar } from "@/components/ui/app-bar";
import { ThreadView, type ThreadMessage } from "@/components/qa/thread-view";
import { MessageComposer } from "@/components/qa/message-composer";

type MessageRow = {
  id: string;
  body: string | null;
  image_path: string | null;
  created_at: string;
  sender_id: string;
  is_auto_reply: boolean;
};

export default async function ClientQaThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  if (isDemoMode()) {
    return (
      <div className="flex flex-col">
        <MobileAppBar title="会話" eyebrow="Q&A" backHref="/c/qa" />
        <h1 className="hidden text-xl font-semibold md:block">会話</h1>
        <p className="mt-2 text-xs text-stone-500">
          サンプル表示ではメッセージの送受信は行いません。
        </p>
      </div>
    );
  }
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("messages")
    .select("id, body, image_path, created_at, sender_id, is_auto_reply")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as MessageRow[];

  const messages: ThreadMessage[] = rows.map((m) => ({
    id: m.id,
    body: m.body,
    imageUrl: null,
    createdAt: m.created_at,
    isMine: m.sender_id === user?.id,
    isAutoReply: m.is_auto_reply,
  }));

  return (
    <div className="flex flex-col">
      <MobileAppBar title="会話" eyebrow="Q&A" backHref="/c/qa" />
      <h1 className="hidden text-xl font-semibold md:block">会話</h1>
      <div className="flex-1 overflow-y-auto pb-2 pr-1 md:mt-4">
        <ThreadView messages={messages} />
      </div>
      {/* Sticky composer pinned above bottom nav + safe area. */}
      <div
        className="sticky -mx-4 mt-3 border-t border-stone-200 bg-white/95 px-4 pt-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0"
        style={{
          bottom: "calc(64px + max(var(--safe-bottom), 0px))",
          paddingBottom: "max(var(--safe-bottom), 8px)",
        }}
      >
        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
}
