"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FAF7F2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #E8E2D8",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2D241E",
    marginBottom: "24px",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#5C5248",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #E8E2D8",
    borderRadius: "8px",
    backgroundColor: "#FAF7F2",
    color: "#2D241E",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #E8E2D8",
    borderRadius: "8px",
    backgroundColor: "#FAF7F2",
    color: "#2D241E",
    minHeight: "120px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fileInput: {
    display: "block",
    width: "100%",
    fontSize: "14px",
    color: "#5C5248",
    marginTop: "4px",
  },
  errorMsg: {
    color: "#D32F2F",
    fontSize: "13px",
    marginTop: "4px",
    display: "block",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#B87314",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "12px",
  },
  disabledBtn: {
    backgroundColor: "#D4A373",
    cursor: "not-allowed",
  },
  loginMsg: {
    textAlign: "center",
    fontSize: "18px",
    color: "#5C5248",
  },
  linkBtn: {
    display: "inline-block",
    marginTop: "16px",
    padding: "10px 20px",
    backgroundColor: "#B87314",
    color: "#FFFFFF",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
  },
  globalError: {
    padding: "12px",
    backgroundColor: "#FDECEA",
    color: "#D32F2F",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    border: "1px solid #F5C6CB",
  }
};

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
    return <div style={styles.container}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loginMsg}>Please log in to contribute to the archive</p>
          <div style={{ textAlign: "center" }}>
            <Link href="/login" style={styles.linkBtn}>Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Add New Entry</h1>
        
        {submitError && <div style={styles.globalError}>{submitError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              style={styles.input}
              value={formData.title}
              onChange={handleInputChange}
              maxLength={200}
            />
            {errors.title && <span style={styles.errorMsg}>{errors.title}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              style={styles.textarea}
              value={formData.description}
              onChange={handleInputChange}
              maxLength={2000}
            />
            {errors.description && <span style={styles.errorMsg}>{errors.description}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="contributor">Contributor (Elder/Source)</label>
            <input
              id="contributor"
              name="contributor"
              style={styles.input}
              value={formData.contributor}
              onChange={handleInputChange}
            />
            {errors.contributor && <span style={styles.errorMsg}>{errors.contributor}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="place">Place (Province/Origin)</label>
            <input
              id="place"
              name="place"
              style={styles.input}
              value={formData.place}
              onChange={handleInputChange}
            />
            {errors.place && <span style={styles.errorMsg}>{errors.place}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="photo">Photo</label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={styles.fileInput}
              onChange={handleFileChange}
            />
            {errors.photo && <span style={styles.errorMsg}>{errors.photo}</span>}
          </div>

          <button 
            type="submit" 
            style={{ ...styles.submitBtn, ...(isSubmitting ? styles.disabledBtn : {}) }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Submit Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
