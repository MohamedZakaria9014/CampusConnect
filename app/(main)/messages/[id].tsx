import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Code,
  X,
  Trash2,
} from "lucide-react-native";
import { useThemeStore } from "../../../src/store/useThemeStore";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useChatStore } from "../../../src/store/useChatStore";
import { fetchUserProfile } from "../../../src/services/api.auth";
import {
  fetchMessages,
  sendMessage,
  findOrCreateDirectConversation,
  markConversationAsRead,
  getUnreadMessagesCount,
  deleteConversation,
} from "../../../src/services/api.chat";
import { uploadImageToSupabase } from "../../../src/services/storage";
import { supabase } from "../../../src/lib/supabase";
import { Avatar } from "../../../src/components/ui/Avatar";
import { TopStudentBadge } from "../../../src/components/ui/TopStudentBadge";
import { ChatBubble } from "../../../src/components/features/ChatBubble";
import { Message, Profile } from "../../../src/types/models";
import { SPACING, RADIUS } from "../../../src/constants/theme";
import { queryKeys } from "../../../src/constants/queryKeys";
import { compressImage } from "../../../src/utils/imageCompressor";

export default function ChatRoomScreen() {
  const { id, postId } = useLocalSearchParams<{
    id: string;
    postId?: string;
  }>();
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherMemberLastReadAt, setOtherMemberLastReadAt] = useState<
    string | null
  >(null);
  const [inputContent, setInputContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);

  // Track active chat room to suppress push notifications/alerts while open
  useEffect(() => {
    setActiveConversation(activeConvId, id);
    return () => {
      setActiveConversation(null, null);
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(user.id),
        });
        getUnreadMessagesCount(user.id).catch(() => {});
      }
    };
  }, [activeConvId, id, user?.id, queryClient, setActiveConversation]);

  useEffect(() => {
    if (!user?.id || !id) return;

    let isMounted = true;
    let channel: any = null;

    // Load target user profile
    fetchUserProfile(id).then((profile) => {
      if (isMounted && profile) setTargetUser(profile);
    });

    // Resolve or create persistent conversation
    findOrCreateDirectConversation(user.id, id, postId).then(
      async (conversation) => {
        if (!isMounted || !conversation) return;

        const convId = conversation.id;
        setActiveConvId(convId);
        setActiveConversation(convId, id);

        // Immediately mark as read for current user
        markConversationAsRead(convId, user.id);
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.conversations(user.id),
          });
        }

        // Load recipient's last_read_at
        const { data: memberRow } = await supabase
          .from("conversation_members")
          .select("last_read_at")
          .eq("conversation_id", convId)
          .neq("user_id", user.id)
          .order("last_read_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (isMounted && memberRow?.last_read_at) {
          setOtherMemberLastReadAt(memberRow.last_read_at);
        }

        // Load initial messages (deduplicated by id)
        const msgs = await fetchMessages(convId);
        if (isMounted) {
          const uniqueMsgs: Message[] = [];
          const seenIds = new Set<string>();
          for (const m of msgs) {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              uniqueMsgs.push(m);
            }
          }
          setMessages(uniqueMsgs);
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: false }),
            200,
          );
        }

        // Real-time Supabase Subscription for new messages, member read receipts & websocket broadcast seen
        channel = supabase
          .channel(`chat_room:${convId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${convId}`,
            },
            (payload) => {
              const newMsg = payload.new as Message;
              setMessages((prev) => {
                // 1. If this exact message ID is already in state, ignore duplicate
                if (prev.some((m) => m.id === newMsg.id)) return prev;

                // 2. If it's my own message coming from server, reconcile with pending optimistic message
                if (newMsg.sender_id === user.id) {
                  const pendingIdx = prev.findIndex(
                    (m) =>
                      m.is_pending &&
                      (m.content === newMsg.content ||
                        (!m.content && !newMsg.content)),
                  );
                  if (pendingIdx !== -1) {
                    const updated = [...prev];
                    updated[pendingIdx] = { ...newMsg, status: "delivered" };
                    return updated;
                  }
                }

                // 3. Otherwise append new message
                return [...prev, newMsg];
              });

              // If incoming message from other user, automatically mark read and broadcast seen immediately
              if (newMsg.sender_id !== user.id) {
                const nowIso = new Date(Date.now() + 1000).toISOString();
                markConversationAsRead(convId, user.id);
                // Broadcast instant seen to the other user over websocket
                channel.send({
                  type: "broadcast",
                  event: "seen",
                  payload: { userId: user.id, at: nowIso },
                });
              }

              setTimeout(
                () => flatListRef.current?.scrollToEnd({ animated: true }),
                100,
              );
            },
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "conversation_members",
              filter: `conversation_id=eq.${convId}`,
            },
            (payload) => {
              const updated = payload.new as any;
              if (
                updated &&
                updated.user_id !== user.id &&
                updated.last_read_at
              ) {
                setOtherMemberLastReadAt(updated.last_read_at);
              }
            },
          )
          .on("broadcast", { event: "seen" }, ({ payload }) => {
            if (payload && payload.userId !== user.id && payload.at) {
              setOtherMemberLastReadAt(payload.at);
            }
          })
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              // Broadcast that I've seen the messages so the sender immediately sees 'Seen'
              const nowIso = new Date(Date.now() + 1000).toISOString();
              channel.send({
                type: "broadcast",
                event: "seen",
                payload: { userId: user.id, at: nowIso },
              });
            }
          });
      },
    );

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id, user?.id, postId]);

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const compressed = await compressImage(result.assets[0].uri);
      setAttachedImageUri(compressed.uri);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id) {
      Alert.alert("Sign In Required", "Please sign in to send messages.", [
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    if (!activeConvId) {
      Alert.alert(
        "Connecting",
        "Connecting to chat... Please try again in a moment.",
      );
      return;
    }

    if (!inputContent.trim() && !codeSnippet.trim() && !attachedImageUri)
      return;

    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);

    const textToSend = inputContent.trim() || undefined;
    const codeToSend = codeSnippet.trim() || undefined;
    const localImage = attachedImageUri;

    // Reset input fields immediately for snappy UI
    setInputContent("");
    setCodeSnippet("");
    setShowCode(false);
    setAttachedImageUri(null);

    // Optimistic message with unique temp ID
    const tempId =
      "temp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConvId,
      sender_id: user.id,
      content: textToSend,
      code_snippet: codeToSend,
      code_language: "cpp",
      image_url: localImage || undefined,
      created_at: new Date().toISOString(),
      is_pending: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      let publicImageUrl: string | undefined = undefined;
      if (localImage) {
        publicImageUrl = await uploadImageToSupabase(
          localImage,
          "posts",
          "chat_images",
        );
      }

      const sent = await sendMessage({
        conversation_id: activeConvId,
        sender_id: user.id,
        content: textToSend,
        code_snippet: codeToSend,
        code_language: "cpp",
        image_url: publicImageUrl,
      });

      // Safely reconcile: if realtime listener already received and added this message, remove tempId
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m.id === sent.id);
        if (alreadyExists) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) =>
          m.id === tempId ? { ...sent, status: "delivered" } : m,
        );
      });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (e: any) {
      console.warn("Failed to send message:", e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, is_pending: false, has_error: true } : m,
        ),
      );
      Alert.alert(
        "Error",
        "Failed to send message. Please check your network connection.",
      );
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleDeleteChat = () => {
    if (!activeConvId || !user?.id) {
      Alert.alert("Notice", "No active conversation to delete.");
      return;
    }
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? All messages will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteConversation(activeConvId, user.id);
              queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations(user.id),
              });
              getUnreadMessagesCount(user.id).catch(() => {});
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(main)/(tabs)/messages");
              }
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.message || "Failed to delete conversation",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Top Header */}
        <View
          style={[
            styles.topHeader,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              if (user?.id) {
                queryClient.invalidateQueries({
                  queryKey: queryKeys.chat.conversations(user.id),
                });
                getUnreadMessagesCount(user.id).catch(() => {});
              }
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(main)/(tabs)/messages");
              }
            }}
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              targetUser?.id && router.push(`/user/${targetUser.id}` as any)
            }
            style={styles.targetUserRow}
            activeOpacity={0.8}
          >
            <Avatar
              url={targetUser?.avatar_url}
              name={targetUser?.full_name || "Student"}
              size={40}
              isOnline
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text style={[styles.targetName, { color: colors.text }]}>
                  {targetUser?.full_name || "Student Peer"}
                </Text>
                {targetUser?.is_top_student && (
                  <TopStudentBadge size="sm" showText={false} />
                )}
              </View>
              <Text style={[styles.targetStatus, { color: colors.accent }]}>
                {otherMemberLastReadAt ? "Active on Campus" : "Online"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteChat}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.iconBtn, { marginRight: 0, padding: 6 }]}
          >
            <Trash2 size={20} color={colors.error || "#EF4444"} />
          </TouchableOpacity>
        </View>

        {/* Message Stream with Delivered & Seen status */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item.id ? `${item.id}-${index}` : `msg-${index}`
          }
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            const otherReadTime = otherMemberLastReadAt
              ? new Date(otherMemberLastReadAt).getTime()
              : 0;
            const msgTime = new Date(item.created_at).getTime();

            const status = item.is_pending
              ? "sending"
              : otherReadTime && msgTime <= otherReadTime
                ? "seen"
                : "delivered";

            return <ChatBubble message={{ ...item, status }} isMe={isMe} />;
          }}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Attached Photo Preview */}
        {attachedImageUri && (
          <View
            style={[
              styles.attachedImgBox,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Image
              source={{ uri: attachedImageUri }}
              style={styles.attachedImg}
            />
            <TouchableOpacity
              onPress={() => setAttachedImageUri(null)}
              style={styles.removeImgBtn}
            >
              <X size={14} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}

        {/* Code Input Expandable Bar */}
        {showCode && (
          <View
            style={[
              styles.codeSnippetContainer,
              { backgroundColor: colors.codeBg },
            ]}
          >
            <TextInput
              placeholder="// Paste code snippet to share in chat..."
              placeholderTextColor="#9CA3AF"
              value={codeSnippet}
              onChangeText={setCodeSnippet}
              multiline
              style={[styles.codeSnippetInput, { color: colors.codeText }]}
            />
          </View>
        )}

        {/* Bottom Input Controls */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={styles.inputActionBtn}
          >
            <ImageIcon size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCode(!showCode)}
            style={styles.inputActionBtn}
          >
            <Code size={20} color={showCode ? colors.primary : colors.icon} />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message or explanation..."
            placeholderTextColor={colors.textMuted}
            value={inputContent}
            onChangeText={setInputContent}
            multiline
            style={[styles.input, { color: colors.text }]}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={
              isSending ||
              (!inputContent.trim() && !codeSnippet.trim() && !attachedImageUri)
            }
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  inputContent.trim() || codeSnippet.trim() || attachedImageUri
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 6,
    marginRight: 6,
  },
  targetUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  targetName: {
    fontSize: 16,
    fontWeight: "700",
  },
  targetStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  attachedImgBox: {
    flexDirection: "row",
    padding: SPACING.sm,
    alignItems: "center",
    position: "relative",
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  attachedImg: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
  },
  removeImgBtn: {
    position: "absolute",
    top: 4,
    left: 54,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  codeSnippetContainer: {
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    maxHeight: 120,
  },
  codeSnippetInput: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
  },
  inputActionBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
