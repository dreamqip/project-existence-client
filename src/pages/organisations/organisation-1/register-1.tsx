import React from 'react';
import styles from '@/styles/Register.module.scss';
import {
  Breadcrumbs,
  Tabs,
  Table,
  Button,
  CopyButton,
  FileInput,
  Input,
  Title,
  Progress,
  Alert,
} from '@mantine/core';
import RegisterCard from '@/components/Card';
import Link from 'next/link';
import { Copy } from 'tabler-icons-react';
import {
  ArrowUpRight,
  FileUpload,
  Search,
  AlertCircle,
} from 'tabler-icons-react';

export default function Register() {
  const items = [
    { title: 'Home', href: '/' },
    { title: 'Organisations', href: '/organisations' },
    { title: 'Organisation-1', href: `/organisations/organisation-1` },
    { title: 'Register-1', href: `/organisations/organisation-1/register-1` },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const elements = [
    {
      address:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      date: '4 months ago',
      action: 'Created',
    },
    {
      address:
        '0x7894567890abcdef1h34567890abcdef1234567890abcdef1234567890abcdef',
      date: '2 weeks ago',
      action: 'Updated',
    },
    {
      address:
        '0x7894567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      date: '2 seconds ago',
      action: 'Invalidated',
    },
    {
      address:
        '0x5464567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      date: '15 minutes ago',
      action: 'Updated',
    },
    {
      address:
        '0x7894567890abcdef12345678f0abcdef1234567890abcdef1234567890abcdef',
      date: '3 minutes ago',
      action: 'Created',
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
      <td>
        <Link href='#'>
          <ArrowUpRight size={40} strokeWidth={2} color={'#ffffff'} />
        </Link>
      </td>
    </tr>
  ));
  return (
    <div className={styles.register__container}>
      <Breadcrumbs className={styles.register__breadcrumbs}>
        {items}
      </Breadcrumbs>
      <div className={styles.register__body}>
        <div className={styles.register__card}>
          <RegisterCard
            title='Test Register'
            description='This register actively demostrates the possiblities. Contacts: email.'
            badge='Featured'
            way=''
          />
        </div>
        <div className={styles.register__records}>
          <Title order={2} className={styles.records__title}>
            Records
          </Title>
          <Progress value={33} color='teal' />
          <div className={styles.records__check}>
            <div className={styles.records__drag_file}>
              <FileInput
                placeholder='Upload Document'
                radius='md'
                size='md'
                icon={<FileUpload />}
              />
            </div>
            <div className={styles.records__search}>
              <Input
                icon={<Search />}
                placeholder='Enter Document hash'
                radius='md'
                size='md'
              />
            </div>
            <div className={styles.records__result}>
              <Alert
                icon={<AlertCircle size={16} />}
                title='Alert!'
                color='teal'
              >
                Record found!
              </Alert>
            </div>
          </div>

          <div className={styles.records__tabs}>
            <Tabs defaultValue='activity'>
              <Tabs.List>
                <Tabs.Tab value='activity'>Activity</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value='activity' pt='xs'>
                <Table>
                  <thead>
                    <tr>
                      <th>Document hash</th>
                      <th>Action</th>
                      <th>When</th>
                      <th>Details</th>
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
