import { Link, useLocation, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import ExportButton from '../video/ExportButton';

const Header = () => {
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const isEditorPage = location.pathname.includes('/editor/');
  
  const { currentSubtitles } = useAppSelector((state) => state.chat);
  const hasSubtitles = currentSubtitles.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#37322f]/6 bg-[#f7f5f3]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="text-[#37322f] font-semibold text-lg">
            Videoable
          </Link>

          {isEditorPage && sessionId && (
            <div className="flex items-center gap-4">
              <ExportButton
                sessionId={parseInt(sessionId)}
                disabled={!hasSubtitles}
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
