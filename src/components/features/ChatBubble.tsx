import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { CheckCheck, Clock, AlertCircle } from 'lucide-react-native';
import { Message } from '../../types/models';
import { useThemeStore } from '../../store/useThemeStore';
import { CodeBlock } from '../ui/CodeBlock';
import { ImageViewerModal } from '../ui/ImageViewerModal';
import { timeAgo } from '../../utils/formatters';
import { SPACING, RADIUS } from '../../constants/theme';

export interface ChatBubbleProps {
  message: Message;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const { colors } = useThemeStore();
  const [isFullImageVisible, setIsFullImageVisible] = useState(false);

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMe ? colors.primary : colors.surfaceSecondary,
            borderBottomRightRadius: isMe ? 4 : RADIUS.lg,
            borderBottomLeftRadius: isMe ? RADIUS.lg : 4,
          },
        ]}
      >
        {message.content ? (
          <Text
            style={[
              styles.text,
              { color: isMe ? '#FFFFFF' : colors.text },
            ]}
          >
            {message.content}
          </Text>
        ) : null}

        {message.code_snippet ? (
          <CodeBlock code={message.code_snippet} language={message.code_language || 'code'} />
        ) : null}

        {message.image_url ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setIsFullImageVisible(true)}>
            <Image
              source={{ uri: message.image_url }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              { color: isMe ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted },
            ]}
          >
            {timeAgo(message.created_at)}
          </Text>

          {isMe && (
            <View style={styles.statusRow}>
              {message.has_error ? (
                <AlertCircle size={12} color="#EF4444" />
              ) : message.is_pending ? (
                <Clock size={11} color="rgba(255, 255, 255, 0.6)" />
              ) : message.status === 'seen' ? (
                <View style={styles.seenBadge}>
                  <CheckCheck size={13} color="#67E8F9" strokeWidth={2.5} />
                  <Text style={styles.seenText}>Seen</Text>
                </View>
              ) : (
                <View style={styles.deliveredBadge}>
                  <CheckCheck size={13} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
                  <Text style={styles.deliveredText}>Delivered</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {message.image_url ? (
        <ImageViewerModal
          visible={isFullImageVisible}
          imageUrl={message.image_url}
          onClose={() => setIsFullImageVisible(false)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: '82%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seenText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#67E8F9',
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveredText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
