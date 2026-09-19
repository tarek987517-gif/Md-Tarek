import React, { useState, useEffect } from 'react';
import { User, NewsArticle, Category, AdItem, SiteSettings, MediaItem, ActivityLog, AdSettings } from '../types';
import { AdminSidebar, AdminViewType } from './admin/AdminSidebar';
import { AdminHeader } from './admin/AdminHeader';
import { DashboardOverview } from './admin/views/DashboardOverview';
import { NewsEditorView } from './admin/views/NewsEditorView';
import { NewsListView } from './admin/views/NewsListView';
import { MediaLibraryView } from './admin/views/MediaLibraryView';
import { UserManagementView } from './admin/views/UserManagementView';
import { AdsManagementView } from './admin/views/AdsManagementView';
import { DeploymentSystemView } from './admin/views/DeploymentSystemView';
import { ActivityLogsView } from './admin/views/ActivityLogsView';
import { BackupRestoreView } from './admin/views/BackupRestoreView';
import { CategoriesView } from './admin/views/CategoriesView';
import { SiteSettingsView } from './admin/views/SiteSettingsView';
import { api } from '../lib/api';

interface AdminDashboardProps {
  currentUser: User;
  onClose: () => void;
  onLogout: () => void;
  categories: Category[];
  allNews: NewsArticle[];
  ads: Record<string, AdItem>;
  siteSettings: SiteSettings;
  onRefreshData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onClose,
  onLogout,
  categories,
  allNews,
  ads,
  siteSettings,
  onRefreshData
}) => {
  const [currentView, setCurrentView] = useState<AdminViewType>('dashboard');
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentVersion, setCurrentVersion] = useState('v2.5.0');

  // Load secondary data: Media, logs & version
  const loadCmsData = async () => {
    try {
      const [mediaRes, logsRes, depRes] = await Promise.allSettled([
        api.getMedia(),
        api.getActivityLogs(),
        api.getDeployments()
      ]);

      if (mediaRes.status === 'fulfilled') {
        setMediaList(mediaRes.value.media || []);
      }
      if (logsRes.status === 'fulfilled') {
        setActivityLogs(logsRes.value.logs || []);
      }
      if (depRes.status === 'fulfilled' && depRes.value.currentVersion) {
        setCurrentVersion(depRes.value.currentVersion);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setCurrentView('news_add');
  };

  const handleAddNewNews = () => {
    setEditingArticle(null);
    setCurrentView('news_add');
  };

  const handleNewsSaveSuccess = async (savedArticle: NewsArticle) => {
    await onRefreshData();
    await loadCmsData();
    setEditingArticle(null);
    setCurrentView('news_all');
  };

  return (
    <div id="haor-cms-root" className="fixed inset-0 z-50 flex bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Fixed Sidebar for Desktop & Drawer for Mobile */}
      <AdminSidebar
        currentView={currentView}
        onSelectView={view => {
          if (view === 'news_add' && currentView !== 'news_add') {
            setEditingArticle(null);
          }
          setCurrentView(view);
        }}
        currentUser={currentUser}
        onLogout={onLogout}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        onReturnToSite={onClose}
        currentVersion={currentVersion}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 h-full">
        {/* Sticky Header */}
        <AdminHeader
          currentView={currentView}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onSelectView={view => {
            if (view === 'news_add') setEditingArticle(null);
            setCurrentView(view);
          }}
          currentUser={currentUser}
          onReturnToSite={onClose}
          currentVersion={currentVersion}
        />

        {/* Scrollable View Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardOverview
                allNews={allNews}
                currentUser={currentUser}
                onSelectView={setCurrentView}
                onEditArticle={handleEditArticle}
                recentActivities={activityLogs}
                currentVersion={currentVersion}
              />
            )}

            {currentView === 'news_add' && (
              <NewsEditorView
                initialArticle={editingArticle}
                categories={categories}
                currentUser={currentUser}
                onSaveSuccess={handleNewsSaveSuccess}
                onCancel={() => {
                  setEditingArticle(null);
                  setCurrentView('news_all');
                }}
                mediaList={mediaList}
              />
            )}

            {(currentView === 'news_all' ||
              currentView === 'news_draft' ||
              currentView === 'news_breaking' ||
              currentView === 'news_featured') && (
              <NewsListView
                filterType={
                  currentView === 'news_draft'
                    ? 'draft'
                    : currentView === 'news_breaking'
                    ? 'breaking'
                    : currentView === 'news_featured'
                    ? 'featured'
                    : 'all'
                }
                allNews={allNews}
                categories={categories}
                currentUser={currentUser}
                onEditArticle={handleEditArticle}
                onAddNewNews={handleAddNewNews}
                onRefreshData={async () => {
                  await onRefreshData();
                  await loadCmsData();
                }}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesView
                categories={categories}
                allNews={allNews}
                currentUser={currentUser}
                onRefreshData={onRefreshData}
              />
            )}

            {currentView === 'media' && (
              <MediaLibraryView
                mediaList={mediaList}
                currentUser={currentUser}
                onRefreshMedia={loadCmsData}
              />
            )}

            {currentView === 'ads' && (
              <AdsManagementView
                initialAds={ads as unknown as AdSettings}
                currentUser={currentUser}
                onRefreshData={onRefreshData}
              />
            )}

            {currentView === 'users' && (
              <UserManagementView currentUser={currentUser} />
            )}

            {currentView === 'deployments' && (
              <DeploymentSystemView currentUser={currentUser} />
            )}

            {currentView === 'activity_logs' && (
              <ActivityLogsView currentUser={currentUser} />
            )}

            {currentView === 'backup' && (
              <BackupRestoreView
                currentUser={currentUser}
                onRefreshData={async () => {
                  await onRefreshData();
                  await loadCmsData();
                }}
              />
            )}

            {currentView === 'settings' && (
              <SiteSettingsView
                initialSettings={siteSettings}
                currentUser={currentUser}
                onRefreshData={onRefreshData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
