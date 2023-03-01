import React, { useEffect, useState } from 'react';
import OrganisationCard from '@/components/Card';
import { Title, Text, Breadcrumbs, Anchor } from '@mantine/core';
import styles from '@/styles/Organisations.module.scss';
import Link from 'next/link';
import { getOrganisationContract, getSigner, OrganisationContract } from '@/contract_interactions';
import { parseMetadata, waitFor } from '@/utils';
import { FEATURED_ORGANISATIONS } from '@/config';

const items = [
  { title: 'Home', href: '/' },
  { title: 'Organisations', href: '/organisations' },
].map((item, index) => (
  <Link href={item.href} key={index}>
    {item.title}
  </Link>
));

export default function organisations() {
  const [featuredOrganisationsCards, setFeaturedOrganisationsCards] = useState([<React.Fragment key='1'>please connect your wallet</React.Fragment>] as JSX.Element[]);
  
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await waitFor(() => getSigner() != null);
        setFeaturedOrganisationsCards([<React.Fragment key='1'>loading...</React.Fragment>]);
        let signer = getSigner();
        if (signer == null) return;

        let orgs: OrganisationContract[] = [];
        for (const orgAddress of FEATURED_ORGANISATIONS) {
          let org = await getOrganisationContract(orgAddress.toString())
          if (org != null) orgs.push(org);
        }
        
        let orgCards = await Promise.all(orgs.map(async (org: OrganisationContract, index) => {
          let metadata = parseMetadata(await org.metadata());

          return <OrganisationCard
            title={metadata.name ?? "name"}
            key={index}
            description={metadata.description ?? "description"}
            badge='Featured'
            way={'/organisations/' + await org.getAddress()}
          />
        }));

        setFeaturedOrganisationsCards(orgCards);
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
