import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Header.module.scss';
import { Button, Input, Title, ActionIcon, Drawer, Group } from '@mantine/core';
import { Search, Wallet, Menu2 } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { getProvider } from '@/contract_interactions';
import { NETWORK } from '@/config';

const updateProvider = require('../contract_interactions').updateProvider as (
  chain: 'mainnet' | 'testnet' | 'fakenet',
) => Promise<boolean>;

export default function Header() {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [walletConnected, setWalletConnected] = useState(getProvider() != null);

  const isHomePage = router.pathname === '/';
  const isOrganisationsPage = router.pathname === '/organisations';
  const isOrganisationPage = /\/organisations\/.+/.test(router.pathname);
  const isRegisterPage = /\/organisations\/.+\/.+/.test(router.pathname);

  console.log("Org page?", isOrganisationPage);

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <div className={styles.header__left}>
          <Link className={styles.logo} href='/'>
            <Title order={2} className={styles.logo__text}>
              Project Existence
            </Title>
          </Link>
          <div className={styles.header__search}>
            <ActionIcon className={styles.search__button}>
              <Search />
            </ActionIcon>
            <Input
              icon={<Search />}
              placeholder='Enter Org or Reg address'
              radius='md'
              size='md'
            />
          </div>
        </div>
        <div className={styles.header__right}>
          {isHomePage ? null : null}
          {isOrganisationsPage ? (
            <div className={styles.header__menu}>
              <Button radius='md'>Create Organisation</Button>
            </div>
          ) : null}
          {isOrganisationPage && !isRegisterPage && walletConnected ? (
            <div className={styles.header__menu}>
              <Button radius='md'>Update Organisation</Button>
              <Button radius='md'>Deploy Register</Button>
            </div>
          ) : null}
          {isRegisterPage && walletConnected ? (
            <div className={styles.header__menu}>
              <Button radius='md'>Create Record</Button>
              <Button radius='md'>Invalidate Record</Button>
              <Button radius='md'>Update Register</Button>
            </div>
          ) : null}
          <div className={styles.header__connect}>
            <Button
              leftIcon={<Wallet />}
              color='dark'
              radius='md'
              onClick={async (event) => {
                await updateProvider(NETWORK);
                setWalletConnected(getProvider() != null);
              }}
            >
              {walletConnected ? <>Connected ✅</> : <>Connect</>}
            </Button>
          </div>
          <div className={styles.header__burger}>
            <Drawer
              opened={opened}
              onClose={() => setOpened(false)}
              title='Menu'
              padding='xl'
              size='xl'
              position='right'
            >
              <ActionIcon className={styles.search__button}>
                <Search />
              </ActionIcon>
              <Input
                icon={<Search />}
                placeholder='Enter Org or Reg address'
                radius='md'
                size='md'
              />
              {isHomePage ? null : null}
              {isOrganisationsPage ? (
                <div className={styles.header__mobile_menu}>
                  <Button radius='md'>Create Organisation</Button>
                </div>
              ) : null}
              {isOrganisationPage && !isRegisterPage ? (
                <div className={styles.header__mobile_menu}>
                  <Button radius='md'>Update Organisation</Button>
                  <Button radius='md'>Deploy Register</Button>
                </div>
              ) : null}
              {isRegisterPage ? (
                <div className={styles.header__mobile_menu}>
                  <Button radius='md'>Create Record</Button>
                  <Button radius='md'>Invalidate Record</Button>
                  <Button radius='md'>Update Register</Button>
                </div>
              ) : null}
            </Drawer>
            <Group position='center'>
              <Button onClick={() => setOpened(true)} variant='subtle' compact>
                <Menu2 size={25} />
              </Button>
            </Group>
          </div>
        </div>
      </div>
    </header>
  );
}
