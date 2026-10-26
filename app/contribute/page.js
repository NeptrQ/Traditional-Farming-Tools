"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";

const CATEGORY_OPTIONS = [
  "Soil Preparation (ភ្ជួររាស់)",
  "Planting & Floods (សាបព្រោះ & ស្ទូង)",
  "The Harvest (ច្រូតកាត់)",
  "Granary & Storage (ទុកដាក់ & ជីវភាព)"
];

export default function ContributePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    category: "Soil Preparation (ភ្ជួររាស់)",
    description: "",
    contributor: "",
    place: "",
  });
  const [photo, setPhoto] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    const cat = formData.category;
    const d = formData.description.trim();
    const c = formData.contributor.trim();
    const p = formData.place.trim();

    if (!t) newErrors.title = "Title is required.";
    else if (t.length > 200) newErrors.title = "Title must be 200 characters or less.";

    if (!cat) newErrors.category = "Season / Category is required.";

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

      // Package category prefix in description to preserve categorization without schema changes
      const formattedDescription = `[Category: ${formData.category}]\n\n${formData.description.trim()}`;

      const { error: insertError } = await supabase
        .from('entries')
        .insert({
          title: formData.title.trim(),
          description: formattedDescription,
          contributor: formData.contributor.trim(),
          place: formData.place.trim(),
          photo_url: publicUrl,
          owner: currentUser.id
        });
        
      if (insertError) throw insertError;
      
      setSubmitted(true);
      setFormData({
        title: "",
        category: "Soil Preparation (ភ្ជួររាស់)",
        description: "",
        contributor: "",
        place: "",
      });
      setPhoto(null);
      
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return <div className="container" style={{ padding: "48px 1.5rem", color: "#E7E3DF" }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: "64px 1.5rem", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", backgroundColor: "#1A1715", border: "1px solid #382821", borderRadius: "16px", padding: "40px", maxWidth: 420 }}>
          <p style={{ color: "#E7E3DF", marginBottom: "24px", fontSize: "16px" }}>Please log in to contribute to the archive</p>
          <Link href="/login" className="btn btn-primary focus-ring">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container" style={{ padding: "56px 1.5rem 80px", display: "flex", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#1A1715", border: "1px solid #382821", borderRadius: "16px", padding: "40px 32px", width: "100%", maxWidth: 620, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <h1 className="khmer-title" style={{ color: "#F59E0B", fontSize: 28, margin: "0 0 8px", textAlign: "center", lineHeight: 1.6 }}>
          បន្ថែមឧបករណ៍កសិកម្មថ្មី
        </h1>
        <p style={{ textAlign: "center", color: "#A8A29E", fontSize: "14px", margin: "0 0 28px" }}>
          Contribute a traditional farming implement to the Living Archive
        </p>
        
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#E7E3DF",
              marginBottom: "32px",
              fontFamily: "var(--font-khmer), var(--font-sans)",
              padding: "20px 24px",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "12px"
            }}>
              សំណើរបស់អ្នកត្រូវបានបញ្ជូនសម្រាប់ការត្រួតពិនិត្យ! / Your entry has been submitted for review! It will be verified by an archivist before appearing in the public collection.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/my-entries" className="btn btn-primary focus-ring">
                My Entries / កំណត់ត្រារបស់ខ្ញុំ
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-secondary focus-ring"
              >
                Submit Another Tool
              </button>
            </div>
          </div>
        ) : (
          <>
            {submitError && (
              <div style={{ backgroundColor: "rgba(234, 88, 12, 0.15)", border: "1px solid #EA580C", color: "#E7E3DF", borderRadius: "8px", padding: "12px 16px", fontSize: 14, marginBottom: "24px" }}>
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="title" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Tool Title / ឈ្មោះឧបករណ៍ *
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. នង្គ័ល (Plough)"
                  maxLength={200}
                  className="input focus-ring"
                  style={{ height: 46, backgroundColor: "#12100E", border: "1px solid #382821", color: "#E7E3DF", borderRadius: "8px" }}
                />
                {errors.title && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.title}</span>}
              </div>

              {/* Season / Category Required Dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="category" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Season / Category (រដូវកាលកសិកម្ម) *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input focus-ring"
                  style={{
                    height: 46,
                    backgroundColor: "#12100E",
                    border: "1px solid #382821",
                    color: "#E7E3DF",
                    borderRadius: "8px",
                    padding: "0 12px",
                    cursor: "pointer"
                  }}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} style={{ backgroundColor: "#1A1715", color: "#E7E3DF" }}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.category && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.category}</span>}
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="description" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Description &amp; Oral Story / ការពិពណ៌នា *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the tool, its agricultural season, craftsmanship, and oral memories from elders..."
                  maxLength={2000}
                  className="input focus-ring"
                  style={{ minHeight: 120, padding: "12px", resize: "vertical", backgroundColor: "#12100E", border: "1px solid #382821", color: "#E7E3DF", borderRadius: "8px" }}
                />
                {errors.description && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.description}</span>}
              </div>

              {/* Contributor */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="contributor" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Contributor (Elder / Source) *
                </label>
                <input
                  id="contributor"
                  name="contributor"
                  value={formData.contributor}
                  onChange={handleInputChange}
                  placeholder="e.g. Grandfather Sok (Kampong Siem)"
                  className="input focus-ring"
                  style={{ height: 46, backgroundColor: "#12100E", border: "1px solid #382821", color: "#E7E3DF", borderRadius: "8px" }}
                />
                {errors.contributor && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.contributor}</span>}
              </div>

              {/* Place */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="place" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Place of Origin (Province / District) *
                </label>
                <input
                  id="place"
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  placeholder="e.g. Kampong Cham"
                  className="input focus-ring"
                  style={{ height: 46, backgroundColor: "#12100E", border: "1px solid #382821", color: "#E7E3DF", borderRadius: "8px" }}
                />
                {errors.place && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.place}</span>}
              </div>

              {/* Photo */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="photo" style={{ fontSize: 13.5, fontWeight: 600, color: "#E7E3DF" }}>
                  Photo Upload (JPG, PNG, WebP) *
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ color: "#A8A29E", fontSize: "14px" }}
                />
                {errors.photo && <span style={{ color: "#EA580C", fontSize: 12.5 }}>{errors.photo}</span>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary focus-ring"
                style={{ width: "100%", height: 48, marginTop: 8, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
              >
                {isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Submit Entry for Review"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
