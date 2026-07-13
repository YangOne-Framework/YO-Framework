import { useTranslation } from 'react-i18next';

const TeamMember: React.FC<{ image: string; name: string; role: string; }> = ({ image, name, role }) => (
    <div className="text-center">
        <img src={image} alt={name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover shadow-lg" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{name}</h3>
        <p className="text-gray-500 dark:text-gray-400">{role}</p>
    </div>
);

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-20">
      <section className="bg-gray-100 dark:bg-gray-800 py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100">{t('About.Title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t('About.Description')}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('About.Mission')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {t('About.Mission')}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t('About.Description')}
              </p>
            </div>
            <div>
              <img src="https://picsum.photos/seed/about-mission/600/400" alt={t('About.Mission')} className="rounded-lg shadow-xl"/>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-12">{t('About.Team')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  <TeamMember image="https://picsum.photos/seed/team1/200/200" name={t('About.TeamMember1')} role={t('About.TeamMember1Role')} />
                  <TeamMember image="https://picsum.photos/seed/team2/200/200" name={t('About.TeamMember2')} role={t('About.TeamMember2Role')} />
                  <TeamMember image="https://picsum.photos/seed/team3/200/200" name={t('About.TeamMember3')} role={t('About.TeamMember3Role')} />
                  <TeamMember image="https://picsum.photos/seed/team4/200/200" name={t('About.TeamMember1')} role={t('About.TeamMember1Role')} />
              </div>
          </div>
      </section>

    </div>
  );
};

export default About;