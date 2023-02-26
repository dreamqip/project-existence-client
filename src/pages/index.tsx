import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import OrganisationCard from '@/components/Card';
import { Input, Title } from '@mantine/core';
import { Search } from 'tabler-icons-react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <div className={styles.home__container}>
        {/* <div className={styles.home__main}>
          <Title order={1} className={styles.home__title}>
            Project Existence
          </Title>
          <div className={styles.home__search}>
            <Input
              icon={<Search />}
              placeholder='Enter Organisation or Register address'
              radius='md'
              size='xl'
            />
          </div>
        </div> */}
        <div className={styles.home__your_organisations}>
          <Title order={2} className={styles.your_organisations__title}>
            Your Organisations
          </Title>
          <div className={styles.your_organisations__cards}>
            <OrganisationCard
              title='Test Organisation'
              description='This organisation is created to show you the capabilities of our project. 
            It actively demostrates all the implemented functions and interaction between people and 
            contracts. Contacts: email.'
              badge='Featured'
              way='/organisations/organisation-1'
            />
          </div>
        </div>
      </div>
    </>
  );
}
