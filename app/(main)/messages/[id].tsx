import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Send, Image as ImageIcon, Code, Phone, Video } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { fetchUserProfile } from '../../../src/services/api.auth';
import { fetchMessages, sendMessage } from '../../../src/services/api.chat';
import { supabase } from '../../../src/lib/supabase';
import { Avatar } from '../../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../../src/components/ui/TopStudentBadge';
import { ChatBubble } from '../../../src/components/features/ChatBubble';
import { Message, Profile } from '../../../src/types/models';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { compressImage } from '../../../src/utils/imageCompressor';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // target user ID
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const convId = `conv_${user?.id}_${id}`;

  useEffect(() => {
    // Load target user profile
    fetchUserProfile(id as string).then(setTargetUser);

    // Initial messages load
    fetchMessages(convId).then((msgs) => {
      setMessages(msgs);
    });

    // Real-time Supabase Subscription for new incoming chat messages
    const subscription = supabase
      .channel(`public:messages:${convId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, convId]);

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
    if (!inputContent.trim() && !codeSnippet.trim() && !attachedImageUri) return;

    const currentUserId = user?.id || 'u1111111-1111-1111-1111-111111111111';

    // Optimistic message addition
    const optimisticMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: convId,
      sender_id: currentUserId,
      content: inputContent.trim() || undefined,
      code_snippet: codeSnippet.trim() || undefined,
      code_language: 'cpp',
      image_url: attachedImageUri || undefined,
      created_at: new Date().toISOString(),
      sender: user || undefined,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputContent('');
    setCodeSnippet('');
    setShowCode(false);
    setAttachedImageUri(null);

    try {
      await sendMessage({
        conversation_id: convId,
        sender_id: currentUserId,
        content: optimisticMsg.content,
        code_snippet: optimisticMsg.code_snippet,
        code_language: optimisticMsg.code_language,
        image_url: optimisticMsg.image_url,
      });
    } catch (e) {
      console.warn('Failed to send message:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Top Header */}
        <View style={[styles.topHeader, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => targetUser?.id && router.push(`/user/${targetUser.id}` as any)}
            style={styles.targetUserRow}
          >
            <Avatar url={targetUser?.avatar_url} name={targetUser?.full_name || 'Student'} size={38} isOnline />
            <View style={{ marginLeft: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.targetName, { color: colors.text }]}>{targetUser?.full_name || 'Student'}</Text>
                {targetUser?.is_top_student && <TopStudentBadge size="sm" showText={false} />}
              </View>
              <Text style={[styles.targetStatus, { color: colors.accent }]}>Online · Active Peer</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Message Stream */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} isMe={item.sender_id === (user?.id || 'u1111111-1111-1111-1111-111111111111')} />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Attached Photo Preview */}
        {attachedImageUri && (
          <View style={[styles.attachedImgBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Image source={{ uri: attachedImageUri }} style={styles.attachedImg} />
            <TouchableOpacity onPress={() => setAttachedImageUri(null)} style={styles.removeImgBtn}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Γ£ò</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Code Input Expandable Bar */}
        {showCode && (
          <View style={[styles.codeSnippetContainer, { backgroundColor: colors.codeBg }]}>
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
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handlePickPhoto} style={styles.inputActionBtn}>
            <ImageIcon size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCode(!showCode)} style={styles.inputActionBtn}>
            <Code size={20} color={showCode ? colors.primary : colors.icon} />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message or explanation..."
            placeholderTextColor={colors.textMuted}
            value={inputContent}
            onChangeText={setInputContent}
            style={[styles.messageInput, { color: colors.text }]}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  inputContent.trim() || codeSnippet.trim() || attachedImageUri ? colors.primary : colors.surfaceSecondary,
              },
            ]}
          >
            <Send
              size={18}
              color={inputContent.trim() || codeSnippet.trim() || attachedImageUri ? '#FFFFFF' : colors.textMuted}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 4,
    marginRight: 8,
  },
  targetUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '700',
  },
  targetStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  inputActionBtn: {
    padding: 6,
    marginRight: 4,
  },
  messageInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    maxHeight: 80,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  attachedImgBox: {
    padding: 8,
    position: 'relative',
    alignSelf: 'flex-start',
    marginLeft: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  attachedImg: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeSnippetContainer: {
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  codeSnippetInput: {
    fontSize: 13,
    minHeight: 60,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
