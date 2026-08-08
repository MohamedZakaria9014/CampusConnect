import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ViewStyle,
} from 'react-native';
import {
  ChevronDown,
  X,
  Search,
  Check,
  FileCode,
  Terminal,
  Cpu,
  Coffee,
  Database,
  Palette,
  Layout,
  Zap,
  Flame,
  Smartphone,
  Gem,
  Hash,
  Globe,
  Braces,
  FileText,
  Cog,
  Boxes,
  Code2,
} from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { RADIUS, SPACING } from '../../constants/theme';

export interface LanguageOption {
  id: string;
  label: string;
  aliases: string[];
  color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

export const PROGRAMMING_LANGUAGES: LanguageOption[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    aliases: ['js', 'jsx', 'node'],
    color: '#F7DF1E',
    icon: FileCode,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    aliases: ['ts', 'tsx'],
    color: '#3178C6',
    icon: Code2,
  },
  {
    id: 'python',
    label: 'Python',
    aliases: ['py', 'python3'],
    color: '#3776AB',
    icon: Terminal,
  },
  {
    id: 'cpp',
    label: 'C++',
    aliases: ['cpp', 'c++', 'cc', 'cxx'],
    color: '#00599C',
    icon: Cpu,
  },
  {
    id: 'c',
    label: 'C Language',
    aliases: ['c'],
    color: '#A8B9CC',
    icon: Cpu,
  },
  {
    id: 'java',
    label: 'Java',
    aliases: ['java'],
    color: '#007396',
    icon: Coffee,
  },
  {
    id: 'csharp',
    label: 'C#',
    aliases: ['cs', 'csharp', 'dotnet'],
    color: '#239120',
    icon: Hash,
  },
  {
    id: 'html',
    label: 'HTML',
    aliases: ['html', 'htm'],
    color: '#E34F26',
    icon: Layout,
  },
  {
    id: 'css',
    label: 'CSS',
    aliases: ['css', 'scss', 'sass'],
    color: '#1572B6',
    icon: Palette,
  },
  {
    id: 'sql',
    label: 'SQL',
    aliases: ['sql', 'mysql', 'postgres', 'sqlite'],
    color: '#4479A1',
    icon: Database,
  },
  {
    id: 'rust',
    label: 'Rust',
    aliases: ['rust', 'rs'],
    color: '#DEA584',
    icon: Cog,
  },
  {
    id: 'go',
    label: 'Go (Golang)',
    aliases: ['go', 'golang'],
    color: '#00ADD8',
    icon: Zap,
  },
  {
    id: 'swift',
    label: 'Swift',
    aliases: ['swift', 'ios'],
    color: '#F05138',
    icon: Flame,
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    aliases: ['kt', 'kotlin', 'android'],
    color: '#7F52FF',
    icon: Smartphone,
  },
  {
    id: 'php',
    label: 'PHP',
    aliases: ['php'],
    color: '#777BB4',
    icon: Globe,
  },
  {
    id: 'dart',
    label: 'Dart / Flutter',
    aliases: ['dart', 'flutter'],
    color: '#00B4AB',
    icon: Boxes,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    aliases: ['rb', 'ruby', 'rails'],
    color: '#CC342D',
    icon: Gem,
  },
  {
    id: 'bash',
    label: 'Bash / Shell',
    aliases: ['bash', 'sh', 'shell', 'zsh'],
    color: '#4EAA25',
    icon: Terminal,
  },
  {
    id: 'json',
    label: 'JSON',
    aliases: ['json'],
    color: '#EAB308',
    icon: Braces,
  },
  {
    id: 'yaml',
    label: 'YAML',
    aliases: ['yaml', 'yml'],
    color: '#CB171E',
    icon: FileText,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    aliases: ['md', 'markdown'],
    color: '#8B5CF6',
    icon: FileText,
  },
  {
    id: 'code',
    label: 'Plain Code',
    aliases: ['code', 'text', 'other'],
    color: '#9CA3AF',
    icon: Code2,
  },
];

export function getLanguageConfig(langInput?: string): LanguageOption {
  if (!langInput) return PROGRAMMING_LANGUAGES[0];
  const query = langInput.toLowerCase().trim();
  const found = PROGRAMMING_LANGUAGES.find(
    (l) => l.id === query || l.aliases.includes(query) || l.label.toLowerCase() === query
  );
  return (
    found || {
      id: query,
      label: query.toUpperCase(),
      aliases: [query],
      color: '#6366F1',
      icon: Code2,
    }
  );
}

interface LanguagePickerProps {
  selectedLanguage: string;
  onSelectLanguage: (langId: string) => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selectedLanguage,
  onSelectLanguage,
  style,
  compact = false,
}) => {
  const { colors } = useThemeStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentConfig = getLanguageConfig(selectedLanguage);
  const IconComp = currentConfig.icon;

  const filteredLanguages = PROGRAMMING_LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.label.toLowerCase().includes(q) ||
      lang.id.toLowerCase().includes(q) ||
      lang.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleSelect = (lang: LanguageOption) => {
    onSelectLanguage(lang.id);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={style}>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        style={[
          styles.triggerBtn,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
            paddingVertical: compact ? 6 : 8,
            paddingHorizontal: compact ? 10 : 12,
          },
        ]}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: currentConfig.color + '25' }]}>
            <IconComp size={compact ? 14 : 16} color={currentConfig.color} />
          </View>
          <Text
            style={[
              styles.triggerLabel,
              { color: colors.text, fontSize: compact ? 12 : 13 },
            ]}
          >
            {currentConfig.label}
          </Text>
        </View>
        <ChevronDown size={compact ? 14 : 16} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Language Selector Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <View style={styles.headerTitleRow}>
                <Code2 size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                placeholder="Search language (e.g. python, ts, sql)..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: colors.text }]}
                autoCorrect={false}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={14} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Language List */}
            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected =
                  selectedLanguage.toLowerCase() === item.id ||
                  item.aliases.includes(selectedLanguage.toLowerCase());
                const ItemIcon = item.icon;

                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.langItem,
                      {
                        backgroundColor: isSelected ? colors.primaryLight + '20' : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.langItemLeft}>
                      <View style={[styles.itemIconBadge, { backgroundColor: item.color + '25' }]}>
                        <ItemIcon size={18} color={item.color} />
                      </View>
                      <View>
                        <Text style={[styles.langItemName, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.langItemAlias, { color: colors.textMuted }]}>
                          .{item.aliases[0]}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    padding: 4,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerLabel: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: 6,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIconBadge: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  langItemAlias: {
    fontSize: 11,
    fontWeight: '500',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
