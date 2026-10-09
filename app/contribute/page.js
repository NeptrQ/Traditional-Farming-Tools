"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";

export default function ContributePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contributor: "",
    place: "",
  });
  const [photo, setPhoto] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingAuth(false);
    }
    checkAuth();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      e.target.value = "";
      setPhoto(null);
      setErrors((prev) => ({ ...prev, photo: "រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP / Please upload a JPG, PNG, or WebP image." }));
      return;
    }

    if (file.size > MAX_SIZE) {
      e.target.value = "";
      setPhoto(null);
      setErrors((prev) => ({ ...prev, photo: "ទំហំរូបភាពត្រូវតែតូចជាង 5 MB / Image size must be under 5 MB." }));
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
    const d = formData.description.trim();
    const c = formData.contributor.trim();
    const p = formData.place.trim();

    if (!t) newErrors.title = "Title is required.";
    else if (t.length > 200) newErrors.title = "Title must be 200 characters or less.";

    if (!d) newErrors.description = "Description is required.";
    else if (d.length > 2000) newErrors.description = "Description must be 2000 characters or less.";

    if (!c) newErrors.contributor = "Contributor is required.";
    if (!p) newErrors.place = "Place is required.";

    if (!photo) {
      newErrors.photo = "Photo is required.";
    } else {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(photo.type)) {
        newErrors.photo = "Only JPEG, PNG, or WEBP images are allowed.";
      } else if (photo.size > 5 * 1024 * 1024) {
        newErrors.photo = "File size must be 5MB or less.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        throw new Error("Authentication failed. Please log in again.");
      }

      const fileExt = photo.name.split('.').pop();
      const filePath = `${currentUser.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, photo);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('entries')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          contributor: formData.contributor.trim(),
          place: formData.place.trim(),
          photo_url: publicUrl,
          owner: currentUser.id
        });
        
      if (insertError) throw insertError;
      
      router.push("/");
      router.refresh();
      
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return <div className="container" style={{ padding: "var(--space-64) 1.5rem", color: "var(--color-paper)" }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: "var(--space-64) 1.5rem", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="page-animate" style={{ textAlign: "center", background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)", maxWidth: 400 }}>
          <p style={{ color: "var(--color-paper)", marginBottom: "var(--space-24)" }}>Please log in to contribute to the archive</p>
          <Link href="/login" className="btn btn-primary focus-ring">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container page-animate" style={{ padding: "var(--space-64) 1.5rem", display: "flex", justifyContent: "center" }}>
      <div style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)", width: "100%", maxWidth: 600 }}>
        <h1 className="khmer-title" style={{ color: "var(--color-straw-gold)", fontSize: 32, margin: "0 0 24px", textAlign: "center" }}>Add New Entry</h1>
        
        {submitError && <div style={{ backgroundColor: "var(--surface-soft)", border: "1px solid var(--color-ember-clay)", color: "var(--color-paper)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 14, marginBottom: "var(--space-24)" }}>{submitError}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="title" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Title</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={200}
              className="input focus-ring"
              style={{ height: 48, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }}
            />
            {errors.title && <span style={{ color: "var(--color-ember-clay)", fontSize: 13 }}>{errors.title}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="description" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={2000}
              className="input focus-ring"
              style={{ minHeight: 120, padding: 12, resize: "vertical", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }}
            />
            {errors.description && <span style={{ color: "var(--color-ember-clay)", fontSize: 13 }}>{errors.description}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="contributor" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Contributor (Elder/Source)</label>
            <input
              id="contributor"
              name="contributor"
              value={formData.contributor}
              onChange={handleInputChange}
              className="input focus-ring"
              style={{ height: 48, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }}
            />
            {errors.contributor && <span style={{ color: "var(--color-ember-clay)", fontSize: 13 }}>{errors.contributor}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="place" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Place (Province/Origin)</label>
            <input
              id="place"
              name="place"
              value={formData.place}
              onChange={handleInputChange}
              className="input focus-ring"
              style={{ height: 48, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }}
            />
            {errors.place && <span style={{ color: "var(--color-ember-clay)", fontSize: 13 }}>{errors.place}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="photo" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Photo</label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ color: "var(--color-paper)" }}
            />
            {errors.photo && <span style={{ color: "var(--color-ember-clay)", fontSize: 13 }}>{errors.photo}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary focus-ring"
            style={{ width: "100%", height: 48, marginTop: 16, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
          >
            {isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Submit Entry"}
          </button>
        </form>
      </div>
    </main>
  );
}

