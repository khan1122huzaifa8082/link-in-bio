import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { supabase } from "../supabaseClient"; // Using the standard client
import AiAssistant from "../AiAssistant";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Dashboard() {
  const { user } = useUser();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [links, setLinks] = useState([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);

  const [hasUnsavedLinks, setHasUnsavedLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUsername(profileData.username || "");
        setDisplayName(profileData.display_name || "");
        setBio(profileData.bio || "");
        setAvatarUrl(profileData.avatar_url || "");
      }

      const { data: linksData } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (linksData) {
        setLinks(linksData);
      }
    };

    fetchData();
  }, [user]);

  // 2. Save Profile
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
    });

    if (error) {
      console.error("Save Error:", error);
      alert("Error saving profile. Check console.");
    } else {
      alert("Profile Saved! ✓");
    }
    setIsSavingProfile(false);
  };

  // 3. Image Upload (Fixed the 400 Error here)
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      // Using Date.now() guarantees no weird spaces or characters in the filename
      const fileName = `avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Add Link
  const handleAddLink = async () => {
    if (!user || !linkTitle || !linkUrl) return;
    setIsAddingLink(true);

    let finalUrl = linkUrl;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    const { data, error } = await supabase
      .from("links")
      .insert([
        {
          user_id: user.id,
          title: linkTitle,
          url: finalUrl,
          sort_order: links.length,
        },
      ])
      .select();

    if (!error && data) {
      setLinks([...links, data[0]]);
      setLinkTitle("");
      setLinkUrl("");
    } else {
      console.error("Link Error:", error);
      alert("Failed to add link.");
    }
    setIsAddingLink(false);
  };

  // 5. Delete Link
  const handleDeleteLink = async (id) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) setLinks(links.filter((link) => link.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLinks(items);
    setHasUnsavedLinks(true);
  };

  // 6. Save Link Order
  const handleSaveLinkOrder = async () => {
    setIsSavingLinks(true);
    try {
      const updatePromises = links.map((item, index) =>
        supabase.from("links").update({ sort_order: index }).eq("id", item.id),
      );
      await Promise.all(updatePromises);
      setHasUnsavedLinks(false);
    } catch (error) {
      alert("Failed to save order.");
    }
    setIsSavingLinks(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12 relative">
      <header className="bg-white shadow-sm flex justify-between items-center p-4 px-8 mb-8">
        <h1 className="text-xl font-bold text-gray-800">
          Link-in-Bio Dashboard
        </h1>
        <UserButton />
      </header>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">1. Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </label>
                  {avatarUrl && !isUploading && (
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                      ✓ Image Ready
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Username (URL)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    oursite.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 sm:text-sm"
                    placeholder="your_name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 sm:text-sm"
                  placeholder="E.g., Alex Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="2"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 sm:text-sm"
                  placeholder="Tell the world who you are..."
                ></textarea>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-black text-white py-2 px-4 rounded-md font-bold hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">2. Your Links</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-3">
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Link Title"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleAddLink}
                disabled={isAddingLink || !linkTitle || !linkUrl}
                className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isAddingLink ? "Adding..." : "+ Add New Link"}
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="links-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {links.map((link, index) => (
                      <Draggable
                        key={link.id.toString()}
                        draggableId={link.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab px-1"
                              >
                                ☰
                              </div>
                              <div className="truncate pr-4">
                                <p className="font-bold text-sm text-gray-800">
                                  {link.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {link.url}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {hasUnsavedLinks && (
              <button
                onClick={handleSaveLinkOrder}
                disabled={isSavingLinks}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md font-bold hover:bg-green-700 disabled:bg-gray-400 animate-pulse"
              >
                {isSavingLinks ? "Saving Order..." : "Save New Link Order"}
              </button>
            )}
          </section>
        </div>

        <div className="flex justify-center items-start lg:sticky lg:top-8">
          <div className="w-[320px] h-[650px] bg-gray-900 rounded-[3rem] border-8 border-black shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-3xl w-40 mx-auto z-10"></div>
            <div className="bg-gray-50 w-full h-full pt-16 px-6 flex flex-col items-center overflow-y-auto pb-10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4 shadow-sm object-cover border-2 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 shadow-sm flex items-center justify-center text-4xl text-gray-500">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <h3 className="font-bold text-xl text-gray-900 text-center">
                {displayName || "Your Name"}
              </h3>
              <p className="text-xs font-bold text-gray-400 mt-1 mb-3">
                @{username || "username"}
              </p>
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed whitespace-pre-wrap">
                {bio || "Your bio will appear here."}
              </p>
              <div className="w-full space-y-4">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center font-bold text-gray-800 hover:scale-105 transition-transform"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AiAssistant />
    </div>
  );
}
