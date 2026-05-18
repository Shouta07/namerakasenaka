import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { MobileAppBar } from "@/components/ui/app-bar";
import { ThreadView, type ThreadMessage } from "@/components/qa/thread-view";
import { MessageComposer } from "@/components/qa/message-composer";
import { InteractiveQaThread } from "@/components/qa/interactive-thread";

type MessageRow = {
  id: string;
  body: string | null;
  image_path: string | null;
  created_at: string;
  sender_id: string;
  is_auto_reply: boolean;
};

function demoSeedTherapist(conversationId: string): ThreadMessage[] {
  const baseDate = "2026-05-17T";
  if (conversationId === "qa-1") {
    // Therapist viewpoint — client's message is on the left ("not mine").
    return [
      {
        id: `${conversationId}-1`,
        body: "おすすめのボディソープは継続購入できますか？",
        createdAt: `${baseDate}09:00:00+09:00`,
        isMine: false,
      },
    ];
  }
  if (conversationId === "qa-2") {
    return [
      {
        id: `${conversationId}-1`,
        body: "次回の予約変更をお願いしたいです。",
        createdAt: `${baseDate}21:30:00+09:00`,
        isMine: false,
      },
    ];
  }
  return [
    {
      id: `${conversationId}-seed-1`,
      body: "ホームケアでご不明点があればいつでもご相談ください。",
      createdAt: `${baseDate}18:00:00+09:00`,
      isMine: true,
    },
  ];
}

export default async function TherapistQaThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  if (isDemoMode()) {
    const seed = demoSeedTherapist(conversationId);
    return (
      <div className="flex flex-col">
        <MobileAppBar title="会話" eyebrow="Q&A" backHref="/t/qa" />
        <h1 className="hidden text-xl font-semibold md:block">会話</h1>
        <InteractiveQaThread
          conversationId={conversationId}
          seed={seed}
          viewerLabel="セラピスト"
        />
      </div>
    );
  }
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
    <div className="flex flex-col">
      <MobileAppBar title="会話" eyebrow="Q&A" backHref="/t/qa" />
      <h1 className="hidden text-xl font-semibold md:block">会話</h1>
      <div className="flex-1 overflow-y-auto pb-2 pr-1 md:mt-4">
        <ThreadView messages={messages} />
      </div>
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
