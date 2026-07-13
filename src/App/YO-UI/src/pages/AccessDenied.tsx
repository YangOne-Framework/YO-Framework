
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const AccessDenied: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-20 min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <SEO title={t('AccessDenied.Title')} description={t('AccessDenied.Description')} />
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{t('AccessDenied.Title')}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8 max-w-md">
          {t('AccessDenied.Description')}
      </p>
      <div className="flex gap-4">
        <a href={'/'} className="px-6 py-3 rounded-md font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors">{t('AccessDenied.GoHome')}</a>
        <a href={'/login'} className="px-6 py-3 rounded-md font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors">{t('AccessDenied.LogIn')}</a>
      </div>
    </div>
  );
};
export default AccessDenied;
