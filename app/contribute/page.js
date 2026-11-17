"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import { useLanguage } from "../LanguageContext.js";

const CATEGORY_OPTIONS_KH = [
  "ភ្ជួររាស់ដី (Soil Preparation)",
  "សាបព្រោះ និងស្ទូង (Planting & Floods)",
  "ការច្រូតកាត់ (The Harvest)",
  "ជង្រុក និងការទុកដាក់ (Granary & Storage)",
];

const CATEGORY_OPTIONS_EN = [
  "Soil Preparation (ភ្ជួររាស់)",
  "Planting & Floods (សាបព្រោះ & ស្ទូង)",
  "The Harvest (ច្រូតកាត់)",
  "Granary & Storage (ទុកដាក់ & ជីវភាព)",
];

const INITIAL_FORM = {
  title: "",
  category: "ភ្ជួររាស់ដី (Soil Preparation)",
  description: "",
  contributor: "",
  place: "",
};

function ContributeAuthPrompt({ onUnlocked }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const isKh = lang === "KH";

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function handleAuth(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    const supabase = createClient();

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErr(
            isKh
              ? "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ"
              : "Invalid email or password."
          );
          setBusy(false);
          return;
        }
        onUnlocked(data?.user ?? null);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) {
          if (error.message?.toLowerCase().includes("already registered")) {
            setErr(
              isKh
                ? "គណនីនេះមានរួចហើយ សូមជ្រើសរើសចូលគណនី"
                : "This email is already registered. Please log in."
            );
          } else if (error.message?.toLowerCase().includes("password")) {
            setErr(
              isKh
                ? "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៦ តួអក្សរ"
                : "Password must be at least 6 characters."
            );
          } else {
            setErr(
              isKh
                ? "មិនអាចចុះឈ្មោះបានទេ សូមពិនិត្យព័ត៌មានម្តងទៀត"
                : "Registration failed. Please check your details and try again."
            );
          }
          setBusy(false);
          return;
        }
        if (data?.session) {
          onUnlocked(data.user);
          router.refresh();
          return;
        }
        setMsg(
          isKh
            ? "ចុះឈ្មោះជោគជ័យ! សូមចូលគណនីខាងលើ ដើម្បីចាប់ផ្តើមបញ្ជូនឧបករណ៍។"
            : "Registered successfully! Log in above with your credentials to submit."
        );
        setAuthMode("login");
        setBusy(false);
      }
    } catch {
      setErr(
        isKh
          ? "បញ្ហាតភ្ជាប់បណ្តាញ សូមព្យាយាមម្តងទៀត"
          : "Connection error. Please try again."
      );
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        background: "linear-gradient(145deg, #1D1714 0%, #120F0D 100%)",
        color: "#F5EBE1",
        borderRadius: "24px",
        padding: "24px 28px",
        marginBottom: "28px",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        boxShadow: "0 20px 44px -12px rgba(25, 22, 20, 0.25)",
        position: "relative",
        zIndex: 2,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "10.5px",
              fontFamily: isKh ? "var(--font-khmer)" : "monospace",
              color: "#F59E0B",
              letterSpacing: isKh ? "0" : "1px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#EA580C",
              }}
            />
            {isKh ? "ចូលគណនី ឬ ចុះឈ្មោះ" : "CONTRIBUTOR ACCESS"}
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: isKh ? "19px" : "20px",
              fontWeight: 600,
              color: "#FFFFFF",
              fontFamily: isKh
                ? "var(--font-khmer-title), var(--font-khmer)"
                : "var(--font-serif), Georgia, serif",
              lineHeight: 1.4,
            }}
          >
            {authMode === "login"
              ? isKh
                ? "ចូលគណនីដើម្បីបញ្ជូនឧបករណ៍ទៅកាន់បណ្ណសារ"
                : "Log in to submit a tool to the archive"
              : isKh
                ? "ចុះឈ្មោះគណនីអ្នកចូលរួមថ្មី"
                : "Create a contributor account to submit tools"}
          </h2>
        </div>

        <div
          style={{
            display: "inline-flex",
            padding: "4px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setErr("");
              setMsg("");
            }}
            style={{
              padding: "6px 15px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: authMode === "login" ? "#EA580C" : "transparent",
              color: authMode === "login" ? "#FFFFFF" : "#C6BEB5",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
            }}
          >
            {isKh ? "ចូលគណនី" : "Log In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErr("");
              setMsg("");
            }}
            style={{
              padding: "6px 15px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: authMode === "signup" ? "#EA580C" : "transparent",
              color: authMode === "signup" ? "#FFFFFF" : "#C6BEB5",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
            }}
          >
            {isKh ? "ចុះឈ្មោះ" : "Sign Up"}
          </button>
        </div>
      </div>

      {err && (
        <div style={{ color: "#FCA5A5", fontSize: "12.5px", marginBottom: "12px" }}>
          {err}
        </div>
      )}
      {msg && (
        <div style={{ color: "#6EE7B7", fontSize: "12.5px", marginBottom: "12px" }}>
          {msg}
        </div>
      )}

      <form
        onSubmit={handleAuth}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            isKh
              ? "អ៊ីមែលអ្នកចូលរួម (ឧ. you@aupp.edu.kh)"
              : "Contributor email (e.g. you@aupp.edu.kh)"
          }
          className="editorial-input signup-dark"
          style={{ height: "44px", padding: "0 14px" }}
        />
        <input
          type="password"
          required
          minLength={authMode === "signup" ? 6 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            authMode === "signup"
              ? isKh
                ? "ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួអក្សរ)"
                : "Password (min 6 chars)"
              : isKh
                ? "ពាក្យសម្ងាត់"
                : "Password"
          }
          className="editorial-input signup-dark"
          style={{ height: "44px", padding: "0 14px" }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            height: "44px",
            borderRadius: "9999px",
            border: "none",
            background: "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer",
            padding: "0 20px",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 18px rgba(234, 88, 12, 0.35)",
            fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
          }}
        >
          {busy
            ? isKh
              ? "កំពុងផ្ទៀងផ្ទាត់..."
              : "Verifying..."
            : authMode === "login"
              ? isKh
                ? "ចូលគណនី →"
                : "Log In →"
              : isKh
                ? "ចុះឈ្មោះ →"
                : "Sign Up →"}
        </button>
      </form>
    </div>
  );
}

