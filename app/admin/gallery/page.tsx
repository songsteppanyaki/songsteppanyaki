
"use client";

import { useEffect, useState } from "react";

type UploadedFile = {
  name: string;
  url: string;
  type: "image" | "video";
  publicId: string;
  title?: string;
  description?: string;
};

export default function GalleryAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/gallery/auth")
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, []);

  const loadGallery = async () => {
    try {
      const response = await fetch("/api/gallery");

      if (!response.ok) {
        throw new Error("Failed to load gallery.");
      }

      const data = await response.json();

      const items: UploadedFile[] = (data.items || []).map(
        (item: any) => ({
          name: item.title || item.publicId,
          url: item.url,
          type: item.type === "video" ? "video" : "image",
          publicId: item.publicId,
          title: item.title || "",
          description: item.description || "",
        })
      );

      setUploadedFiles(items);
    } catch (error) {
      console.error("Failed to load gallery:", error);
    }
  };

  useEffect(() => {
    void loadGallery();
  }, []);

  const handleLogin = async () => {
    if (!password) {
      setLoginError("Please enter the password.");
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError("");

      const response = await fetch("/api/gallery/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Invalid password.");
        return;
      }

      setAuthenticated(true);
      setPassword("");
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/gallery/auth", {
        method: "DELETE",
      });

      setAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDelete = async (
    publicId: string,
    type: "image" | "video"
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo/video?"
    );

    if (!confirmed) return;

    try {
      setMessage("Deleting...");

      const response = await fetch("/api/gallery/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          resourceType: type,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Delete failed.");
      }

      await loadGallery();
      setMessage("Deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);

      setMessage(
        error instanceof Error
          ? `Delete failed: ${error.message}`
          : "Delete failed. Please try again."
      );
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    setFiles(selectedFiles);

    setMessage(
      selectedFiles.length
        ? `${selectedFiles.length} file(s) selected.`
        : ""
    );
  };

  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Please choose at least one photo or video.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading...");

      for (const file of files) {
        const fileTitle =
          title.trim() || file.name.replace(/\.[^/.]+$/, "");

        const fileDescription = description.trim();

        const signUrl = new URL(
          "/api/gallery/sign",
          window.location.origin
        );

        signUrl.searchParams.set("title", fileTitle);
        signUrl.searchParams.set("description", fileDescription);

        const signResponse = await fetch(signUrl.toString());

        if (!signResponse.ok) {
          const errorData = await signResponse.json().catch(() => null);

          throw new Error(
            errorData?.error ||
              `Could not get upload signature for ${file.name}.`
          );
        }

        const {
  signature,
  timestamp,
  cloudName,
  apiKey,
  uploadPreset,
  folder,
  context,
  displayName,
} = await signResponse.json();

        const formData = new FormData();
formData.append("file", file);
formData.append("api_key", apiKey);
formData.append("timestamp", String(timestamp));
formData.append("signature", signature);
formData.append("upload_preset", uploadPreset);
formData.append("folder", folder);
formData.append("context", context);
formData.append("display_name", displayName);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await uploadResponse.json();

        if (!uploadResponse.ok) {
          console.error("Cloudinary upload error:", result);

          throw new Error(
            result?.error?.message || `Upload failed: ${file.name}`
          );
        }
      }

      await loadGallery();

      setFiles([]);
      setTitle("");
      setDescription("");
      setMessage("Upload completed successfully.");

      const fileInput = document.getElementById(
        "gallery-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

} catch (error) {
  console.error("Gallery upload error:", error);

  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  setMessage(`Upload failed: ${errorMessage}`);
} finally {
  setUploading(false);
}
  };

  if (authenticated === null) {
    return (
      <main className="min-h-screen bg-neutral-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-md pt-20 text-center">
          <p className="text-neutral-400">Checking access...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-md pt-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
              SONG TEPPANYAKI
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Gallery Admin Login
            </h1>

            <p className="mt-3 text-sm text-neutral-400">
              Enter the administrator password to manage photos and videos.
            </p>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleLogin();
                }
              }}
              placeholder="Admin password"
              className="mt-6 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-amber-400"
            />

            {loginError && (
              <p className="mt-3 text-sm text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={loggingIn}
              className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
                SONG TEPPANYAKI
              </p>

              <h1 className="mt-3 text-4xl font-black">
                Gallery Management
              </h1>

              <p className="mt-4 text-neutral-400">
                Add and manage photos and videos for Experience Song Teppanyaki.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-red-400 px-5 py-2 text-sm font-bold text-red-400 transition hover:bg-red-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-2xl font-black">
            Add Photos / Videos
          </h2>

          <p className="mt-3 text-sm text-neutral-400">
            Select photos or videos and upload them to your gallery.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-neutral-200">
              Display Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Outdoor Hibachi Party"
                maxLength={120}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-amber-400"
              />
            </label>

            <label className="block text-sm font-semibold text-neutral-200 sm:col-span-2">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write a short description for customers..."
                maxLength={500}
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-amber-400"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <label
              htmlFor="gallery-file"
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-amber-400 px-6 py-3 font-bold text-black transition hover:bg-amber-300"
            >
              + Choose Photos / Videos
            </label>

            <input
              id="gallery-file"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={uploading || files.length === 0}
              className="rounded-full border border-amber-400 px-6 py-3 font-bold text-amber-400 transition hover:bg-amber-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {message && (
            <p className="mt-5 break-words rounded-xl bg-white/5 p-4 text-sm text-amber-400">
              {message}
            </p>
          )}

          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold">Selected Files</h3>

              <div className="mt-3 space-y-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="rounded-xl bg-white/5 px-4 py-3 text-sm text-neutral-300"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-bold">Gallery Files</h3>

            {uploadedFiles.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-400">
                No gallery files found.
              </p>
            ) : (
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.publicId}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black"
                  >
                    {file.type === "video" ? (
                      <video
                        src={file.url}
                        controls
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={file.url}
                        alt={file.title || file.name}
                        className="h-56 w-full object-cover"
                      />
                    )}

                    <div className="px-4 pt-3">
                      <p className="break-words text-sm font-semibold text-white">
                        {file.title || file.name}
                      </p>

                      {file.description && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-400">
                          {file.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(file.publicId, file.type)
                      }
                      className="mx-4 mb-4 mt-3 w-[calc(100%-2rem)] rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
