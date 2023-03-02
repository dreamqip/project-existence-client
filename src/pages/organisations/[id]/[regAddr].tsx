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
import {
  ArrowUpRight,
  Search,
  Upload,
  X,
} from 'tabler-icons-react';
import { sha256 } from 'crypto-hash';
import { showNotification, updateNotification } from "@mantine/notifications";

import { useRouter } from 'next/router';
import { getRecord, getRegisterContract, getSigner, type Record } from '@/contract_interactions';
import { parseMetadata, waitFor } from '@/utils';
import { NULL_HASH } from '@/config';

export let update = () => { };

export default function Register() {
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [registerCard, setRegisterCard] = useState(<><Notification
    withCloseButton={false}
    color='blue'
    title='Please connect your wallet'
  ></Notification></>)
  const [searchBlock, setSearchBlock] = useState(false);
  const [docHash, setDocHash] = useState('');

   const [searchResult, setSearchResult] = useState({
    documentHash: NULL_HASH,
    creator: '0x0000000000000000000000000000000000000000',
    updater: '0x0000000000000000000000000000000000000000',

    sourceDocument: "",
    referenceDocument: "",

    createdAt: BigInt(0),
    updatedAt: BigInt(0),
    startsAt: BigInt(0),
    expiresAt: BigInt(0),

    pastDocumentHash: NULL_HASH,
    nextDocumentHash: NULL_HASH
  } as Record);


  const { id, regAddr } = router.query;
  const orgAddress = id ? typeof id == "string" ? id : id[0] : null;
  const regAddress = regAddr ? typeof regAddr == "string" ? regAddr : regAddr[0] : null;

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
      setRegisterCard(<>error</>)
      return;
    }

    let rawMetadata = await reg.metadata();
    let metadata = parseMetadata(rawMetadata);

    setRegisterCard(<RegisterCard
      title={metadata.name ?? "name"}
      description={metadata.description ?? "description"}
      contacts={metadata.contacts ?? "contacts"}
    />)
  };
  update = () => fetchData()
  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, [router])

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
    let reg = await getRegisterContract(regAddress ?? "");
    if (reg == null) return;
    await waitFor(() => _docHash != undefined);
    let result = await getRecord(reg, _docHash);
    if (result.documentHash != NULL_HASH) {
      setSearchBlock(true);
      setSearchResult(result);
      console.log(result);
    } else {
      //alert("not found");
      showNotification({
        title: 'Error',
        color: 'red',
        message:
          'Record not found.',
        autoClose: 2000,
      })
    }
  }

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
        <div className={styles.register__card}>
          {registerCard}
        </div>
        <div className={styles.register__records}>
          <Title order={2} className={styles.records__title}>
            Records
          </Title>

          <div className={styles.records__check}>
            <div className={styles.records__search}>
              <ActionIcon className={styles.search__button} onClick={() => search()}>
                <Search />
              </ActionIcon>
              <TextInput
                icon={<Search />}
                placeholder='Enter Document hash'
                radius='md'
                size='md'
                onChange={(event) =>
                  setDocHash((event.target.value.startsWith("0x") && event.target.value.length == NULL_HASH.length) ? event.target.value : NULL_HASH)
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
            {searchBlock ? 
            <div className={styles.records__result}>
              <Notification color='teal' title='Record found!'>
                Click details to get more information about the record
                <br />
                <Button
                  className={styles.records__link_btn}
                  onClick={() => setOpened(true)}
                  rightIcon={
                    <ArrowUpRight size={40} strokeWidth={2} color={'#ffffff'} />
                  }
                >
                  Details
                </Button>
                <Modal
                  opened={opened}
                  onClose={() => setOpened(false)}
                  title='Record'
                  size='lg'
                >
                  <div className={styles.records__record}>
                    <Stack spacing='sm'>
                      <List>
                        <List.Item sx={{overflowWrap: 'break-word'}}>
                          Document hash:
                          {searchResult.documentHash}
                        </List.Item>
                        <List.Item>
                          {searchResult.creator.toString()}
                        </List.Item>
                        <List.Item>
                          {searchResult.updater.toString()}
                        </List.Item>
                        <List.Item>
                          {searchResult.sourceDocument}
                        </List.Item>
                        <List.Item>
                          {searchResult.referenceDocument}
                        </List.Item>
                        <List.Item>Created at: {searchResult.createdAt.toString()}</List.Item>
                        <List.Item>Updated at: {searchResult.updatedAt.toString()}</List.Item>
                        <List.Item>Starts at: {searchResult.startsAt.toString()}</List.Item>
                        <List.Item>Expires at: {searchResult.expiresAt.toString()}</List.Item>
                        <List.Item sx={{overflowWrap: 'break-word'}}>
                          Past Document hash:
                          {searchResult.pastDocumentHash}
                        </List.Item>
                        <List.Item sx={{overflowWrap: 'break-word'}}>
                          Next Document hash:
                          {searchResult.nextDocumentHash}
                        </List.Item>
                      </List>
                    </Stack>
                  </div>
                </Modal>
              </Notification>
            </div> : null}

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
