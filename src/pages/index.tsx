import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import { Input, Title } from '@mantine/core';
import { Search } from 'tabler-icons-react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <div className={styles.home__container}>
        <Title order={1} className={styles.home__title}>
          Project existence
        </Title>
        <div className={styles.home__search}>
          <Input
            icon={<Search />}
            placeholder='Enter Organisation or Register address'
            radius='md'
            size='xl'
          />
        </div>
        <div className={styles.home__organisations}></div>
      </div>
    </>
  );
}
