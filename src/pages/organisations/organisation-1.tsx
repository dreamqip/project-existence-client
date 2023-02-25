import React from 'react';
import styles from '@/styles/Organisation.module.scss';
import OrganisationCard from '@/components/Card';
import RegisterCard from '@/components/Card';
import {
  Breadcrumbs,
  Tabs,
  Table,
  CopyButton,
  Button,
  Title,
} from '@mantine/core';
import { Copy } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Organisation() {
  const router = useRouter();
  const { id } = router.query;
  const items = [
    { title: 'Home', href: '/' },
    { title: 'Organisations', href: '/organisations' },
    { title: 'Organisation-1', href: `/organisations/organisation-1` },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));

  const elements = [
    {
      address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      date: '4 months ago',
      action: 'Deployed',
    },
    {
      address: '0x5B38Da6a7011568545dCfcB03FcB875f56beddC4',
      date: '2 weeks ago',
      action: 'Updated',
    },
    {
      address: '0x5B38Da6a705c568545dCfcB03FcB875f56beddC4',
      date: '2 seconds ago',
      action: 'Deployed',
    },
    {
      address: '0x5B38Da6a701h568545dCfcB03FcB875f56beddC4',
      date: '15 minutes ago',
      action: 'Updated',
    },
    {
      address: '0x5B38Da6a701c56854fdCfcB03FcB875f56beddC4',
      date: '3 minutes ago',
      action: 'Deployed',
    },
  ];

  const rows = elements.map((element) => (
    <tr key={element.address}>
      <td>
        <CopyButton value={element.address}>
          {({ copied, copy }) => (
            <Button
              color={copied ? 'teal' : 'blue'}
              onClick={copy}
              sx={{ marginRight: '10px' }}
            >
              <Copy size={20} strokeWidth={2} color={'#000000'} />
            </Button>
          )}
        </CopyButton>
        {element.address}
      </td>
      <td>{element.action}</td>
      <td>{element.date}</td>
    </tr>
  ));

  return (
    <div className={styles.organisation__container}>
      <Breadcrumbs className={styles.organisation__breadcrumbs}>
        {items}
      </Breadcrumbs>
      <div className={styles.organisation__body}>
        <div className={styles.organisation__card}>
          <OrganisationCard
            title='Test Organisation'
            description='This organisation is created to show you the capabilities of our project. 
            It actively demostrates all the implemented functions and interaction between people and 
            contracts. Contacts: email.'
            badge='Featured'
            way=''
          />
        </div>

        <div className={styles.organisation__registers}>
          <Title order={2} className={styles.registers__title}>
            Registers
          </Title>
          <div className={styles.registers__tabs}>
            <Tabs defaultValue='items'>
              <Tabs.List>
                <Tabs.Tab value='items'>Items</Tabs.Tab>
                <Tabs.Tab value='activity'>Activity</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value='items' pt='xs'>
                <div className={styles.registers__list}>
                  <RegisterCard
                    title='Test Register'
                    description='This register actively demostrates the possiblities. Contacts: email.'
                    badge='Featured'
                    way='/organisations/organisation-1/register-1'
                  />
                  <RegisterCard
                    title='Test Register'
                    description='This register actively demostrates the possiblities.'
                    badge='Featured'
                    way='/organisations/organisation-1'
                  />
                  <RegisterCard
                    title='Test Register'
                    description='This register actively demostrates the possiblities.'
                    badge='Featured'
                    way='/organisations/organisation-1'
                  />
                  <RegisterCard
                    title='Test Register'
                    description='This register actively demostrates the possiblities.'
                    badge='Featured'
                    way='/organisations/organisation-1'
                  />
                </div>
              </Tabs.Panel>

              <Tabs.Panel value='activity' pt='xs'>
                <Table>
                  <thead>
                    <tr>
                      <th>Register address</th>
                      <th>Action</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
