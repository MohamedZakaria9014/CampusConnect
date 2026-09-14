import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Award,
  Calculator,
  Code,
  Heart,
  CheckCircle2,
  Lock,
  Check,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { PREDEFINED_BADGES, BadgeDef, isBadgeEarned } from '../../constants/badges';
import { SPACING, RADIUS } from '../../constants/theme';

interface BadgesShowcaseModalProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  title?: string;
}

export const BadgesShowcaseModal: React.FC<BadgesShowcaseModalProps> = ({
  visible,
  onClose,
  user,
  title = 'Academic Badges & Honors',
}) => {
  const { colors } = useThemeStore();

  const earnedCount = PREDEFINED_BADGES.filter((b) => isBadgeEarned(b.slug, user)).length;

  const renderBadgeIcon = (badge: BadgeDef, isEarned: boolean, size = 26) => {
    const iconColor = isEarned ? badge.color : colors.textMuted;
    switch (badge.iconName) {
      case 'award':
        return <Award size={size} color={iconColor} />;
      case 'calculator':
        return <Calculator size={size} color={iconColor} />;
      case 'code':
        return <Code size={size} color={iconColor} />;
      case 'heart':
        return <Heart size={size} color={iconColor} />;
      case 'check-circle':
        return <CheckCircle2 size={size} color={iconColor} />;
      default:
        return <Award size={size} color={iconColor} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Modal Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
              </View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {earnedCount} of {PREDEFINED_BADGES.length} trophies unlocked
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Badges List */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {PREDEFINED_BADGES.map((badge) => {
              const earned = isBadgeEarned(badge.slug, user);

              return (
                <View
                  key={badge.slug}
                  style={[
                    styles.badgeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: earned ? badge.color : colors.border,
                      borderWidth: earned ? 1.5 : 1,
                    },
                  ]}
                >
                  {/* Top Bar: Icon + Category + Status */}
                  <View style={styles.badgeTopRow}>
                    <View
                      style={[
                        styles.badgeIconCircle,
                        {
                          backgroundColor: earned ? badge.bgTint : colors.surfaceSecondary,
                          borderColor: earned ? badge.color : 'transparent',
                          borderWidth: earned ? 1 : 0,
                        },
                      ]}
                    >
                      {renderBadgeIcon(badge, earned, 24)}
                    </View>

                    <View style={styles.badgeMeta}>
                      <Text style={[styles.badgeName, { color: colors.text }]}>
                        {badge.name}
                      </Text>
                      <Text style={[styles.badgeCategory, { color: badge.color }]}>
                        {badge.category}
                      </Text>
                    </View>

                    {/* Status Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: earned
                            ? 'rgba(16, 185, 129, 0.15)'
                            : colors.surfaceSecondary,
                        },
                      ]}
                    >
                      {earned ? (
                        <>
                          <Check size={12} color="#10B981" style={{ marginRight: 4 }} />
                          <Text style={[styles.statusText, { color: '#10B981' }]}>Earned</Text>
                        </>
                      ) : (
                        <>
                          <Lock size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusText, { color: colors.textMuted }]}>Locked</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={[styles.badgeDesc, { color: colors.textSecondary }]}>
                    {badge.description}
                  </Text>

                  {/* How To Achieve Section */}
                  <View
                    style={[
                      styles.howToBox,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.howToTitle, { color: colors.text }]}>
                      How to unlock:
                    </Text>
                    <Text style={[styles.howToText, { color: colors.textSecondary }]}>
                      {badge.howToAchieve}
                    </Text>

                    {/* Criteria items */}
                    <View style={styles.criteriaList}>
                      {badge.criteria.map((crit, idx) => (
                        <View key={idx} style={styles.criteriaRow}>
                          <View
                            style={[
                              styles.criteriaBullet,
                              { backgroundColor: earned ? badge.color : colors.textMuted },
                            ]}
                          />
                          <Text style={[styles.criteriaLabel, { color: colors.text }]}>
                            {crit.label}:{' '}
                            <Text style={[styles.criteriaReq, { color: colors.textSecondary }]}>
                              {crit.requirement}
                            </Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  badgeCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  badgeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  badgeMeta: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  howToBox: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  howToTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  howToText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  criteriaList: {
    gap: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  criteriaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  criteriaReq: {
    fontWeight: '400',
  },
});
