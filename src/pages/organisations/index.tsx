import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Title,
  Text,
  Breadcrumbs,
  Anchor,
  Notification,
  Button,
  Modal,
} from '@mantine/core';
import styles from '@/styles/Organisations.module.scss';

import OrganisationCard from '@/components/Card';
import CreateOrganisationForm from '@/components/forms/CreateOrganisationForm';

import {
  getOrganisationContract,
  getSigner,
  OrganisationContract,
  getOrganisationFactoryContract,
  organisationsOfOwner,
} from '@/contract_interactions';
import { parseMetadata, waitFor } from '@/utils';
import { FEATURED_ORGANISATIONS, ORGANISATION_FACTORY_ADDRESS } from '@/config';

const items = [
  { title: 'Home', href: '/' },
  { title: 'Organisations', href: '/organisations' },
].map((item, index) => (
  <Link href={item.href} key={index} className={styles.bread_link}>
    {item.title}
  </Link>
));
import Head from 'next/head';

export let updateOrganisations = () => {};

export default function Organisations() {
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
  const [featuredOrganisationsCards, setFeaturedOrganisationsCards] = useState([
    <React.Fragment key='1'>
      <Notification
        withCloseButton={false}
        color='yellow'
        title='Loading...'
      ></Notification>
    </React.Fragment>,
  ] as JSX.Element[]);

  const fetchData = async () => {
    setFeaturedOrganisationsCards([
      <React.Fragment key='1'>
        <Notification
          withCloseButton={false}
          color='yellow'
          title='Loading...'
        ></Notification>
      </React.Fragment>,
    ]);

    let orgs: OrganisationContract[] = [];
    for (const orgAddress of FEATURED_ORGANISATIONS) {
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
            badge='Featured'
            link={metadata.contacts?.link ?? ''}
            phone={metadata.contacts?.phone ?? ''}
            email={metadata.contacts?.email ?? ''}
            way={'/organisations/' + (await org.getAddress())}
          />
        );
      }),
    );

    setFeaturedOrganisationsCards(orgCards);

    if (orgs.length == 0) {
      setFeaturedOrganisationsCards([
        <React.Fragment key='1'>
          <Notification
            withCloseButton={false}
            color='red'
            title='Error'
          ></Notification>
        </React.Fragment>,
      ]);
    }

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

    let your_orgs: OrganisationContract[] = [];
    for await (const orgAddress of organisationsOfOwner(
      await signer.getAddress(),
      orgFactory,
    )) {
      let org = await getOrganisationContract(orgAddress.toString());
      if (org != null) your_orgs.push(org);
    }
    let your_orgCards = await Promise.all(
      your_orgs.map(async (org: OrganisationContract, index) => {
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

    setYourOrganisationsCards(your_orgCards);
  };

  updateOrganisations = () => fetchData();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.organisations__container}>
      <Breadcrumbs>{items}</Breadcrumbs>
      <div className={styles.organisations__greeting}>
        <Title order={1} className={styles.organisations__title}>
          Organisations
        </Title>
        <Text fz='md' className={styles.organisations__text}>
          Organisations are social entities that work towards specific goals and
          objectives. They are made up of people who collaborate and contribute
          to the success of the organization. Effective communication,
          leadership, and adaptability are essential for any organization to
          thrive in its environment.
        </Text>
      </div>
      <div className={styles.organisations__your_organisations}>
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
      <div className={styles.organisations__featured}>
        <Title order={2} className={styles.featured__title}>
          Featured Organisations
        </Title>
        <div className={styles.featured__cards}>
          {featuredOrganisationsCards}
        </div>
      </div>
    </div>
  );
}