export default function ContributePage() {
  const { lang } = useLanguage();
  const isKh = lang === "KH";
  const categoryOptions = isKh ? CATEGORY_OPTIONS_KH : CATEGORY_OPTIONS_EN;

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      e.target.value = "";
      setPhoto(null);
      setErrors((prev) => ({
        ...prev,
        photo: isKh
          ? "រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP"
          : "Please upload a JPG, PNG, or WebP image.",
      }));
      return;
    }

    if (file.size > MAX_SIZE) {
      e.target.value = "";
      setPhoto(null);
      setErrors((prev) => ({
        ...prev,
        photo: isKh
          ? "ទំហំរូបភាពត្រូវតែតូចជាង 5 MB"
          : "Image size must be under 5 MB.",
      }));
      return;
    }

    setPhoto(file);
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const t = formData.title.trim();
    const cat = formData.category;
    const d = formData.description.trim();
    const c = formData.contributor.trim();
    const p = formData.place.trim();

    if (!t) {
      newErrors.title = isKh
        ? "សូមបញ្ចូលឈ្មោះឧបករណ៍"
        : "Title is required.";
    } else if (t.length > 200) {
      newErrors.title = isKh
        ? "ឈ្មោះឧបករណ៍ត្រូវតែតិចជាង ២០០ តួអក្សរ"
        : "Title must be 200 characters or less.";
    }

    if (!cat) {
      newErrors.category = isKh
        ? "សូមជ្រើសរើសប្រភេទឧបករណ៍"
        : "Season / Category is required.";
    }

    if (!d) {
      newErrors.description = isKh
        ? "សូមបញ្ចូលការពិពណ៌នា"
        : "Description is required.";
    } else if (d.length > 2000) {
      newErrors.description = isKh
        ? "ការពិពណ៌នាត្រូវតែតិចជាង ២០០០ តួអក្សរ"
        : "Description must be 2000 characters or less.";
    }

    if (!c) {
      newErrors.contributor = isKh
        ? "សូមបញ្ចូលឈ្មោះអ្នកចូលរួម ឬចាស់ទុំ"
        : "Contributor is required.";
    }

    if (!p) {
      newErrors.place = isKh
        ? "សូមបញ្ចូលទីកន្លែងកំណើត"
        : "Place is required.";
    }

    if (!photo) {
      newErrors.photo = isKh
        ? "សូមជ្រើសរើសរូបថតឧបករណ៍"
        : "Photo is required.";
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(photo.type)) {
        newErrors.photo = isKh
          ? "រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP"
          : "Only JPEG, PNG, or WEBP images are allowed.";
      } else if (photo.size > 5 * 1024 * 1024) {
        newErrors.photo = isKh
          ? "ទំហំរូបថតត្រូវតែតូចជាង 5MB"
          : "File size must be 5MB or less.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!user) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        throw new Error("Authentication failed. Please log in again.");
      }

      const fileExt = photo.name.split(".").pop();
      const filePath = `${currentUser.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, photo);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(filePath);

      const formattedDescription = `[Category: ${formData.category}]\n\n${formData.description.trim()}`;

      // Do not send status on insert; database default ('pending') enforces the review gate
      const { error: insertError } = await supabase.from("entries").insert({
        title: formData.title.trim(),
        description: formattedDescription,
        contributor: formData.contributor.trim(),
        place: formData.place.trim(),
        photo_url: publicUrl,
        owner: currentUser.id,
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData(INITIAL_FORM);
      setPhoto(null);
    } catch (err) {
      console.error(err);
      setSubmitError(
        isKh
          ? "មិនអាចរក្សាទុកកំណត់ត្រាបានទេ សូមព្យាយាមម្តងទៀត"
          : "Failed to save entry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 90px)",
          backgroundColor: "#F7F4EE",
          color: "#191614",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <div
          style={{
            padding: "16px 26px",
            borderRadius: "9999px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(40, 28, 18, 0.1)",
            fontSize: "13px",
            fontFamily: isKh ? "var(--font-khmer)" : "monospace",
            color: "#6B635B",
            boxShadow: "0 10px 25px rgba(40, 28, 18, 0.06)",
          }}
        >
          {isKh ? "កំពុងផ្ទុកទម្រង់..." : "Loading submission form..."}
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 90px)",
        backgroundColor: "#F7F4EE",
        color: "#191614",
        padding: "36px 20px 84px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Monumental Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(34px, 10vw, 200px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "rgba(40, 28, 18, 0.035)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          zIndex: 0,
          textTransform: "uppercase",
          fontFamily: isKh ? "var(--font-khmer-title)" : "var(--font-sans), sans-serif",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {isKh ? "បញ្ជូនឧបករណ៍" : "SUBMIT TOOL"}
      </div>

      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          marginBottom: "24px",
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "9999px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(40, 28, 18, 0.12)",
              color: "#C2410C",
              fontSize: "11px",
              fontFamily: isKh ? "var(--font-khmer)" : "monospace",
              marginBottom: "14px",
              boxShadow: "0 4px 12px rgba(40, 28, 18, 0.04)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: user ? "#16A34A" : "#EA580C",
              }}
            />
            <span>
              {user
                ? isKh
                  ? "គណនីសកម្ម · បញ្ជូនឧបករណ៍"
                  : "CONTRIBUTOR ACTIVE · SUBMIT TOOL"
                : isKh
                  ? "ចូលរួមចំណែក · បណ្ណសាររស់"
                  : "CONTRIBUTE · LIVING ARCHIVE"}
            </span>
          </div>

          <h1
            style={{
              fontFamily: isKh
                ? "var(--font-khmer-title)"
                : "var(--font-serif), Georgia, serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 600,
              color: "#191614",
              margin: "0 0 6px",
              lineHeight: 1.25,
            }}
          >
            {isKh ? "បន្ថែមឧបករណ៍កសិកម្មថ្មី" : "Contribute a Farming Tool"}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "14.5px",
              color: "#6B635B",
              fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
            }}
          >
            {isKh
              ? "កត់ត្រាឧបករណ៍កសិកម្មបុរាណ និងការចងចាំរបស់ចាស់ទុំសម្រាប់បណ្ណសាររស់ខេត្តកំពង់ចាម"
              : "Document a traditional farming implement and its elder memory for the Kampong Cham Living Archive."}
          </p>
        </div>

        {user ? (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "9999px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(40, 28, 18, 0.1)",
              fontSize: "12px",
              color: "#57534E",
              fontFamily: isKh ? "var(--font-khmer)" : "monospace",
            }}
          >
            {isKh ? "អ្នកចូលរួម៖ " : "Contributor: "}
            <strong style={{ color: "#191614" }}>{user.email}</strong>
          </div>
        ) : (
          <Link
            href="/login?next=/contribute"
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(40, 28, 18, 0.12)",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#191614",
              fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
            }}
          >
            {isKh ? "ទំព័រចូលគណនីពេញលេញ →" : "Full Login Page →"}
          </Link>
        )}
      </div>

      {/* When logged out, show Contributor Sign-in strip */}
      {!user && <ContributeAuthPrompt onUnlocked={(u) => setUser(u)} />}

      {submitted ? (
        <div
          style={{
            width: "100%",
            maxWidth: "660px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(40, 28, 18, 0.1)",
            borderRadius: "28px",
            padding: "44px 36px",
            textAlign: "center",
            boxShadow: "0 24px 60px -15px rgba(40, 28, 18, 0.12)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#FFF7ED",
              border: "1px solid #FED7AA",
              color: "#EA580C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2
            style={{
              fontFamily: isKh
                ? "var(--font-khmer-title)"
                : "var(--font-serif), Georgia, serif",
              fontSize: "24px",
              color: "#191614",
              margin: "0 0 12px",
            }}
          >
            {isKh
              ? "សំណើរបស់អ្នកត្រូវបានបញ្ជូនសម្រាប់ការត្រួតពិនិត្យ!"
              : "Your entry has been submitted for review!"}
          </h2>

          <p
            style={{
              fontSize: "14.5px",
              lineHeight: 1.7,
              color: "#57534E",
              margin: "0 auto 28px",
              maxWidth: "480px",
              fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
            }}
          >
            {isKh
              ? "កំណត់ត្រារបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់ជួរត្រួតពិនិត្យ! វានឹងត្រូវបានផ្ទៀងផ្ទាត់ដោយអ្នកពិនិត្យបណ្ណសារ មុនពេលបង្ហាញនៅលើបណ្តុំសាធារណៈ។"
              : "Your entry has been submitted for review! It will be verified by an archivist before appearing in the public collection."}
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/my-entries"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
                color: "#FFFFFF",
                padding: "11px 22px",
                borderRadius: "9999px",
                fontSize: "13.5px",
                fontWeight: 600,
                boxShadow: "0 8px 20px rgba(234, 88, 12, 0.3)",
                fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
              }}
            >
              {isKh ? "កំណត់ត្រារបស់ខ្ញុំ" : "My Entries"}
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              style={{
                backgroundColor: "#F5F0E8",
                color: "#191614",
                border: "1px solid rgba(40, 28, 18, 0.14)",
                padding: "11px 22px",
                borderRadius: "9999px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
              }}
            >
              {isKh ? "បន្ថែមឧបករណ៍មួយទៀត" : "Submit Another Tool"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="contribute-studio-grid"
          style={{
            opacity: user ? 1 : 0.72,
            pointerEvents: user ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        >
          {/* LEFT: Main Submission Form */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(40, 28, 18, 0.1)",
              borderRadius: "28px",
              padding: "32px",
              boxShadow: "0 24px 60px -18px rgba(40, 28, 18, 0.1)",
            }}
          >
            {!user && (
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  color: "#B45309",
                  borderRadius: "14px",
                  padding: "10px 16px",
                  fontSize: "12.5px",
                  marginBottom: "20px",
                  fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                }}
              >
                {isKh
                  ? "ទម្រង់បញ្ជូនឧបករណ៍ (សូមចូលគណនីខាងលើដើម្បីបំពេញ និងបញ្ជូន)"
                  : "Submission Form (Please sign in above to complete and submit)"}
              </div>
            )}

            {submitError && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "13.5px",
                  marginBottom: "20px",
                }}
              >
                {submitError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label
                  htmlFor="title"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#44403C",
                    fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                  }}
                >
                  {isKh ? "ឈ្មោះឧបករណ៍ *" : "Tool Title *"}
                </label>
                <input
                  id="title"
                  name="title"
                  disabled={!user}
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={
                    isKh
                      ? "ឧ. នង្គ័លបុរាណ"
                      : "e.g. Traditional Wooden Plough (នង្គ័លបុរាណ)"
                  }
                  maxLength={200}
                  className="editorial-input"
                  style={{ padding: "0 16px" }}
                />
                {errors.title && (
                  <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                    {errors.title}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label
                  htmlFor="category"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#44403C",
                    fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                  }}
                >
                  {isKh ? "រដូវកាលកសិកម្ម / ប្រភេទ *" : "Season / Category *"}
                </label>
                <select
                  id="category"
                  name="category"
                  disabled={!user}
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="editorial-input"
                  style={{
                    padding: "0 14px",
                    cursor: user ? "pointer" : "default",
                    fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                  }}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                    {errors.category}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label
                  htmlFor="description"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#44403C",
                    fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                  }}
                >
                  {isKh
                    ? "ការពិពណ៌នា និងរឿងរ៉ាវចាស់ទុំ *"
                    : "Description & Oral Story *"}
                </label>
                <textarea
                  id="description"
                  name="description"
                  disabled={!user}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={
                    isKh
                      ? "ពិពណ៌នាអំពីឈើ ឬដែក ការប្រើប្រាស់តាមរដូវកាល និងការចងចាំរបស់ចាស់ទុំ..."
                      : "Describe the wood/metal craft, seasonal usage, and oral memories shared by elders..."
                  }
                  maxLength={2000}
                  className="editorial-input"
                  style={{
                    minHeight: "124px",
                    height: "auto",
                    padding: "12px 16px",
                    resize: "vertical",
                  }}
                />
                {errors.description && (
                  <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                    {errors.description}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label
                    htmlFor="contributor"
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#44403C",
                      fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                    }}
                  >
                    {isKh
                      ? "អ្នកចូលរួម (ចាស់ទុំ / ប្រភព) *"
                      : "Contributor (Elder / Source) *"}
                  </label>
                  <input
                    id="contributor"
                    name="contributor"
                    disabled={!user}
                    value={formData.contributor}
                    onChange={handleInputChange}
                    placeholder={
                      isKh
                        ? "ឧ. លោកតា សុខ (ស្រុកកំពង់សៀម)"
                        : "e.g. Grandfather Sok (Kampong Siem)"
                    }
                    className="editorial-input"
                    style={{ padding: "0 16px" }}
                  />
                  {errors.contributor && (
                    <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                      {errors.contributor}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label
                    htmlFor="place"
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#44403C",
                      fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                    }}
                  >
                    {isKh
                      ? "ទីកន្លែងកំណើត (ខេត្ត / ស្រុក) *"
                      : "Place of Origin (Province / District) *"}
                  </label>
                  <input
                    id="place"
                    name="place"
                    disabled={!user}
                    value={formData.place}
                    onChange={handleInputChange}
                    placeholder={isKh ? "ឧ. ខេត្តកំពង់ចាម" : "e.g. Kampong Cham"}
                    className="editorial-input"
                    style={{ padding: "0 16px" }}
                  />
                  {errors.place && (
                    <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                      {errors.place}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label
                  htmlFor="photo"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#44403C",
                    fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                  }}
                >
                  {isKh
                    ? "រូបថតឧបករណ៍ (JPG, PNG, WebP ក្រោម 5MB) *"
                    : "Specimen Photograph (JPG, PNG, WebP under 5MB) *"}
                </label>

                <label htmlFor="photo" className="editorial-dropzone">
                  <input
                    id="photo"
                    type="file"
                    disabled={!user}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {photo ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      {photoPreviewUrl && (
                        <img
                          src={photoPreviewUrl}
                          alt="Selected specimen preview"
                          style={{
                            width: "56px",
                            height: "56px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid rgba(40, 28, 18, 0.14)",
                          }}
                        />
                      )}
                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#191614",
                          }}
                        >
                          {photo.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "#78716C",
                            fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                          }}
                        >
                          {(photo.size / (1024 * 1024)).toFixed(2)} MB &middot;{" "}
                          {isKh ? "ចុចដើម្បីប្តូររូបថត" : "Click to replace"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: "#FFF7ED",
                          color: "#EA580C",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#191614",
                          fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                        }}
                      >
                        {isKh
                          ? "ជ្រើសរើសរូបថតពីឧបករណ៍របស់អ្នក"
                          : "Choose a photograph from your device"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#78716C",
                          marginTop: "2px",
                          fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                        }}
                      >
                        {isKh
                          ? "JPG, PNG ឬ WebP · ទំហំអតិបរមា 5 MB"
                          : "JPG, PNG, or WebP · Maximum 5 MB"}
                      </div>
                    </div>
                  )}
                </label>

                {errors.photo && (
                  <span style={{ color: "#EA580C", fontSize: "12.5px" }}>
                    {errors.photo}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!user || isSubmitting}
                style={{
                  width: "100%",
                  height: "50px",
                  marginTop: "6px",
                  borderRadius: "9999px",
                  background:
                    "linear-gradient(135deg, #FB923C 0%, #EA580C 52%, #C2410C 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: !user || isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: "0 12px 26px -8px rgba(234, 88, 12, 0.45)",
                  fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                }}
              >
                {isSubmitting
                  ? isKh
                    ? "កំពុងផ្ទុករូបភាព..."
                    : "Uploading Specimen..."
                  : isKh
                    ? "បញ្ជូនកំណត់ត្រាសម្រាប់ការត្រួតពិនិត្យ →"
                    : "Submit Entry for Review →"}
              </button>
            </form>
          </div>

          {/* RIGHT: Live Archival Card Preview + Gate Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(40, 28, 18, 0.1)",
                borderRadius: "24px",
                padding: "20px",
                boxShadow: "0 18px 40px -12px rgba(40, 28, 18, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "10.5px",
                    fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                    color: "#78716C",
                    letterSpacing: isKh ? "0" : "1px",
                  }}
                >
                  {isKh ? "ការមើលជាមុនលើធ្នើបណ្ណសារ" : "LIVE SHELF PREVIEW"}
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "#FFF7ED",
                    color: "#C2410C",
                    border: "1px solid #FED7AA",
                  }}
                >
                  {isKh ? "នឹងចូលទៅកាន់ការរង់ចាំពិនិត្យ" : "Will enter Pending Review"}
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "16px",
                  backgroundColor: "#F5F0E8",
                  border: "1px solid rgba(40, 28, 18, 0.08)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="Live tool preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#9A9086",
                      padding: "20px",
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 100 80"
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="2"
                      style={{ opacity: 0.6, marginBottom: "6px" }}
                    >
                      <path d="M 15,65 Q 40,65 60,35 L 85,15" strokeLinecap="round" />
                      <path
                        d="M 50,45 L 35,70 L 65,70 Z"
                        fill="rgba(234, 88, 12, 0.16)"
                      />
                    </svg>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                      }}
                    >
                      {isKh
                        ? "រូបថតនឹងបង្ហាញនៅទីនេះ"
                        : "Photo preview appears here"}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "10.5px",
                  fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                  color: "#EA580C",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {formData.category}
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#191614",
                  fontFamily: isKh
                    ? "var(--font-khmer-title)"
                    : "var(--font-serif), Georgia, serif",
                  margin: "0 0 8px",
                  lineHeight: 1.35,
                }}
              >
                {formData.title.trim() ||
                  (isKh
                    ? "ឈ្មោះឧបករណ៍របស់អ្នក (ឧ. នង្គ័លបុរាណ)"
                    : "Your Tool Title")}
              </h3>

              <p
                style={{
                  fontSize: "13px",
                  color: "#6B635B",
                  margin: "0 0 16px",
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                }}
              >
                {formData.description.trim() ||
                  (isKh
                    ? "រឿងរ៉ាវសិប្បកម្ម និងការចងចាំរបស់ចាស់ទុំដែលអ្នកកត់ត្រានៅទីនេះ ជួយអភិរក្សកេរដំណែលជនបទខ្មែរ។"
                    : "The craftsmanship story and elder memory you record here helps preserve rural Cambodian heritage.")}
              </p>

              <div
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #F0EAE1",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#57534E",
                  fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                }}
              >
                <span>
                  {formData.place.trim() || (isKh ? "ខេត្តកំពង់ចាម" : "Kampong Cham")}
                </span>
                <span style={{ color: "#191614", fontWeight: 600 }}>
                  {formData.contributor.trim() ||
                    (isKh ? "ប្រភពចាស់ទុំ" : "Elder Source")}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#191614",
                color: "#F5EBE1",
                borderRadius: "20px",
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: isKh ? "var(--font-khmer)" : "monospace",
                  color: "#F59E0B",
                  letterSpacing: isKh ? "0" : "1px",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                {isKh ? "ដំណើរការត្រួតពិនិត្យបណ្ណសារ" : "CURATORIAL GATE PROCESS"}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12.5px",
                  color: "#CEC6BE",
                  lineHeight: 1.6,
                  fontFamily: isKh ? "var(--font-khmer)" : "var(--font-sans)",
                }}
              >
                {isKh ? (
                  <>
                    រាល់កំណត់ត្រាដែលបានបញ្ជូនថ្មី នឹងចូលទៅក្នុងជួរ{" "}
                    <strong style={{ color: "#FFFFFF" }}>«រង់ចាំពិនិត្យ»</strong>។
                    អ្នកពិនិត្យនឹងផ្ទៀងផ្ទាត់ប្រភព និងភាពត្រឹមត្រូវ
                    មុននឹងដាក់បង្ហាញជាសាធារណៈ ដើម្បីធានាគុណភាពបណ្ណសាររស់។
                  </>
                ) : (
                  <>
                    Every new submission enters the queue as{" "}
                    <strong style={{ color: "#FFFFFF" }}>Pending Review</strong>.
                    Reviewers inspect provenance and clarity before shelving publicly,
                    keeping test clutter out of the living collection.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
