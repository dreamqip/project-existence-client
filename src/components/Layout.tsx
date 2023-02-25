import React, { PropsWithChildren } from 'react';
import Header from './Header';

export default function Layout(props: React.PropsWithChildren) {
  return (
    <div className='wrapper'>
      <Header />
      <main className='main'>{props.children}</main>
    </div>
  );
}
