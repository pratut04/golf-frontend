import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState([]);
  //const [previewImages, setPreviewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (type, message, id) => {
    if (!toast.isActive(id)) {
      toast[type](message, { toastId: id });
    }
  };
  const [preview, setPreview] = useState(null);



  useEffect(() => {
    loadCharities();
  }, []);

  const loadCharities = async () => {
    try {
      const res = await API.get("/charities");
      setCharities(res.data.data);
    } catch (err) {
      console.error("CHARITIES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
    };
  }, []);


  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) {
        reject("Not a file");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);



  // ================= ADD =================
  const addCharity = async () => {
    if (adding) return;

    if (!name.trim()) {
      showToast("warning", "Enter charity name", "charity-name");
      return;
    }

    try {
      setAdding(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      images.forEach((file) => {
        formData.append("images", file);
      });

      await API.post("/charities", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showToast("success", "Charity added", "charity-added");

      setName("");
      setDescription("");
      setImages([]);

      loadCharities();

    } catch (err) {
      showToast("error", "Failed to add charity", "charity-failed");
    } finally {
      setAdding(false);
    }
  };

  // ================= UPDATE =================
  const updateCharity = async (id) => {
    try {
      setUpdatingId(id); // 🔥 start loading

      const formData = new FormData();
      formData.append("name", editName);
      formData.append("description", editDescription);

      if (editImage) {
        Array.from(editImage).forEach((file) => {
          formData.append("images", file);
        });
      }

      await API.put(`/charities/${id}`, formData);

      showToast("success", "Charity updated", "charity-updated");

      setEditingId(null);
      loadCharities();

    } catch (err) {
      console.error(err.response?.data || err.message);
      showToast("error", "Update failed", "charity-update-failed");
    } finally {
      setUpdatingId(null); // 🔥 stop loading
    }
  };

  // ================= DELETE =================
  const deleteCharity = async (id) => {
    try {
      await API.delete(`/charities/${id}`);
      showToast("success", "Charity deleted ✅", "charity-deleted");

      loadCharities(); // refresh list
    } catch (err) {
      showToast("error", "Delete failed", "charity-delete-failed");
    }
  };

  //================== DELETE IMAGE =================
  const deleteImage = async (id) => {
    try {
      await API.delete("/charity-image", {
        data: { id }
      });

      showToast("success", "Image deleted", "img-delete");

      loadCharities(); // refresh UI

    } catch (err) {
      console.error(err);
      showToast("error", "Delete failed", "img-delete-fail");
    }
  };

  //console.log("Is File", images[0] instanceof File);
  return (
    <div style={card}>
      <h3>❤️ Charity Management</h3>

      {/* ADD FORM */}
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Charity name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <input
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={input}
        />
        {/* IMAGE UPLOAD drag drop */}
        <div
          style={{
            border: "2px dashed #94a3b8",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: "10px",
            cursor: "pointer",
            background: "#0f172a"
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const files = [...e.dataTransfer.files]; // ✅ CORRECT

            const imageFiles = files.filter(file =>
              file.type.startsWith("image/")
            );

            console.log("DROPPED:", imageFiles);

            setImages(prev => [
              ...prev,
              ...imageFiles.filter(f => f instanceof File)
            ]);
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <p style={{ margin: 0, color: "#cbd5f5" }}>
            Drag & Drop Images OR Click to Upload
          </p>

          <input
            id="fileInput"
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files);

              console.log("FILES:", files); // ✅ DEBUG
              setImages(prev => [
                ...prev,
                ...files.filter(f => f instanceof File)
              ]);
              e.target.value = null; // 🔥 VERY IMPORTANT FIX
            }}
          />
        </div>


        <p style={{ color: "white" }}>
          Images count: {images.length}
        </p>
        <p style={{ color: "yellow" }}>
          First file type: {images[0]?.type}
        </p>


        {/* PREVIEW SELECTED IMAGES */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {previewUrls.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>

              <img
                src={url}
                alt="preview"
                onClick={() => setPreview(url)}   // 🔥 ADD CLICK PREVIEW
                style={{
                  width: "120px",              // 🔥 bigger
                  height: "120px",
                  objectFit: "contain",
                  background: "#fff",
                  padding: "6px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  cursor: "pointer"
                }}
              />

              <button
                onClick={() =>
                  setImages(prev => prev.filter((_, i) => i !== index))
                }
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  width: "20px",
                  height: "20px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                }}
              >
                ✕
              </button>

            </div>
          ))}
        </div>


        <button onClick={addCharity} style={btn} disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading charities...</p>
      ) : charities.length === 0 ? (
        <p>No charities available</p>
      ) : (
        charities.map((c, index) => (
          <div key={c.id} style={item}>

            {/* LEFT */}
            <div style={leftBox}>
              <div style={{ display: "flex", gap: "5px" }}>
                {c.images?.length > 0 ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {c.images.map((imgObj) => (
                      <div key={imgObj.id} style={{ position: "relative" }}>

                        <img
                          src={imgObj.image}
                          style={imageStyle}
                          alt="charity"
                          onClick={() => setPreview(imgObj.image)}
                        />

                        {/* ❌ DELETE BUTTON */}
                        <button
                          onClick={() => deleteImage(imgObj.id)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "20px",
                            height: "20px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                          }}
                        >
                          ✕
                        </button>

                      </div>
                    ))}
                  </div>
                ) : (
                  <img
                    src="https://via.placeholder.com/40"
                    style={imageStyle}
                    alt="placeholder"
                  />
                )}
              </div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  #{index + 1} {c.name}
                </div>

                {c.description && (
                  <div style={descText}>
                    {c.description}
                  </div>
                )}

                <span
                  style={{
                    background: "#22c55e",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    marginLeft: "8px"
                  }}
                >
                  👤 {c.users_count}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            {editingId === c.id ? (
              <div style={rightBox}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={input}
                />

                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Edit description"
                  style={input}
                />

                <input
                  type="file"
                  multiple
                  onChange={(e) => setEditImage(e.target.files)}
                />

                <button
                  onClick={() => updateCharity(c.id)}
                  style={{
                    ...btn,
                    opacity: updatingId === c.id ? 0.6 : 1,
                    cursor: updatingId === c.id ? "not-allowed" : "pointer"
                  }}
                  disabled={updatingId === c.id}
                >
                  {updatingId === c.id ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  style={deleteBtn}
                  disabled={updatingId === c.id}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={rightBox}>
                <button
                  style={editBtn}
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name);
                    setEditDescription(c.description || "");
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    const count = c.users_count || 0;

                    // ❌ STOP BEFORE confirm
                    if (count > 0) {
                      showToast("error", `Cannot delete: used by ${count} user${count > 1 ? "s" : ""} `, "charity-in-use");
                      return;
                    }

                    // ✅ Only here confirm
                    if (!window.confirm("Delete this charity?")) return;

                    deleteCharity(c.id);
                  }}
                  style={{
                    background: (c.users_count || 0) > 0 ? "#9ca3af" : "#ef4444",
                    cursor: (c.users_count || 0) > 0 ? "not-allowed" : "pointer",
                    opacity: (c.users_count || 0) > 0 ? 0.6 : 1,
                    padding: "6px 10px",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    fontWeight: "500"
                  }}
                  title={
                    (c.users_count || 0) > 0
                      ? "Cannot delete: already used by users"
                      : "Delete charity"
                  }
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* PREVIEW */}
      {preview && (
        <div style={previewOverlay} onClick={() => setPreview(null)}>
          <img
            src={preview}
            style={previewImage}
            alt="preview"
            onClick={(e) => e.stopPropagation()}  // 🔥 ADD THIS
          />
        </div>
      )}
    </div>
  );
}

export default AdminCharities;

// 🎨 styles
const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  color: "white"
};

const input = {
  padding: "8px",
  marginRight: "10px",
  marginBottom: "8px",
  borderRadius: "6px",
  border: "none"
};

const btn = {
  padding: "8px 12px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const item = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  borderBottom: "1px solid #333"
};

const leftBox = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const rightBox = {
  display: "flex",
  gap: "8px"
};

const imageStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  objectFit: "cover",
  cursor: "pointer"
};

const descText = {
  fontSize: "12px",
  opacity: 0.7
};

const countBadge = {
  marginTop: "4px",
  background: "#22c55e",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "12px"
};

const editBtn = {
  padding: "6px 10px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "6px 10px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const previewOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const previewImage = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: "10px"
};