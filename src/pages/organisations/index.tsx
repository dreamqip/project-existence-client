import React, { useEffect, useState } from 'react';
import OrganisationCard from '@/components/Card';
import { Title, Text, Breadcrumbs, Anchor, Notification } from '@mantine/core';
import styles from '@/styles/Organisations.module.scss';
import Link from 'next/link';
import {
  getOrganisationContract,
  getSigner,
  OrganisationContract,
} from '@/contract_interactions';
import { parseMetadata, waitFor } from '@/utils';
import { FEATURED_ORGANISATIONS } from '@/config';

const items = [
  { title: 'Home', href: '/' },
  { title: 'Organisations', href: '/organisations' },
].map((item, index) => (
  <Link href={item.href} key={index} className={styles.bread_link}>
    {item.title}
  </Link>
));

export default function Organisations() {
  const [featuredOrganisationsCards, setFeaturedOrganisationsCards] = useState([
    <React.Fragment key='1'>
      <Notification
        withCloseButton={false}
        color='yellow'
        title='Loading...'
      ></Notification>
    </React.Fragment>,
  ] as JSX.Element[]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
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
      }
    };

    fetchData();

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
