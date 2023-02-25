import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/Header.module.scss';
import { Button, Input, Title, Menu, ActionIcon } from '@mantine/core';
import {
  Search,
  Wallet,
  Menu2,
  AddressBook,
  Registered,
  FileImport,
  FileOff,
} from 'tabler-icons-react';
import { provider, updateProvider } from '../contract_interactions';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <div className={styles.header__left}>
          <Link className={styles.logo} href='/'>
            <Image src='/logo.png' alt='' width={40} height={40} />
            <Title order={2} className={styles.logo__text}>
              Project existence
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
              //onClick={(event) => console.log(updateProvider('testnet'))}
            >
              Connect
            </Button>
          </div>
          <div className={styles.header__burger}>
            <Menu
              shadow='md'
              width={200}
              transition='rotate-right'
              transitionDuration={150}
            >
              <Menu.Target>
                <ActionIcon>
                  <Menu2 size={40} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Input
                  icon={<Search />}
                  placeholder='Enter Org or Reg address'
                  radius='md'
                  size='md'
                />
                <Menu.Item icon={<AddressBook size={14} />}>
                  Create Organisation
                </Menu.Item>
                <Menu.Item icon={<Registered size={14} />}>
                  Deploy Register
                </Menu.Item>
                <Menu.Item icon={<FileImport size={14} />}>
                  Create Record
                </Menu.Item>
                <Menu.Item icon={<FileOff size={14} />}>
                  Invalidate Record
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
