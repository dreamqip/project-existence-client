import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import styles from '@/styles/Header.module.scss';
import { Button, TextInput, Title, ActionIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Search, Wallet } from 'tabler-icons-react';

import Header__menu from './Header__menu';
import Header__mobile_menu from './Header__mobile_menu';
import { updateHome } from '@/pages';

import { ORGANISATION_FACTORY_ADDRESS } from '@/config';
import {
  disconnectProvider,
  getProvider,
  updateProvider,
  getOrganisationFactoryContract,
  searchForOrganisationOrRegister,
  getSigner,
  OrganisationFactoryContract,
} from '@/contract_interactions';

export default function Header() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(getProvider() != null);
  const [contractAddr, setContractAddr] = useState({ address: '' });
  const [orgFactory, setOrgFactory] = useState<
    OrganisationFactoryContract | undefined
  >(undefined);

  const fetchData = async () => {
    let signer = getSigner();
    if (signer == null) return;

    let factory = await getOrganisationFactoryContract(
      ORGANISATION_FACTORY_ADDRESS,
    );
    if (factory != null) {
      setOrgFactory(factory);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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
            <ActionIcon
              className={styles.search__button}
              onClick={async () => {
                let searchResult = await searchForOrganisationOrRegister(
                  contractAddr.address,
                  orgFactory,
                );
                if (searchResult == null) {
                  showNotification({
                    title: 'Error',
                    color: 'red',
                    message: 'Contract or organisation not found.',
                    autoClose: 2000,
                  });
                  return;
                }
                if (searchResult[1] == 'org') {
                  router.push('/organisations/' + contractAddr.address);
                } else {
                  router.push(
                    '/organisations/' +
                      (await searchResult[0].getAddress()) +
                      '/' +
                      contractAddr.address,
                  );
                }
              }}
            >
              <Search />
            </ActionIcon>
            <TextInput
              icon={<Search />}
              placeholder='Enter Org or Reg address'
              radius='md'
              size='md'
              onChange={(event) =>
                setContractAddr({ address: event.target.value })
              }
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  let searchResult = await searchForOrganisationOrRegister(
                    contractAddr.address,
                    orgFactory,
                  );
                  if (searchResult == null) {
                    showNotification({
                      title: 'Error',
                      color: 'red',
                      message: 'Contract or organisation not found.',
                      autoClose: 2000,
                    });
                    return;
                  }
                  if (searchResult[1] == 'org') {
                    router.push('/organisations/' + contractAddr.address);
                  } else {
                    router.push(
                      '/organisations/' +
                        (await searchResult[0].getAddress()) +
                        '/' +
                        contractAddr.address,
                    );
                  }
                }
              }}
            />
          </div>
        </div>
        <div className={styles.header__right}>
          <Header__menu walletConnected={walletConnected}></Header__menu>
          <div className={styles.header__connect}>
            <Button
              leftIcon={<Wallet />}
              color='dark'
              radius='md'
              onClick={async (event) => {
                if (!walletConnected) {
                  await updateProvider();
                  const connectedProvider = getProvider();
                  if (connectedProvider) {
                    setWalletConnected(true);
                  } else {
                    setWalletConnected(false);
                    showNotification({
                      title: 'Error',
                      color: 'red',
                      message: 'Wallet has not been connected.',
                      autoClose: 2000,
                    });
                  }
                } else {
                  await disconnectProvider();
                  setWalletConnected(false);
                  updateHome();
                }
              }}
            >
              {walletConnected ? <>Disconnect</> : <>Connect</>}
            </Button>
          </div>
          <Header__mobile_menu
            walletConnected={walletConnected}
          ></Header__mobile_menu>
        </div>
      </div>
    </header>
  );
}
