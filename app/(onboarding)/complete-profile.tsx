import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  GraduationCap,
  Award,
  BookOpen,
  User,
  Search,
  CheckCircle2,
  ChevronDown,
  Calendar,
  ArrowLeft,
} from "lucide-react-native";
import {
  completeProfileSchema,
  CompleteProfileFormData,
} from "../../src/utils/validators";
import { useThemeStore } from "../../src/store/useThemeStore";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { Avatar } from "../../src/components/ui/Avatar";
import {
  fetchUniversities,
  fetchMajors,
  Major,
} from "../../src/services/api.explore";
import { uploadImageToSupabase } from "../../src/services/storage";
import { University } from "../../src/types/models";
import { SPACING, RADIUS } from "../../src/constants/theme";

const YEAR_OPTIONS = [
  "Year 1 (Freshman)",
  "Year 2 (Sophomore)",
  "Year 3 (Junior)",
  "Year 4 (Senior)",
  "Year 5 (Advanced / Eng / Arch)",
  "Year 6 (Medicine / Pharmacy)",
  "Year 7 (Clinical / Internship)",
];

export default function CompleteProfileScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const params = useLocalSearchParams<{
    fullName?: string;
    username?: string;
  }>();
  const { user, updateProfile } = useAuthStore();

  const initialFullName = params.fullName || user?.full_name || "";
  const initialUsername = params.username || user?.username || "";

  // Universities Autocomplete State
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [uniSearchText, setUniSearchText] = useState<string>("");
  const [showUniDropdown, setShowUniDropdown] = useState<boolean>(false);

  // Majors Autocomplete State
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [majorSearchText, setMajorSearchText] = useState<string>("");
  const [showMajorDropdown, setShowMajorDropdown] = useState<boolean>(false);

  // Year Dropdown State
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    user?.avatar_url,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities().then((data) => {
      if (data && data.length > 0) {
        setUniversities(data);
        const defaultUni =
          data.find((u) => u.name.includes("Cairo University")) || data[0];
        setSelectedUni(defaultUni);
        setUniSearchText(defaultUni.name);
        setValue("universityId", defaultUni.id);
      }
    });

    fetchMajors().then((data) => {
      if (data && data.length > 0) {
        setMajors(data);
        const defaultMajor =
          data.find((m) => m.name.includes("Computer Science")) || data[0];
        setSelectedMajor(defaultMajor);
        setMajorSearchText(defaultMajor.name);
        setValue("major", defaultMajor.name);
      }
    });
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      fullName: initialFullName || "John Doe",
      username: initialUsername || "john_doe",
      universityId: selectedUni?.id || "",
      major: selectedMajor?.name || "Computer Science",
      program: user?.program || "B.Sc. Software Engineering",
      year: user?.year || "Year 4 (Senior)",
      semester: "2",
      gpa: user?.gpa ? user.gpa.toString() : "3.92",
      bio: user?.bio,
    },
  });

  const selectedYear = watch("year");

  // Filter Universities
  const filteredUniversities = universities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(uniSearchText.toLowerCase()) ||
      uni.short_name.toLowerCase().includes(uniSearchText.toLowerCase()) ||
      (uni.location &&
        uni.location.toLowerCase().includes(uniSearchText.toLowerCase())),
  );

  // Filter Majors
  const filteredMajors = majors.filter(
    (m) =>
      m.name.toLowerCase().includes(majorSearchText.toLowerCase()) ||
      m.category.toLowerCase().includes(majorSearchText.toLowerCase()),
  );

  const handleSelectUniversity = (uni: University) => {
    setSelectedUni(uni);
    setUniSearchText(uni.name);
    setValue("universityId", uni.id);
    setShowUniDropdown(false);
  };

  const handleSelectMajor = (major: Major) => {
    setSelectedMajor(major);
    setMajorSearchText(major.name);
    setValue("major", major.name);
    setShowMajorDropdown(false);
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please grant access to photo library to select avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: CompleteProfileFormData) => {
    if (!selectedUni) {
      Alert.alert(
        "University Required",
        "Please select a valid university from the suggestions list.",
      );
      return;
    }
    if (!selectedMajor) {
      Alert.alert(
        "Major Required",
        "Please select a valid academic major from the suggestions list.",
      );
      return;
    }

    setLoading(true);
    try {
      let publicAvatarUrl = avatarUri;
      if (avatarUri && avatarUri.startsWith('file://')) {
        publicAvatarUrl = await uploadImageToSupabase(avatarUri, 'avatars', 'profiles');
      }

      await updateProfile({
        full_name: data.fullName,
        username: data.username,
        university_id: selectedUni.id,
        major: selectedMajor.name,
        program: data.program,
        year: data.year,
        semester: data.semester ? parseInt(data.semester, 10) : 1,
        gpa: parseFloat(data.gpa),
        bio: data.bio,
        avatar_url: publicAvatarUrl,
      });

      router.replace("/(main)");
    } catch (e) {
      Alert.alert("Profile Error", "Failed to update academic profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Spacious Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(auth)/login")
              }
              style={styles.backBtn}
            >
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.text }]}>
              Academic Profile Setup
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Verify your university and major credentials to unlock student
              peer learning.
            </Text>
          </View>

          {/* Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarWrapper}
            >
              <Avatar
                url={avatarUri}
                name={initialFullName || "Student"}
                size={90}
                showBorder
              />
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
              Tap to change photo
            </Text>
          </View>

          {/* Spacious Card Container */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.fullName?.message}
                  iconPrefix={<User size={18} color={colors.icon} />}
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Username"
                  placeholder="john_doe"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.username?.message}
                />
              )}
            />

            {/* University Autocomplete Dropdown */}
            <View style={{ zIndex: 30 }}>
              <Input
                label="University (Select from List)"
                placeholder="Type university name (e.g. Cairo, AUC, Mansoura)..."
                value={uniSearchText}
                onChangeText={(text) => {
                  setUniSearchText(text);
                  setSelectedUni(null);
                  setShowUniDropdown(true);
                  setShowMajorDropdown(false);
                  setShowYearDropdown(false);
                }}
                onFocus={() => {
                  setShowUniDropdown(true);
                  setShowMajorDropdown(false);
                  setShowYearDropdown(false);
                }}
                iconPrefix={<GraduationCap size={18} color={colors.primary} />}
                iconSuffix={<Search size={16} color={colors.icon} />}
                error={
                  !selectedUni && uniSearchText.length > 0
                    ? "Please tap a university from the list"
                    : errors.universityId?.message
                }
              />

              {showUniDropdown && filteredUniversities.length > 0 && (
                <View
                  style={[
                    styles.suggestionsBox,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                    {filteredUniversities.map((uni) => {
                      const isSelected = selectedUni?.id === uni.id;
                      return (
                        <TouchableOpacity
                          key={uni.id}
                          onPress={() => handleSelectUniversity(uni)}
                          style={[
                            styles.suggestionRow,
                            {
                              backgroundColor: isSelected
                                ? colors.primary + "15"
                                : "transparent",
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <GraduationCap
                            size={16}
                            color={
                              isSelected ? colors.primary : colors.textSecondary
                            }
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text
                              style={[
                                styles.suggestionName,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.text,
                                },
                              ]}
                            >
                              {uni.name} ({uni.short_name})
                            </Text>
                            {uni.location && (
                              <Text
                                style={[
                                  styles.suggestionLocation,
                                  { color: colors.textMuted },
                                ]}
                              >
                                📍 {uni.location}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <CheckCircle2 size={16} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Major Autocomplete Dropdown */}
            <View style={{ zIndex: 20 }}>
              <Input
                label="Major (Select from List)"
                placeholder="Type major (e.g. Computer Science, Medicine, Law)..."
                value={majorSearchText}
                onChangeText={(text) => {
                  setMajorSearchText(text);
                  setSelectedMajor(null);
                  setShowMajorDropdown(true);
                  setShowUniDropdown(false);
                  setShowYearDropdown(false);
                }}
                onFocus={() => {
                  setShowMajorDropdown(true);
                  setShowUniDropdown(false);
                  setShowYearDropdown(false);
                }}
                iconPrefix={<BookOpen size={18} color={colors.primary} />}
                iconSuffix={<Search size={16} color={colors.icon} />}
                error={
                  !selectedMajor && majorSearchText.length > 0
                    ? "Please tap a major from the list"
                    : errors.major?.message
                }
              />

              {showMajorDropdown && filteredMajors.length > 0 && (
                <View
                  style={[
                    styles.suggestionsBox,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                    {filteredMajors.map((m) => {
                      const isSelected = selectedMajor?.id === m.id;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => handleSelectMajor(m)}
                          style={[
                            styles.suggestionRow,
                            {
                              backgroundColor: isSelected
                                ? colors.primary + "15"
                                : "transparent",
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <BookOpen
                            size={16}
                            color={
                              isSelected ? colors.primary : colors.textSecondary
                            }
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text
                              style={[
                                styles.suggestionName,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.text,
                                },
                              ]}
                            >
                              {m.name}
                            </Text>
                            <Text
                              style={[
                                styles.suggestionLocation,
                                { color: colors.textMuted },
                              ]}
                            >
                              Category: {m.category}
                            </Text>
                          </View>
                          {isSelected && (
                            <CheckCircle2 size={16} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.row}>
              {/* Selectable Year Dropdown */}
              <View style={{ flex: 1, marginRight: 8, zIndex: 10 }}>
                <Text style={[styles.dropdownLabel, { color: colors.text }]}>
                  Year of Study
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setShowYearDropdown(!showYearDropdown);
                    setShowUniDropdown(false);
                    setShowMajorDropdown(false);
                  }}
                >
                  <Calendar
                    size={16}
                    color={colors.icon}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.dropdownValue,
                      { color: colors.text, flex: 1 },
                    ]}
                  >
                    {selectedYear}
                  </Text>
                  <ChevronDown size={16} color={colors.icon} />
                </TouchableOpacity>

                {showYearDropdown && (
                  <View
                    style={[
                      styles.suggestionsBox,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        marginTop: 4,
                      },
                    ]}
                  >
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                      {YEAR_OPTIONS.map((yr) => {
                        const isSelected = selectedYear === yr;
                        return (
                          <TouchableOpacity
                            key={yr}
                            onPress={() => {
                              setValue("year", yr);
                              setShowYearDropdown(false);
                            }}
                            style={[
                              styles.suggestionRow,
                              {
                                backgroundColor: isSelected
                                  ? colors.primary + "15"
                                  : "transparent",
                                borderBottomColor: colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.suggestionName,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.text,
                                },
                              ]}
                            >
                              {yr}
                            </Text>
                            {isSelected && (
                              <CheckCircle2 size={16} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Controller
                  control={control}
                  name="gpa"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="GPA (0.00 - 4.00)"
                      placeholder="3.92"
                      keyboardType="decimal-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.gpa?.message}
                      iconPrefix={<Award size={16} color={colors.icon} />}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Academic Bio"
                  placeholder="Describe your research interests or academic focus area..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: "top" }}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.bio?.message}
                />
              )}
            />

            <Button
              title="Complete & Launch Campus Connect"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl + 8,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  backBtn: {
    marginBottom: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  avatarWrapper: {
    position: "relative",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
  },
  dropdownValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  suggestionsBox: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    marginTop: -8,
    marginBottom: SPACING.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: "700",
  },
  suggestionLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
  },
  submitBtn: {
    marginTop: SPACING.lg,
  },
});
