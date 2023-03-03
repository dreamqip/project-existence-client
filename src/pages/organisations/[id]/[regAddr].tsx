import React, { useEffect } from 'react';
import { useState } from 'react';
import styles from '@/styles/Register.module.scss';
import {
  Breadcrumbs,
  Tabs,
  Table,
  Button,
  CopyButton,
  TextInput,
  Title,
  Modal,
  Group,
  Stack,
  List,
  Text,
  Notification,
  ActionIcon,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import RegisterCard from '@/components/Card';
import Link from 'next/link';
import { Copy } from 'tabler-icons-react';
import { ArrowUpRight, Search, Upload, X, Check } from 'tabler-icons-react';
import { sha256 } from 'crypto-hash';
import { showNotification, updateNotification } from '@mantine/notifications';

import { useRouter } from 'next/router';
import {
  getRecord,
  getRegisterContract,
  getSigner,
  type Record,
} from '@/contract_interactions';
import { parseMetadata, waitFor } from '@/utils';
import { NULL_HASH } from '@/config';

export let update = () => {};

export default function Register() {
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [registerCard, setRegisterCard] = useState(
    <>
      <Notification
        withCloseButton={false}
        color='blue'
        title='Please connect your wallet'
      ></Notification>
    </>,
  );
  const [searchBlock, setSearchBlock] = useState(false);
  const [docHash, setDocHash] = useState('');

  const [searchResult, setSearchResult] = useState({
    documentHash: NULL_HASH,
    creator: '0x0000000000000000000000000000000000000000',
    updater: '0x0000000000000000000000000000000000000000',

    sourceDocument: '',
    referenceDocument: '',

    createdAt: BigInt(0),
    updatedAt: BigInt(0),
    startsAt: BigInt(0),
    expiresAt: BigInt(0),

    pastDocumentHash: NULL_HASH,
    nextDocumentHash: NULL_HASH,
  } as Record);

  const { id, regAddr } = router.query;
  const orgAddress = id ? (typeof id == 'string' ? id : id[0]) : null;
  const regAddress = regAddr
    ? typeof regAddr == 'string'
      ? regAddr
      : regAddr[0]
    : null;

  const breadCrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Organisations', href: '/organisations' },
    { title: id, href: `/organisations/` + id },
    { title: regAddr, href: `/organisations/` + id + `/` + regAddr },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));

  function transformToDate(milliseconds: string) {
    const numbers = parseInt(milliseconds);
    const dateObj = new Date(numbers);

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    const formattedDate = `${day}-${month}-${year}`;

    return (
      <div>
        {formattedDate} {numbers}
      </div>
    );
  }

  async function handleDrop(files: File[]) {
    setIsLoading(true);

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContents = new Uint8Array(event?.target?.result as ArrayBuffer);

      let hash = await sha256(fileContents);
      hash = '0x' + hash;

      setIsLoading(false);

      // call the search function after the hash value is set
      await search(hash);
    };

    reader.readAsArrayBuffer(file);
  }

  const fetchData = async () => {
    let reg = await getRegisterContract(regAddress ?? '');
    if (!reg) {
      setRegisterCard(
        <>
          <Notification
            withCloseButton={false}
            color='red'
            title='Error'
          ></Notification>
        </>,
      );
      return;
    }

    let rawMetadata = await reg.metadata();
    let metadata = parseMetadata(rawMetadata);

    setRegisterCard(
      <RegisterCard
        title={metadata.name ?? 'name'}
        description={metadata.description ?? 'description'}
        link={metadata.contacts?.link ?? ''}
        phone={metadata.contacts?.phone ?? ''}
        email={metadata.contacts?.email ?? ''}
      />,
    );
  };
  update = () => fetchData();
  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, [router]);

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

  let search = async (hash?: string) => {
    let _docHash = hash ? hash : docHash;
    let reg = await getRegisterContract(regAddress ?? '');
    if (reg == null) return;
    await waitFor(() => _docHash != undefined);
    let result = await getRecord(reg, _docHash);
    if (result.documentHash != NULL_HASH) {
      setSearchBlock(true);
      setSearchResult(result);
      showNotification({
        color: 'teal',
        title: 'Record found successfully',
        message:
          'Notification will close in 2 seconds, you can close this notification now',
        icon: <Check />,
        autoClose: 2000,
      });
    } else {
      //alert("not found");
      showNotification({
        title: 'Error',
        color: 'red',
        message: 'Record not found.',
        autoClose: 2000,
      });
    }
  };

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
        <Button
          variant='subtle'
          compact
          className={styles.records__link}
          onClick={() => setOpened(true)}
        >
          <ArrowUpRight size={40} strokeWidth={2} color={'#ffffff'} />
        </Button>
      </td>
    </tr>
  ));
  return (
    <div className={styles.register__container}>
      <Breadcrumbs className={styles.register__breadcrumbs}>
        {breadCrumbItems}
      </Breadcrumbs>
      <div className={styles.register__body}>
        <div className={styles.register__card}>{registerCard}</div>
        <div className={styles.register__records}>
          <Title order={2} className={styles.records__title}>
            Records
          </Title>

          <div className={styles.records__check}>
            <div className={styles.records__search}>
              <ActionIcon
                className={styles.search__button}
                onClick={() => search()}
              >
                <Search />
              </ActionIcon>
              <TextInput
                icon={<Search />}
                placeholder='Enter Document hash'
                radius='md'
                size='md'
                onChange={(event) =>
                  setDocHash(
                    event.target.value.startsWith('0x') &&
                      event.target.value.length == NULL_HASH.length
                      ? event.target.value
                      : NULL_HASH,
                  )
                }
                onKeyDown={async (event) => {
                  if (event.key === 'Enter') {
                    search();
                  }
                }}
              />
            </div>
            <div className={styles.records__drag_file}>
              <Dropzone
                onDrop={handleDrop}
                loading={isLoading}
                onReject={(files) => console.log('rejected files', files)}
              >
                <Group
                  position='center'
                  spacing='xl'
                  style={{ minHeight: 220, pointerEvents: 'none' }}
                >
                  <Dropzone.Accept>
                    <Upload size={50} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <X size={50} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <Upload size={50} />
                  </Dropzone.Idle>
                  <div>
                    <Text size='xl' inline>
                      Drag documents here or click to select files
                    </Text>
                    <Text size='sm' color='dimmed' inline mt={7}>
                      Attach one file
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </div>
            {searchBlock ? (
              <div className={styles.records__result}>
                <Notification
                  color='teal'
                  title='The last record successfully requested.'
                  onClose={() => setSearchBlock(false)}
                >
                  <div className={styles.result__notification}>
                    <Text>
                      Click details to get more information about the record
                    </Text>
                    <Button
                      className={styles.records__link_btn}
                      onClick={() => setOpened(true)}
                      rightIcon={
                        <ArrowUpRight
                          size={40}
                          strokeWidth={2}
                          color={'#ffffff'}
                        />
                      }
                    >
                      Details
                    </Button>
                  </div>

                  <Modal
                    className={styles.record__modal}
                    opened={opened}
                    onClose={() => setOpened(false)}
                    title='Record'
                    size='xl'
                  >
                    <div className={styles.records__record}>
                      <Stack spacing='sm'>
                        <List className={styles.record__list}>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              <CopyButton value={searchResult.documentHash}>
                                {({ copied, copy }) => (
                                  <Button
                                    className={styles.myCopy}
                                    size='xs'
                                    compact
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    sx={{ marginRight: '10px' }}
                                  >
                                    <Copy
                                      size={20}
                                      strokeWidth={2}
                                      color={'#000000'}
                                    />
                                  </Button>
                                )}
                              </CopyButton>
                              Document hash:
                            </Text>
                            {searchResult.documentHash}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              <CopyButton
                                value={searchResult.creator.toString()}
                              >
                                {({ copied, copy }) => (
                                  <Button
                                    className={styles.myCopy}
                                    size='xs'
                                    compact
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    sx={{ marginRight: '10px' }}
                                  >
                                    <Copy
                                      size={20}
                                      strokeWidth={2}
                                      color={'#000000'}
                                    />
                                  </Button>
                                )}
                              </CopyButton>
                              Creator:
                            </Text>
                            {searchResult.creator.toString() != NULL_HASH
                              ? searchResult.creator.toString()
                              : '-'}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              <CopyButton
                                value={searchResult.updater.toString()}
                              >
                                {({ copied, copy }) => (
                                  <Button
                                    className={styles.myCopy}
                                    size='xs'
                                    compact
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    sx={{ marginRight: '10px' }}
                                  >
                                    <Copy
                                      size={20}
                                      strokeWidth={2}
                                      color={'#000000'}
                                    />
                                  </Button>
                                )}
                              </CopyButton>
                              Updater:
                            </Text>
                            {searchResult.updater.toString() != NULL_HASH
                              ? searchResult.updater.toString()
                              : '-'}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Source Document:
                            </Text>
                            {searchResult.sourceDocument != '' ? (
                              <Link
                                className={styles.link}
                                target='_blank'
                                href={searchResult.sourceDocument}
                              >
                                {searchResult.sourceDocument}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Reference Document
                            </Text>
                            {searchResult.referenceDocument != '' ? (
                              <Link
                                className={styles.link}
                                target='_blank'
                                href={searchResult.referenceDocument}
                              >
                                {searchResult.referenceDocument}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Created at:
                            </Text>{' '}
                            {searchResult.createdAt.toString() != '0'
                              ? transformToDate(
                                  searchResult.createdAt.toString(),
                                )
                              : '-'}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Updated at:
                            </Text>{' '}
                            {searchResult.updatedAt.toString() != '0'
                              ? transformToDate(
                                  searchResult.updatedAt.toString(),
                                )
                              : '-'}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Starts at:
                            </Text>
                            {searchResult.startsAt.toString() != '0'
                              ? transformToDate(
                                  searchResult.startsAt.toString(),
                                )
                              : '-'}
                          </List.Item>
                          <List.Item>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              Expires at:
                            </Text>
                            {searchResult.expiresAt.toString() != '0'
                              ? transformToDate(
                                  searchResult.expiresAt.toString(),
                                )
                              : '-'}
                          </List.Item>
                          <List.Item sx={{ overflowWrap: 'break-word' }}>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              <CopyButton value={searchResult.pastDocumentHash}>
                                {({ copied, copy }) => (
                                  <Button
                                    className={styles.myCopy}
                                    size='xs'
                                    compact
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    sx={{ marginRight: '10px' }}
                                  >
                                    <Copy
                                      size={20}
                                      strokeWidth={2}
                                      color={'#000000'}
                                    />
                                  </Button>
                                )}
                              </CopyButton>
                              Past Document hash:
                            </Text>
                            {searchResult.pastDocumentHash != NULL_HASH
                              ? searchResult.pastDocumentHash
                              : '-'}
                          </List.Item>
                          <List.Item sx={{ overflowWrap: 'break-word' }}>
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                              <CopyButton value={searchResult.nextDocumentHash}>
                                {({ copied, copy }) => (
                                  <Button
                                    className={styles.myCopy}
                                    size='xs'
                                    compact
                                    color={copied ? 'teal' : 'blue'}
                                    onClick={copy}
                                    sx={{ marginRight: '10px' }}
                                  >
                                    <Copy
                                      size={20}
                                      strokeWidth={2}
                                      color={'#000000'}
                                    />
                                  </Button>
                                )}
                              </CopyButton>
                              Next Document hash:
                            </Text>
                            {searchResult.nextDocumentHash != NULL_HASH
                              ? searchResult.nextDocumentHash
                              : '-'}
                          </List.Item>
                        </List>
                      </Stack>
                    </div>
                  </Modal>
                </Notification>
              </div>
            ) : null}
          </div>
          {/* <div className={styles.records__tabs}>
            <Tabs defaultValue='activity'>
              <Tabs.List>
                <Tabs.Tab value='activity'>Activity</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value='activity' pt='xs'>
                <Table highlightOnHover fontSize='xs'>
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
          </div> */}
        </div>
      </div>
    </div>
  );
}
