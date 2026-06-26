import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-white">
      <main className="max-w-6xl mx-auto px-2 py-2 sm:px-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
