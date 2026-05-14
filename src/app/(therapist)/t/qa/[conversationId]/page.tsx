import { getServerSupabase } from "@/lib/supabase/server";
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

export default async function TherapistQaThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <h1 className="text-xl font-semibold">会話</h1>
      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <ThreadView messages={messages} />
      </div>
      <div className="mt-4">
        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
}
