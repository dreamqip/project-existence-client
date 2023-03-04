import { NULL_HASH, ORGANISATION_FACTORY_ADDRESS } from '@/config';
import {
  getOrganisationFactoryContract,
  getProvider,
  getRegisterContract,
  getSigner,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import {
  Button,
  Stack,
  TextInput,
  Text,
  FileInput,
  Switch,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { showNotification, updateNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import {
  Hash,
  FileSymlink,
  ExternalLink,
  FileTime,
  Check,
  FileUpload,
  X,
} from 'tabler-icons-react';
import { useRouter } from 'next/router';
import styles from '@/styles/Register.module.scss';
import { sha256 } from 'crypto-hash';

export default function CreateRecordForm(props: {
  updateModal: () => any;
  update: () => any;
  registerAddress: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [buttonContent, setButtonContent] = useState([
    <>Create Record</>,
    true,
  ] as [JSX.Element, boolean]);
  const [formInput, setFormInput] = useState({
    documentHash: '',
    sourceDocument: '',
    referenceDocument: '',
    startsAt: 0,
    expiresAt: 0,
    pastDocumentHash:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  });
  const [docHash, setDocHash] = useState('');
  const [pastDocHash, setPastDocHash] = useState(NULL_HASH);
  const [docExists, setDocExists] = useState(false);
  const [pastDocExists, setPastDocExists] = useState(false);

  const [checkedPast, setCheckedPast] = useState(false);
  const [checkedDates, setCheckedDates] = useState(false);
  const [checkedSource, setCheckedSource] = useState(false);
  const [checkedReference, setCheckedReference] = useState(false);

  function handleDrop(file: File, past: boolean) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContents = new Uint8Array(event?.target?.result as ArrayBuffer);

      let hash = await sha256(fileContents);
      hash = '0x' + hash;
      if (past) {
        setPastDocExists(true);
        setPastDocHash(hash);
        setFormInput({ ...formInput, pastDocumentHash: hash });
      } else {
        setDocExists(true);
        setDocHash(hash);
        setFormInput({ ...formInput, documentHash: hash });
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <Stack>
      <div className='DocumentHash'>
        <FileInput
          className={styles.input_under}
          label='Upload Document'
          placeholder='Upload Document'
          icon={<FileUpload />}
          onChange={(file) => {
            file ? handleDrop(file, false) : console.log('no file');
          }}
        />
        <TextInput
          sx={{ marginTop: '5px' }}
          withAsterisk
          icon={<Hash />}
          placeholder='Document hash'
          label='Document hash'
          defaultValue={docHash}
          disabled={docExists}
          onChange={(event) =>
            setFormInput({
              ...formInput,
              documentHash: event.currentTarget.value,
            })
          }
        />
      </div>

      <Switch
        label='Do you want to include link to source document?'
        checked={checkedSource}
        onChange={(event) => setCheckedSource(event.currentTarget.checked)}
      />
      <TextInput
        icon={<FileSymlink />}
        placeholder='Source Document Link'
        label='Source Document Link'
        className={`${checkedSource ? '' : styles.hide}`}
        onChange={(event) =>
          setFormInput({
            ...formInput,
            sourceDocument: event.currentTarget.value,
          })
        }
      />
      <Switch
        label='Do you want to include reference to the document?'
        checked={checkedReference}
        onChange={(event) => setCheckedReference(event.currentTarget.checked)}
      />
      <TextInput
        className={`${checkedReference ? '' : styles.hide}`}
        icon={<ExternalLink />}
        placeholder='Reference Document Link'
        label='Reference Document Link'
        disabled={!checkedReference}
        onChange={(event) =>
          setFormInput({
            ...formInput,
            referenceDocument: event.currentTarget.value,
          })
        }
      />
      <Switch
        label='Do you want to include starts at and expires at?'
        checked={checkedDates}
        onChange={(event) => setCheckedDates(event.currentTarget.checked)}
      />
      <div className={`${styles.dates} ${checkedDates ? '' : styles.hide}`}>
        <div className={styles.date}>
          <Text>Starts at</Text>
          <DatePicker
            onChange={(value) =>
              setFormInput({
                ...formInput,
                startsAt: (() => (value?.getTime() ?? 0) / 1000)(),
              })
            }
          />
        </div>
        <div className={styles.date}>
          <Text>Expires at</Text>
          <DatePicker
            onChange={(value) =>
              setFormInput({
                ...formInput,
                expiresAt: (() => (value?.getTime() ?? 0) / 1000)(),
              })
            }
          />
        </div>
      </div>
      <Switch
        label='Does the past record exist?'
        checked={checkedPast}
        onChange={(event) => setCheckedPast(event.currentTarget.checked)}
      />
      <div className='pastDocumentHash'>
        <FileInput
          label='Upload Document'
          placeholder='Upload Document'
          icon={<FileUpload />}
          className={`${checkedPast ? '' : styles.hide}`}
          onChange={(file) => {
            file ? handleDrop(file, true) : console.log('no file');
          }}
        />
        <TextInput
          sx={{ marginTop: '5px' }}
          icon={<Hash />}
          defaultValue={pastDocExists ? pastDocHash : ''}
          placeholder='Past Document Hash'
          label='Past Document Hash'
          disabled={pastDocExists}
          className={`${checkedPast ? '' : styles.hide}`}
          onChange={(event) => {
            setFormInput({
              ...formInput,
              pastDocumentHash: event.currentTarget.value,
            });
          }}
        />
      </div>

      <Button
        radius='md'
        color='red'
        disabled={
          formInput.documentHash.trim() == '' ||
          (checkedReference && formInput.referenceDocument.trim() == '') ||
          (checkedSource && formInput.sourceDocument.trim() == '') ||
          (checkedDates && formInput.startsAt == 0) ||
          (checkedDates && formInput.expiresAt == 0) ||
          (checkedPast && formInput.pastDocumentHash == NULL_HASH)
        }
        onClick={async (e) => {
          props.updateModal();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Creating record...',
            message: 'You cannot close this notification yet',
            autoClose: false,
            withCloseButton: false,
          });

          let signer = getSigner();
          if (signer == null) {
            showNotification({
              title: 'Error',
              color: 'red',
              message: 'Please connect your wallet!',
              autoClose: 5000,
            });
            return;
            updateNotification({
              id: 'load-data',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              autoClose: 5000,
            });
          }

          let reg = await getRegisterContract(props.registerAddress);
          if (reg == null) {
            showNotification({
              title: 'Error',
              color: 'red',
              message: 'An error occured.',
              autoClose: 5000,
            });
            updateNotification({
              id: 'load-data',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              autoClose: 5000,
            });
            return;
          }

          try {
            let tx = await reg.createRecord(
              formInput.documentHash,
              formInput.sourceDocument,
              formInput.referenceDocument,
              BigInt(formInput.startsAt),
              BigInt(formInput.expiresAt),
              formInput.pastDocumentHash,
            );
            if (tx.hash == null) return;

            await getProvider()?.waitForTransaction(tx.hash);
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Record was successfully created',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              icon: <Check />,
              autoClose: 5000,
            });
            props.update();
          } catch (error: any) {
            switch (error.code as string) {
              case 'ACTION_REJECTED':
                updateNotification({
                  id: 'load-data',
                  color: 'red',
                  title: 'Transaction rejected by user.',
                  message:
                    'Notification will close in 2 seconds, you can close this notification now',
                  icon: <X />,
                  autoClose: 5000,
                });
                break;
              case 'CALL_EXCEPTION':
                updateNotification({
                  id: 'load-data',
                  color: 'red',
                  title: 'Transaction rejected: ' + error.reason,
                  message:
                    'Notification will close in 2 seconds, you can close this notification now',
                  icon: <X />,
                  autoClose: 5000,
                });
                break;
              default:
                updateNotification({
                  id: 'load-data',
                  color: 'red',
                  title: 'Transaction error.',
                  message:
                    'Notification will close in 2 seconds, you can close this notification now',
                  icon: <X />,
                  autoClose: 5000,
                });
                break;
            }
          }
        }}
      >
        {buttonContent[0]}
      </Button>
    </Stack>
  );
}
