import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Code, Eye, X, Send, Sparkles } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { CATEGORIES } from '../../src/constants/categories';
import { Post } from '../../src/types/models';
import { createPost } from '../../src/services/api.posts';
import { compressImage } from '../../src/utils/imageCompressor';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { Button } from '../../src/components/ui/Button';
import { CodeBlock } from '../../src/components/ui/CodeBlock';
import { LanguagePicker } from '../../src/components/ui/LanguagePicker';
import { uploadImageToSupabase } from '../../src/services/storage';

export default function AskScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Programming');
  const [customCategory, setCustomCategory] = useState('');
  const [courseCodeInput, setCourseCodeInput] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Homework', 'CS101']);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePickImage = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Camera access is required to take photos of equations/notes.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: false,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Gallery access is required to attach images.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: false,
        });
      }

      if (!result.canceled && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri);
        setImageUris((prev) => [...prev, compressed.uri]);
      }
    } catch (e) {
      Alert.alert('Upload Warning', 'Could not select image.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || title.length < 5) {
      Alert.alert('Question Title', 'Please enter a descriptive question title (min 5 chars).');
      return;
    }
    if (!content.trim() || content.length < 10) {
      Alert.alert('Question Details', 'Please explain what you are stuck on in detail (min 10 chars).');
      return;
    }

    setIsPublishing(true);
    try {
      // Upload attached images to Supabase storage bucket
      const uploadedImageUrls = await Promise.all(
        imageUris.map((uri) => uploadImageToSupabase(uri, 'posts', 'post_images'))
      );

      const finalCategory = selectedCategory === 'Other' ? (customCategory.trim() || 'Other') : selectedCategory;

      await createPost({
        author_id: user?.id || 'u1111111-1111-1111-1111-111111111111',
        university_id: user?.university_id,
        course_code: courseCodeInput.trim() || undefined,
        category: finalCategory,
        title,
        content,
        code_snippet: codeSnippet || undefined,
        code_language: codeLanguage,
        image_urls: uploadedImageUrls,
        tags,
        author: user || undefined,
      });

      setIsPublishing(false);
      Alert.alert('Success 🎉', 'Your academic question has been published to the community!', [
        { text: 'OK', onPress: () => router.replace('/(main)') },
      ]);
    } catch (err) {
      setIsPublishing(false);
      Alert.alert('Error', 'Failed to publish question. Please try again.');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Top Navigation Header */}
        <View style={[styles.topHeader, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Ask Question</Text>

          <TouchableOpacity onPress={() => setIsPreviewVisible(true)} style={styles.previewHeaderBtn}>
            <Eye size={18} color={colors.primary} />
            <Text style={[styles.previewText, { color: colors.primary }]}>Preview</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Categories Selector */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Subject Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.filter((c) => c.id !== 'All').map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Text style={[styles.catChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Custom Subject Area Text Box if "Other" is selected */}
          {selectedCategory === 'Other' && (
            <TextInput
              placeholder="Enter your custom subject area (e.g. Neuroscience, Ethics)..."
              placeholderTextColor={colors.textMuted}
              value={customCategory}
              onChangeText={setCustomCategory}
              style={[styles.customCatInput, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            />
          )}

          {/* Prompt Placeholder Title */}
          <TextInput
            placeholder="What are you stuck on?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: colors.text, borderColor: colors.border }]}
          />

          {/* Detailed Question Body */}
          <TextInput
            placeholder="Explain your problem, equation, or assignment requirement in detail..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            style={[
              styles.contentInput,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          />

          {/* Attachment Bar: Photo, Camera, Code Block */}
          <View style={styles.attachmentBar}>
            <TouchableOpacity
              onPress={() => handlePickImage(false)}
              style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ImageIcon size={18} color={colors.primary} />
              <Text style={[styles.attachText, { color: colors.text }]}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePickImage(true)}
              style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Camera size={18} color={colors.secondary} />
              <Text style={[styles.attachText, { color: colors.text }]}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCodeInput(!showCodeInput)}
              style={[styles.attachBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Code size={18} color={colors.accent} />
              <Text style={[styles.attachText, { color: colors.text }]}>
                {showCodeInput ? 'Hide Code' : 'Add Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Previews */}
          {imageUris.length > 0 && (
            <ScrollView horizontal style={styles.imageScroll}>
              {imageUris.map((uri, idx) => (
                <View key={idx} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    onPress={() => setImageUris((prev) => prev.filter((_, i) => i !== idx))}
                    style={styles.removeImgBtn}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Code Input Section */}
          {showCodeInput && (
            <View style={[styles.codeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.codeHeader}>
                <Text style={[styles.codeTitle, { color: colors.text }]}>Code Snippet</Text>
                <LanguagePicker
                  selectedLanguage={codeLanguage}
                  onSelectLanguage={setCodeLanguage}
                  compact
                />
              </View>
              <TextInput
                placeholder="// Paste code here..."
                placeholderTextColor={colors.textMuted}
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline
                style={[styles.codeSnippetInput, { color: colors.codeText, backgroundColor: colors.codeBg }]}
              />
            </View>
          )}

          {/* Writeable Course Code Field */}
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Link Course (Optional)</Text>
            <TextInput
              placeholder="Enter course code or name (e.g. CS101, MATH201, Anatomy 1)..."
              placeholderTextColor={colors.textMuted}
              value={courseCodeInput}
              onChangeText={setCourseCodeInput}
              style={[styles.courseInput, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            />
          </View>

          {/* Tags */}
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                placeholder="Add tag (e.g. Calculus)..."
                placeholderTextColor={colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                style={[styles.tagInput, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
              />
              <TouchableOpacity onPress={handleAddTag} style={[styles.addTagBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.addTagText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {tags.map((t) => (
                <View key={t} style={[styles.tagBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text style={[styles.tagBadgeText, { color: colors.primary }]}>#{t}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(t)}>
                    <X size={12} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Publish Action Button */}
          <Button
            title="Publish Question to Peers"
            loading={isPublishing}
            onPress={handlePublish}
            icon={<Send size={18} color="#FFFFFF" />}
            style={styles.publishBtn}
          />
        </ScrollView>

        {/* Question Live Preview Modal */}
        <Modal visible={isPreviewVisible} animationType="slide" onRequestClose={() => setIsPreviewVisible(false)}>
          <View style={[styles.fullScreenModal, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Question Live Preview</Text>
              <TouchableOpacity onPress={() => setIsPreviewVisible(false)} style={styles.closeBtn}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.previewScrollContent} showsVerticalScrollIndicator={true}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primaryLight + '20' }]}>
                <Text style={[styles.previewCategory, { color: colors.primary }]}>{selectedCategory.toUpperCase()}</Text>
              </View>

              <Text style={[styles.previewQuestionTitle, { color: colors.text }]}>{title || 'Your Question Title'}</Text>
              <Text style={[styles.previewContentText, { color: colors.textSecondary }]}>
                {content || 'Your detailed question explanation will appear here.'}
              </Text>

              {codeSnippet ? (
                <View style={{ marginVertical: 12 }}>
                  <CodeBlock code={codeSnippet} language={codeLanguage} />
                </View>
              ) : null}

              {imageUris.length > 0 && (
                <Image source={{ uri: imageUris[0] }} style={{ width: '100%', height: 220, borderRadius: 12, marginVertical: 12 }} />
              )}
            </ScrollView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  previewHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customCatInput: {
    fontSize: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  courseInput: {
    fontSize: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: SPACING.md,
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  attachmentBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  attachText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.md,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeSection: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  langInput: {
    fontSize: 12,
    fontWeight: '700',
  },
  codeSnippetInput: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 80,
  },
  sectionMargin: {
    marginBottom: SPACING.md,
  },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    marginRight: 8,
  },
  courseChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    height: 40,
    borderRadius: RADIUS.md,
    fontSize: 14,
  },
  addTagBtn: {
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  addTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  fullScreenModal: {
    flex: 1,
  },
  previewScrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  previewCategory: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewQuestionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  previewContentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
});
