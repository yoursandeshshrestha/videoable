import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSession } from "../store/slices/videoSlice";
import { fetchChatHistory } from "../store/slices/chatSlice";
import { showNotification } from "../store/slices/uiSlice";
import VideoPlayer from "../components/video/VideoPlayer";
import ChatInterface from "../components/chat/ChatInterface";
import Loading from "../components/common/Loading";

const EditorPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentSession, loading: videoLoading } = useAppSelector(
    (state) => state.video
  );
  const { currentSubtitles, currentStyle } = useAppSelector(
    (state) => state.chat
  );

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    // Only load if the current session ID doesn't match
    if (currentSession?.id === parseInt(sessionId)) {
      return;
    }

    const loadSession = async () => {
      try {
        await dispatch(fetchSession(parseInt(sessionId))).unwrap();
        await dispatch(fetchChatHistory(parseInt(sessionId))).unwrap();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load session";
        dispatch(
          showNotification({
            message: errorMessage,
            type: "error",
          })
        );
        navigate("/");
      }
    };

    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (videoLoading || !currentSession) {
    return <Loading message="Loading session..." />;
  }

  const hasSubtitles = currentSubtitles.length > 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden pt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-6 shrink-0">
          <h1 className="text-2xl font-normal text-[#37322f] mb-1 font-serif">
            {currentSession.video_filename}
          </h1>
          <p className="text-[#37322f]/60 text-sm">
            Session #{currentSession.id} •{" "}
            {hasSubtitles
              ? `${currentSubtitles.length} subtitle(s)`
              : "No subtitles yet"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Video Player - 1 column */}
          <div className="flex flex-col min-h-0">
            <VideoPlayer
              videoUrl={currentSession.video_url}
              subtitles={currentSubtitles}
              style={currentStyle}
            />
          </div>

          {/* Chat Interface - 1 column */}
          <div className="flex flex-col min-h-0">
            <ChatInterface sessionId={currentSession.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
