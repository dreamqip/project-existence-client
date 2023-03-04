import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import styles from '@/styles/Organisation.module.scss';
import { Copy } from 'tabler-icons-react';

import {
  Breadcrumbs,
  Tabs,
  CopyButton,
  Button,
  Title,
  Notification,
  Table,
  Modal,
} from '@mantine/core';

import OrganisationCard from '@/components/Card';
import RegisterCard from '@/components/Card';

import {
  getOrganisationContract,
  getRegisterContract,
  RegisterContract,
  registersOfOrganisation,
} from '@/contract_interactions';
import { FEATURED_ORGANISATIONS } from '@/config';
import { parseMetadata } from '@/utils';
import DeployRegisterForm from '@/components/forms/DeployRegisterForm';

export let update = () => {};

export default function Organisation() {
  const router = useRouter();
  const [regModalOpened, setRegModalOpened] = useState(false);
  const { id } = router.query;
  const breadCrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Organisations', href: '/organisations' },
    { title: id, href: `/organisations/` + id },
  ].map((item, index) => (
    <Link href={item.href} key={index} className={styles.bread_link}>
      {item.title}
    </Link>
  ));

  const isOrganisationPage = /\/organisations\/.+/.test(router.pathname);
  const orgAddress = isOrganisationPage
    ? router.query.id
      ? typeof router.query.id == 'string'
        ? router.query.id
        : router.query.id[0]
      : null
    : null;

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
              size='xs'
              compact
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

  const [orgCard, setOrgCard] = useState(
    <>
      <Notification
        withCloseButton={false}
        color='blue'
        title='Please connect your wallet'
      ></Notification>
    </>,
  );
  const [regCards, setRegCards] = useState([
    <React.Fragment key='1'>
      <Notification
        withCloseButton={false}
        color='blue'
        title='Please connect your wallet'
      ></Notification>
    </React.Fragment>,
  ] as JSX.Element[]);

  const fetchData = async () => {
    setOrgCard(
      <>
        <Notification
          withCloseButton={false}
          color='yellow'
          title='Loading...'
        ></Notification>
      </>,
    );
    setRegCards([
      <React.Fragment key='1'>
        <Notification
          withCloseButton={false}
          color='yellow'
          title='Loading...'
        ></Notification>
      </React.Fragment>,
    ]);

    let orgAddress: string;
    if (id == undefined) return;
    if (typeof id == 'string') orgAddress = id;
    else orgAddress = id[0];

    let org = await getOrganisationContract(orgAddress, true);
    if (org == null) {
      setOrgCard(
        <>
          <Notification
            withCloseButton={false}
            color='red'
            title='Error'
          ></Notification>
        </>,
      );
      setRegCards([
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

    let metadata = parseMetadata(await org.metadata());

    setOrgCard(
      <OrganisationCard
        title={metadata.name ?? 'name'}
        description={metadata.description ?? 'description'}
        banner={metadata.banner ?? ''}
        link={metadata.contacts?.link ?? ''}
        phone={metadata.contacts?.phone ?? ''}
        email={metadata.contacts?.email ?? ''}
        badge={
          FEATURED_ORGANISATIONS.includes(await org.getAddress())
            ? 'Featured'
            : undefined
        }
      />,
    );

    let regs: RegisterContract[] = [];
    for await (const i of registersOfOrganisation(org)) {
      let reg = await getRegisterContract(i.toString());
      if (reg != null) regs.push(reg);
    }

    let regCards = await Promise.all(
      regs.map(async (reg: RegisterContract, index) => {
        let metadata = parseMetadata(await reg.metadata());

        return (
          <RegisterCard
            title={metadata.name ?? 'name'}
            key={index}
            description={metadata.description ?? 'description'}
            banner={metadata.banner ?? ''}
            link={metadata.contacts?.link ?? ''}
            phone={metadata.contacts?.phone ?? ''}
            email={metadata.contacts?.email ?? ''}
            way={
              '/organisations/' +
              ((await org?.getAddress()) ?? 'error') +
              '/' +
              (await reg.getAddress())
            }
          />
        );
      }),
    );

    setRegCards(regCards);
  };

  update = () => fetchData();
  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className={styles.organisation__container}>
      <Breadcrumbs className={styles.organisation__breadcrumbs}>
        {breadCrumbItems}
      </Breadcrumbs>
      <div className={styles.organisation__body}>
        <div className={styles.organisation__card}>{orgCard}</div>

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
                {regCards.length != 0 ? (
                  <div className={styles.registers__list}>{regCards}</div>
                ) : (
                  <div>
                    <Notification
                      withCloseButton={false}
                      color='blue'
                      title='Don`t have a Register?'
                    ></Notification>
                    <Notification
                      sx={{ marginTop: '10px' }}
                      withCloseButton={false}
                      color='blue'
                      title='What are you waiting for? Go create one!'
                    ></Notification>
                    <Notification
                      sx={{ marginTop: '10px' }}
                      withCloseButton={false}
                      color='blue'
                      title='Connect wallet and click `Deploy Register`.'
                    ></Notification>
                    <Button
                      radius='md'
                      onClick={() => setRegModalOpened(true)}
                      disabled={!isOrgOwner}
                    >
                      Deploy Register
                    </Button>
                    <Modal
                      opened={regModalOpened}
                      onClose={() => setRegModalOpened(false)}
                      title='To create Register fill in the forms'
                    >
                      <DeployRegisterForm
                        orgAddress={orgAddress}
                        update={() => update()}
                        updateModal={() => setRegModalOpened(false)}
                      />
                    </Modal>
                  </div>
                )}
              </Tabs.Panel>

              <Tabs.Panel value='activity' pt='xs'>
                <Table highlightOnHover>
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
