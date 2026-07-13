import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <PageMeta
        title={t('NotFound.Title')}
        description={t('NotFound.Description')}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 text-white font-sans">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('#')",
            filter: "brightness(0.4)"
          }}
        />

        {/* Content Container */}
        <div className={`relative z-10 mx-auto w-full max-w-screen-md px-6 text-center transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          {/* Brand Label */}
          <div className="mb-6 tracking-[0.2em] text-sm font-medium uppercase text-gray-300">
            {t('NotFound.Title')}
          </div>

          {/* Large 404 Text */}
          <h1 className="mb-4 text-9xl font-black tracking-tighter text-white opacity-90 sm:text-[12rem] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
            style={{ WebkitTextStroke: '2px transparent' }}>
            {t('NotFound.Heading')}
          </h1>

          {/* Message */}
          <h2 className="mb-6 text-2xl font-bold leading-tight text-white sm:text-4xl">
            {t('NotFound.Title')}
          </h2>

          <p className="mb-10 text-lg text-gray-300 sm:w-2/3 mx-auto">
            {t('NotFound.Description')}
          </p>

          {/* CTA Button */}
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-white px-8 py-4 font-bold text-gray-900 transition-all duration-300 hover:bg-gray-100 hover:ring-4 hover:ring-white/20 active:scale-95"
          >
            <span className="mr-2">{t('NotFound.BackToHome')}</span>
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div className={`absolute bottom-8 left-0 w-full text-center text-sm text-gray-500 transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          &copy; {new Date().getFullYear()} {t('About.Title')}. {t('NotFound.BackToHome')}
        </div>
      </div>
    </>
  );
}
