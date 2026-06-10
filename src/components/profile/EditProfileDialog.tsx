"use client";

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { X, Loader2, Camera, User, FolderOpen, Lock, Globe } from "lucide-react";
import { AppDispatch } from "@/core/redux/store";
import { updateProfile, UserProfile } from "@/core/redux/user";
import { profileApi } from "@/core/services/api/profile";
import { cloudinaryApi } from "@/core/services/api/cloudinary";
import FilePicker from "@/components/upload/FilePicker";

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

const GENDER_OPTIONS = ["male", "female", "other"];

export default function EditProfileDialog({ profile, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [fullName, setFullName] = useState(profile.fullName);
  const [gender, setGender] = useState(profile.gender);
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate ?? false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarLetter = fullName?.[0]?.toUpperCase() ?? profile.username?.[0]?.toUpperCase() ?? "U";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB.");
      return;
    }
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await cloudinaryApi.uploadIcon(file);
      setProfilePic(url);
    } catch {
      setError("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await profileApi.update({ fullName, gender, profilePic, isPrivate });
      dispatch(updateProfile(updated));
      onClose();
    } catch {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="text-text-primary font-semibold">Chỉnh sửa hồ sơ</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-card overflow-hidden">
                {profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePic} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-text-muted text-xs">Click vào ảnh để upload mới</p>
              <span className="text-text-muted text-xs">·</span>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <FolderOpen size={11} /> Chọn từ thư viện
              </button>
            </div>
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs font-medium">Họ và tên</label>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 focus-within:border-accent/50 transition-colors">
              <User size={14} className="text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="flex-1 bg-transparent text-text-secondary text-sm outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs font-medium">Giới tính</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                    gender === g
                      ? "bg-accent border-accent text-white"
                      : "border-border text-text-muted hover:border-accent/40 hover:text-text-secondary"
                  }`}
                >
                  {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                </button>
              ))}
            </div>
          </div>

          {/* Private profile toggle */}
          <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock size={15} className="text-accent flex-shrink-0" />
              ) : (
                <Globe size={15} className="text-text-muted flex-shrink-0" />
              )}
              <div>
                <p className="text-text-secondary text-sm font-medium">
                  {isPrivate ? "Tài khoản riêng tư" : "Tài khoản công khai"}
                </p>
                <p className="text-text-muted text-xs mt-0.5">
                  {isPrivate
                    ? "Chỉ bạn bè mới xem được hồ sơ của bạn"
                    : "Mọi người đều có thể xem hồ sơ của bạn"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                isPrivate ? "bg-accent" : "bg-surface-raised"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  isPrivate ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Read-only fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs font-medium">Email</label>
            <p className="text-text-muted text-sm px-3 py-2.5 bg-surface border border-border rounded-xl">
              {profile.email}
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-xs px-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploadingAvatar}
            className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" />Đang lưu...</>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>

    <FilePicker
      open={showPicker}
      onClose={() => setShowPicker(false)}
      onSelect={(url) => { setProfilePic(url); setShowPicker(false); }}
    />
    </>
  );
}
