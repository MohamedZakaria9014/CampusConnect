import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
            <Image source={{ uri: message.image_url }} style={styles.image} />
          </TouchableOpacity>
        ) : null}

        <Text
          style={[
            styles.timeText,
            { color: isMe ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted },
          ]}
        >
          {timeAgo(message.created_at)}
        </Text>
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
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
