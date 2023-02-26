import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Header.module.scss';
import {
  Button,
  Input,
  Title,
  Menu,
  ActionIcon,
  Drawer,
  Group,
} from '@mantine/core';
import {
  Search,
  Wallet,
  Menu2,
  AddressBook,
  Registered,
  FileImport,
  FileOff,
  FileStar,
} from 'tabler-icons-react';

const updateProvider = require('../contract_interactions').updateProvider;
const getProvider = require('../contract_interactions').getProvider;

export default function Header() {
  const [opened, setOpened] = useState(false);
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
            <Input
              icon={<Search />}
              placeholder='Enter Org or Reg address'
              radius='md'
              size='md'
            />
          </div>
        </div>
        <div className={styles.header__right}>
          <div className={styles.header__menu}>
            <Button radius='md'>Create Organisation</Button>
            <Button radius='md'>Deploy Register</Button>
            <Button radius='md'>Create Record</Button>
            <Button radius='md'>Invalidate Record</Button>
          </div>

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
              <Input
                icon={<Search />}
                placeholder='Enter Org or Reg address'
                radius='md'
                size='md'
              />
              <div className={styles.header__mobile_menu}>
                <Button radius='md'>Create Organisation</Button>
                <Button radius='md'>Deploy Register</Button>
                <Button radius='md'>Create Record</Button>
                <Button radius='md'>Invalidate Record</Button>
              </div>
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
