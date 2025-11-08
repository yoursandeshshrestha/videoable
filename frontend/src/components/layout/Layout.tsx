import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Notification from '../common/Notification';

const Layout = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.includes('/editor/');

  return (
    <div className="h-screen bg-[#f7f5f3] flex flex-col overflow-hidden">
      <Header />
      <main className={isEditorPage ? 'flex-1 min-h-0' : 'pt-16 overflow-y-auto'}>
        <Outlet />
      </main>
      <Notification />
    </div>
  );
};

export default Layout;
