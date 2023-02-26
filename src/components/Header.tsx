import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Header.module.scss';
import { Button, Input, Title, ActionIcon, Drawer, Group } from '@mantine/core';
import { Search, Wallet, Menu2 } from 'tabler-icons-react';
import { useRouter } from 'next/router';

const updateProvider = require('../contract_interactions').updateProvider;
const getProvider = require('../contract_interactions').getProvider;

export default function Header() {
  const router = useRouter();
  const [opened, setOpened] = useState(false);

  const isHomePage = router.pathname === '/';
  const isOrganisationsPage = router.pathname === '/organisations';
  const isOrganisationPage = /\/organisations\/organisation-\d+/.test(
    router.pathname,
  );
  const isRegisterPage = /\/organisations\/organisation-\d+\/register-\d+/.test(
    router.pathname,
  );

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
          {isOrganisationPage && !isRegisterPage ? (
            <div className={styles.header__menu}>
              <Button radius='md'>Update Organisation</Button>
              <Button radius='md'>Deploy Register</Button>
            </div>
          ) : null}
          {isRegisterPage ? (
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
              onClick={(event) => updateProvider('testnet')}
            >
              Connect
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
