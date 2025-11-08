import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { uploadVideo } from "../store/slices/videoSlice";
import { showNotification } from "../store/slices/uiSlice";
import { Hero } from "../components/landing/Hero";
import { FAQ } from "../components/landing/FAQ";
import { Footer } from "../components/landing/Footer";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await dispatch(uploadVideo(file)).unwrap();
      dispatch(
        showNotification({
          message: "Video uploaded successfully!",
          type: "success",
        })
      );
      navigate(`/editor/${result.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload video";
      dispatch(
        showNotification({
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f3]">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Hero onGetStartedClick={handleButtonClick} uploading={uploading} />
      <FAQ />
      <Footer />
    </div>
  );
};

export default HomePage;
