import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import { Input, Title } from '@mantine/core';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <div className={styles.home__container}>
        <Title order={1} className={styles.logo__text}>
          Project existence
        </Title>
        <div className={styles.home__search}></div>
      </div>
    </>
  );
}
