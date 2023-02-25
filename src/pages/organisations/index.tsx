import React from 'react';
import OrganisationCard from '@/components/Card';
import { Title, Text, Breadcrumbs, Anchor } from '@mantine/core';
import styles from '@/styles/Organisations.module.scss';
import Link from 'next/link';

const items = [
  { title: 'Home', href: '/' },
  { title: 'Organisations', href: '/organisations' },
].map((item, index) => (
  <Link href={item.href} key={index}>
    {item.title}
  </Link>
));

export default function organisations() {
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
          <OrganisationCard
            title='Test Organisation'
            description='This organisation is created to show you the capabilities of our project. 
            It actively demostrates all the implemented functions and interaction between people and 
            contracts. Contacts: email.'
            badge='Featured'
            way='/organisations/organisation-1'
          />
        </div>
      </div>
    </div>
  );
}
