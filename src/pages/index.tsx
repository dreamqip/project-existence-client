import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import { Button, Title, Notification, Modal } from '@mantine/core';

import OrganisationCard from '@/components/Card';
import CreateOrganisationForm from '@/components/forms/CreateOrganisationForm';

import {
  getOrganisationContract,
  getOrganisationFactoryContract,
  getSigner,
  OrganisationContract,
  organisationsOfOwner,
} from '@/contract_interactions';

import { FEATURED_ORGANISATIONS, ORGANISATION_FACTORY_ADDRESS } from '@/config';
import { parseMetadata, waitFor } from '@/utils';

const inter = Inter({ subsets: ['latin'] });

export let updateHome = () => {};

export default function Home() {
  const [orgModalOpened, setOrgModalOpened] = useState(false);

  const [yourOrganisationsCards, setYourOrganisationsCards] = useState([
    <React.Fragment key='1'>
      <Notification
        withCloseButton={false}
        color='blue'
        title='Please connect your wallet'
      ></Notification>
    </React.Fragment>,
  ] as JSX.Element[]);

  const fetchData = async () => {
    await waitFor(() => getSigner() != null);
    setYourOrganisationsCards([
      <React.Fragment key='1'>
        <Notification
          withCloseButton={false}
          color='yellow'
          title='Loading...'
        ></Notification>
      </React.Fragment>,
    ]);
    let signer = getSigner();
    if (signer == null) return;

    let orgFactory = await getOrganisationFactoryContract(
      ORGANISATION_FACTORY_ADDRESS,
    );
    if (orgFactory == null) {
      setYourOrganisationsCards([
        <React.Fragment key='1'>
          <Notification
            withCloseButton={false}
            color='red'
            title='Error'
          ></Notification>
        </React.Fragment>,
      ]);
      return;
    }

    let orgs: OrganisationContract[] = [];
    for await (const orgAddress of organisationsOfOwner(
      await signer.getAddress(),
      orgFactory,
    )) {
      let org = await getOrganisationContract(orgAddress.toString());
      if (org != null) orgs.push(org);
    }
    let orgCards = await Promise.all(
      orgs.map(async (org: OrganisationContract, index) => {
        let metadata = parseMetadata(await org.metadata());

        return (
          <OrganisationCard
            title={metadata.name ?? 'name'}
            key={index}
            description={metadata.description ?? 'description'}
            banner={metadata.banner ?? ''}
            badge={
              FEATURED_ORGANISATIONS.includes(await org.getAddress())
                ? 'Featured'
                : undefined
            }
            link={metadata.contacts?.link ?? ''}
            phone={metadata.contacts?.phone ?? ''}
            email={metadata.contacts?.email ?? ''}
            way={'/organisations/' + (await org.getAddress())}
          />
        );
      }),
    );

    setYourOrganisationsCards(orgCards);
  };

  updateHome = () => fetchData();
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchData();
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className={styles.home__container}>
        <div className={styles.featured}>
          <Title order={2} className={styles.featured__title}>
            Explore featured organisations
          </Title>
          <Link href='/organisations'>
            <Button radius='md'>Featured Organisations</Button>
          </Link>
        </div>
        <div className={styles.home__your_organisations}>
          <Title order={2} className={styles.your_organisations__title}>
            Your Organisations
          </Title>
          <div className={styles.your_organisations__cards}>
            <>
              {yourOrganisationsCards.length == 0 ? (
                <div>
                  <Notification
                    withCloseButton={false}
                    color='blue'
                    title='Don`t have an organisation?'
                  ></Notification>
                  <Notification
                    sx={{ marginTop: '10px' }}
                    withCloseButton={false}
                    color='blue'
                    title='What are you waiting for? Go create one!'
                  ></Notification>
                  <Button
                    sx={{ marginTop: '20px' }}
                    radius='md'
                    onClick={() => {
                      setOrgModalOpened(true);
                    }}
                  >
                    Create Organisation
                  </Button>
                  <Modal
                    opened={orgModalOpened}
                    onClose={() => setOrgModalOpened(false)}
                    title='To create Organisation fill in the forms please.'
                  >
                    <CreateOrganisationForm
                      update={() => setOrgModalOpened(false)}
                    />
                  </Modal>
                </div>
              ) : (
                yourOrganisationsCards
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
}
