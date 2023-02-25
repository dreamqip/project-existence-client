import React, { PropsWithChildren } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '@/styles/Wrapper.module.scss';

export default function Layout(props: React.PropsWithChildren) {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className='main'>{props.children}</main>
      <Footer />
    </div>
  );
}
