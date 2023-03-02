import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import Layout from '@/components/Layout';
import { Notifications } from '@mantine/notifications';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        /** Put your mantine theme override here */
        colorScheme: 'dark',
      }}
    >
      <Notifications />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MantineProvider>
  );
}
