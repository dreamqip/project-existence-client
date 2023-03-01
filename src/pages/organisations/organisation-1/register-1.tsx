import React from 'react';
import { useState } from 'react';
import styles from '@/styles/Register.module.scss';
import {
  Breadcrumbs,
  Tabs,
  Table,
  Button,
  CopyButton,
  Input,
  Title,
  Progress,
  Alert,
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
  AlertCircle,
  Upload,
  X,
  CircleCheck,
} from 'tabler-icons-react';
import { sha256 } from 'crypto-hash';

export default function Register() {
  const [hashValue, setHashValue] = useState('');
  const [opened, setOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleDrop(files: File[]) {
    setIsLoading(true);
    // Perform your file processing logic here

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      // Get the file contents as a Uint8Array
      const fileContents = new Uint8Array(event?.target?.result as ArrayBuffer);

      // Calculate the SHA-256 hash of the file contents
      let hash = await sha256(fileContents);
      hash = '0x' + hash;
      // Do something with the hash, for example, log it to the console
      setHashValue(hash);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }
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

          <div className={styles.records__check}>
            <div className={styles.records__search}>
              <ActionIcon className={styles.search__button}>
                <Search />
              </ActionIcon>
              <Input
                icon={<Search />}
                placeholder='Enter Document hash'
                radius='md'
                size='md'
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
                      Attach as many files as you like
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </div>
            <div className={styles.records__result}>
              <Notification disallowClose color='teal' title='Record found!'>
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
                  overlayOpacity={0.55}
                  overlayBlur={3}
                >
                  <div className={styles.records__record}>
                    <Stack spacing='sm'>
                      <List>
                        <List.Item>
                          Document hash:
                          0x7894567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                        </List.Item>
                        <List.Item>
                          Creator: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
                        </List.Item>
                        <List.Item>
                          Updater: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
                        </List.Item>
                        <List.Item>
                          Source Document: SOURCE_DOCUMENT_URL
                        </List.Item>
                        <List.Item>
                          Reference Document: REFERENCE_DOCUMENT_URL
                        </List.Item>
                        <List.Item>Created at: 1677419137</List.Item>
                        <List.Item>Updated at: 1677419145</List.Item>
                        <List.Item>Starts at: 0</List.Item>
                        <List.Item>Expires at: 1677419145</List.Item>
                        <List.Item>
                          Past Document hash:
                          0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                        </List.Item>
                        <List.Item>
                          Next Document hash:
                          0x5464567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                        </List.Item>
                      </List>
                    </Stack>
                  </div>
                </Modal>
              </Notification>
            </div>
            {hashValue ? (
              <div className={styles.records__result}>
                <Notification disallowClose color='teal' title='Hash produced!'>
                  <Text fz='md' className={styles.result__hash} fw={700}>
                    {hashValue}
                  </Text>
                  <CopyButton value={hashValue}>
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
                </Notification>
              </div>
            ) : null}
          </div>
          <div className={styles.records__tabs}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
