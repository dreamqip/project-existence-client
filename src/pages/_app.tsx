import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import Layout from '@/components/Layout';
import { Notifications } from '@mantine/notifications';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        /** Put your mantine theme override here */
        colorScheme: 'dark',
        colors: {
          'ocean-blue': [
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
            '#023020',
          ],
        },
      }}
    >
      <Notifications />
      <Layout>
        <Head>
          <title>Project Existence</title>
        </Head>
        <Component {...pageProps} />
      </Layout>
    </MantineProvider>
  );
}
