import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import styles from '@/styles/Organisation.module.scss';
import { ArrowUp, Copy } from 'tabler-icons-react';

import {
  Breadcrumbs,
  Tabs,
  CopyButton,
  Button,
  Title,
  Notification,
  Table,
  Affix,
  Transition,
  rem,
} from '@mantine/core';

import OrganisationCard from '@/components/Card';
import RegisterCard from '@/components/Card';

import {
  getOrganisationContract,
  getRegisterContract,
  getSigner,
  RegisterContract,
  registersOfOrganisation,
} from '@/contract_interactions';
import { FEATURED_ORGANISATIONS } from '@/config';
import { parseMetadata, timestampToDate, toFunctionSelector } from '@/utils';
import { useWindowScroll } from '@mantine/hooks';
import {
  getActivityTransactions,
  TracerTransaction,
} from '@/tracer_interactions';

export let update = () => {};

export default function Organisation() {
  const [scroll, scrollTo] = useWindowScroll();
  const router = useRouter();
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

  const isOrgOwner = true;

  const [activityElements, setActivityElements] = useState([
    {
      address: '',
      date: '',
      action: '',
    },
  ]);

  const rows = activityElements.map((element, index) => (
    <tr key={index}>
      <td>{element.action}</td>
      <td>
        {element.address == '' ? null : (
          <>
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
          </>
        )}
      </td>
      <td>{element.date}</td>
    </tr>
  ));

  const [orgCard, setOrgCard] = useState(
    <>
      <Notification
        withCloseButton={false}
        color='yellow'
        title='Loading...'
      ></Notification>
    </>,
  );
  const [regCards, setRegCards] = useState([
    <React.Fragment key='1'>
      <Notification
        withCloseButton={false}
        color='yellow'
        title='Loading...'
      ></Notification>
    </React.Fragment>,
  ] as JSX.Element[]);

  const [noRegisterElement, setNoRegisterElement] = useState(
    <p className={styles.banner__text}>
      Contact the organisation owner so they create one!
    </p>,
  );

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

    (async () => {
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
            FEATURED_ORGANISATIONS[await org.getAddress()]
              ? 'Featured'
              : undefined
          }
          badge2={FEATURED_ORGANISATIONS[await org.getAddress()]}
        />,
      );
    })();

    (async () => {
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
    })();

    (async () => {
      let signer = getSigner();
      if (signer == null) return;
      if ((await org.owner()) != (await signer.getAddress())) return;
      setNoRegisterElement(
        <p className={styles.banner__text}>
          Are you the Organisation owner? What are you waiting for? Let{"'"}s
          create one!
        </p>,
      );
    })();

    (async () => {
      setActivityElements([
        {
          address: 'Loading...',
          date: 'Loading...',
          action: 'Loading...',
        },
      ]);

      let regAddresses: string[] = [];
      let transactions: TracerTransaction[] = [];
      await Promise.all([
        Promise.race([
          (async () => {
            for await (const i of registersOfOrganisation(org)) {
              let reg = await getRegisterContract(i.toString());
              if (reg != null) regAddresses.push(await reg.getAddress());
            }
          })(),
          new Promise((_) => setTimeout(() => _(undefined), 5e3)),
        ]).catch(function (err) {}),
        (async () => {
          let result = await getActivityTransactions(orgAddress);
          if (result.error) {
            setActivityElements([
              {
                address: `Error: ${result.message}`,
                date: 'Error.',
                action: 'Error.',
              },
            ]);
            return;
          }
          transactions = (
            result as { error: null; transactions: TracerTransaction[] }
          ).transactions;
        })(),
      ]);
      let i = regAddresses.length - 1;
      setActivityElements(
        transactions
          .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
          .map((item) => {
            let action = item.functionSelector;
            let address = '';
            switch (item.functionSelector) {
              case toFunctionSelector('deployRegister(string)'):
                action = 'Deploy Register';
                address = regAddresses[i];
                i--;
                break;
              case toFunctionSelector('editOrganisationMetadata(string)'):
                action = 'Update Organisation';
                break;
            }
            return {
              address: address,
              date: timestampToDate(item.timestamp * 1000, true),
              action: action,
            };
          }),
      );
    })();
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
                  <div className={styles.registers__banner}>
                    <Title order={4}>No Registers, yet!</Title>
                    {noRegisterElement}
                    <Button
                      className={styles.scroll}
                      sx={{ marginTop: '10px' }}
                      leftIcon={<ArrowUp size={30} />}
                      onClick={() => scrollTo({ y: 0 })}
                    >
                      Scroll to top
                    </Button>
                  </div>
                )}
              </Tabs.Panel>

              <Tabs.Panel
                value='activity'
                pt='xs'
                className={styles.activity__table}
              >
                {rows.length != 0 ? (
                  <Table highlightOnHover fontSize='md'>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Register address</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                  </Table>
                ) : (
                  <div className={styles.registers__banner}>
                    <Title order={4}>No actions yet.</Title>
                  </div>
                )}
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
