import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import OrganisationCard from '@/components/Card';
import { Button, Title, Notification } from '@mantine/core';
import { useEffect, useState } from 'react';
import { getOrganisationContract, getOrganisationFactoryContract, getSigner, OrganisationContract, organisationsOfOwner } from '@/contract_interactions';
import React from 'react';
import { FEATURED_ORGANISATIONS, ORGANISATION_FACTORY_ADDRESS } from '@/config';
import { sign } from 'crypto';
import { parseMetadata, waitFor } from '@/utils';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [yourOrganisationsCards, setYourOrganisationsCards] = useState([<React.Fragment key='1'><Notification
    withCloseButton={false}
    color="blue"
    title='Please connect your wallet'
  ></Notification></React.Fragment>] as JSX.Element[]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await waitFor(() => getSigner() != null);
        setYourOrganisationsCards([<React.Fragment key='1'><Notification
          withCloseButton={false}
          color="yellow"
          title='Loading...'
        ></Notification></React.Fragment>]);
        let signer = getSigner();
        if (signer == null) return;

        let orgFactory = await getOrganisationFactoryContract(ORGANISATION_FACTORY_ADDRESS)
        if (orgFactory == null) {
          setYourOrganisationsCards([<React.Fragment key='1'><Notification
            withCloseButton={false}
            color="red"
            title='Error'
          ></Notification></React.Fragment>])
          return;
        }

        let orgs: OrganisationContract[] = [];
        for await (const orgAddress of organisationsOfOwner(await signer.getAddress(), orgFactory)) {
          let org = await getOrganisationContract(orgAddress.toString())
          if (org != null) orgs.push(org);
        }
        let orgCards = await Promise.all(orgs.map(async (org: OrganisationContract, index) => {
          let metadata = parseMetadata(await org.metadata());

          return <OrganisationCard
            title={metadata.name ?? "name"}
            key={index}
            description={metadata.description ?? "description"}
            badge={FEATURED_ORGANISATIONS.includes(await org.getAddress()) ? 'Featured' : undefined}
            contacts={metadata.contacts ?? "contacts"}
            way={'/organisations/' + await org.getAddress()}
          />
        }));

        setYourOrganisationsCards(orgCards);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className={styles.home__container}>
        <div className={styles.home__your_organisations}>
          <Title order={2} className={styles.your_organisations__title}>
            Your Organisations
          </Title>
          <div className={styles.your_organisations__cards}>
            <>
              {yourOrganisationsCards}
            </>
          </div>
          <div className={styles.featured}>
            <Title order={2} className={styles.featured__title}>
              Explore featured organisations
            </Title>
            <Link href='/organisations'>
              <Button radius='md'>Featured Organisations</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
