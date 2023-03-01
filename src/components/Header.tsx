import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Header.module.scss';
import Header__menu from './Header__menu';
import Header__mobile_menu from './Header__mobile_menu';
import { ORGANISATION_FACTORY_ADDRESS } from '@/config';
import {
  Button,
  TextInput,
  Title,
  ActionIcon,
  Notification,
} from '@mantine/core';
import { Search, Wallet } from 'tabler-icons-react';
import { getProvider } from '@/contract_interactions';
import { NETWORK } from '@/config';
import {
  getOrganisationFactoryContract,
  searchForOrganisationOrRegister,
  getSigner,
  OrganisationFactoryContract,
} from '@/contract_interactions';

const updateProvider = require('../contract_interactions').updateProvider as (
  chain: 'mainnet' | 'testnet' | 'fakenet',
) => Promise<boolean>;

export default function Header() {
  const [walletConnected, setWalletConnected] = useState(getProvider() != null);
  const [contractAddr, setContractAddr] = useState({
    address: '',
  });
  const [orgFactory, setOrgFactory] = useState<
    OrganisationFactoryContract | undefined
  >(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        let signer = getSigner();
        if (signer == null) return;

        let factory = await getOrganisationFactoryContract(
          ORGANISATION_FACTORY_ADDRESS,
        );
        if (factory != null) {
          setOrgFactory(factory);
        }
      }
    };

    fetchData();

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
              onClick={() =>
                searchForOrganisationOrRegister(
                  contractAddr.address,
                  orgFactory,
                )
              }
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
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  searchForOrganisationOrRegister(
                    contractAddr.address,
                    orgFactory,
                  );
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
                await updateProvider(NETWORK);
                setWalletConnected(getProvider() != null);
              }}
            >
              {walletConnected ? <>Connected ✅</> : <>Connect</>}
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
