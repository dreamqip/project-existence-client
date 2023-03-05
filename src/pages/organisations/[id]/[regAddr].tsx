import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { sha256 } from 'crypto-hash';
import { useRouter } from 'next/router';

import styles from '@/styles/Register.module.scss';
import { showNotification } from '@mantine/notifications';
import {
  Copy,
  ArrowUpRight,
  Search,
  Upload,
  X,
  Check,
} from 'tabler-icons-react';
import {
  Breadcrumbs,
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
  Tabs,
  Table,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';

import RegisterCard from '@/components/Card';

import {
  getRecord,
  getRegisterContract,
  type Record,
} from '@/contract_interactions';
import {
  parseMetadata,
  timestampToDate,
  toFunctionSelector,
  waitFor,
} from '@/utils';
import { NULL_ADDR, NULL_HASH } from '@/config';
import { ethers } from 'ethers';
import { getActivityTransactions } from '@/tracer_interactions';

function getExpirationColor(searchResult: Record) {
  const expirationTime = Number(searchResult.expiresAt);
  const currentTime = new Date().getTime();

  if (expirationTime > currentTime || expirationTime === 0) {
    return 'teal';
  } else if (searchResult.nextDocumentHash != NULL_HASH) {
    return 'yellow';
  } else {
    return 'red';
  }
}

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
    <Link href={item.href} key={index} className={styles.bread_link}>
      {item.title}
    </Link>
  ));

  function transformToDate(milliseconds: string) {
    const numbers = parseInt(milliseconds) * 1000;
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

  const [activityElements, setActivityElements] = useState([
    {
      address: 'Loading...',
      date: 'Loading...',
      action: 'Loading...',
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
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                  sx={{ marginRight: '10px' }}
                  size='xs'
                  compact
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
    (async () => {
      let rawMetadata = await reg.metadata();
      let metadata = parseMetadata(rawMetadata);

      setRegisterCard(
        <RegisterCard
          title={metadata.name ?? 'name'}
          description={metadata.description ?? 'description'}
          banner={metadata.banner ?? ''}
          link={metadata.contacts?.link ?? ''}
          phone={metadata.contacts?.phone ?? ''}
          email={metadata.contacts?.email ?? ''}
        />,
      );
    })();
    (async () => {
      let txs = await getActivityTransactions(await reg.getAddress());
      if (txs.error != null) {
        setActivityElements([
          {
            address: 'Error.',
            date: 'Error.',
            action: 'Error.',
          },
        ]);
      } else {
        let transactions = txs.transactions;
        setActivityElements(
          transactions
            .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
            .map((item) => {
              let action = item.functionSelector;
              let address = '';
              switch (item.functionSelector) {
                case toFunctionSelector(
                  'createRecord(bytes32,string,string,uint256,uint256,bytes32)',
                ):
                  action = 'Create Record';
                  address = '0x' + item.rawInput.slice(10, 74);
                  break;
                case toFunctionSelector('invalidateRecord(bytes32)'):
                  action = 'Invalidate Record';
                  address = '0x' + item.rawInput.slice(10, 74);
                  break;
                case toFunctionSelector('editRegisterMetadata(string)'):
                  action = 'Update Register';
                  break;
              }
              return {
                address: address,
                date: timestampToDate(item.timestamp * 1000, true),
                action: action,
              };
            }),
        );
      }
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
        autoClose: 5000,
      });
    } else {
      //alert("not found");
      showNotification({
        title: 'Error',
        color: 'red',
        message: 'Record not found.',
        autoClose: 5000,
      });
    }
  };
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
                maxFiles={1}
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
                  color={getExpirationColor(searchResult)}
                  title='The last record successfully requested.'
                  onClose={() => setSearchBlock(false)}
                >
                  <div className={styles.result__notification}>
                    <Text size='sm'>
                      Click details to get more information about the record
                    </Text>
                    {getExpirationColor(searchResult) == 'yellow' ? (
                      <Text size='sm' color='blue'>
                        There is a new record attached to it.
                      </Text>
                    ) : null}
                    {getExpirationColor(searchResult) == 'red' ? (
                      <Text size='sm' color='blue'>
                        Record is expired.
                      </Text>
                    ) : null}

                    <Text c={getExpirationColor(searchResult)}>
                      {searchResult.documentHash}
                    </Text>

                    <Button
                      className={styles.records__link_btn}
                      onClick={() => setOpened(true)}
                      rightIcon={
                        <ArrowUpRight
                          size={30}
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
                            {searchResult.creator.toString() != NULL_ADDR
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
                            {searchResult.updater.toString() != NULL_ADDR
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
          <div className={styles.records__tabs}>
            <Tabs defaultValue='activity'>
              <Tabs.List>
                <Tabs.Tab value='activity'>Activity</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel
                value='activity'
                pt='xs'
                className={styles.activity__table}
              >
                <Table highlightOnHover fontSize='md'>
                  <thead>
                    <tr>
                      <th className={styles.column}>Action</th>
                      <th className={styles.column}>Document hash</th>
                      <th className={styles.column}>When</th>
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
