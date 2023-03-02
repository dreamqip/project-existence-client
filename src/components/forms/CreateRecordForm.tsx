import { ORGANISATION_FACTORY_ADDRESS } from "@/config";
import { getOrganisationFactoryContract, getProvider, getRegisterContract, getSigner } from "@/contract_interactions";
import { serializeMetadata } from "@/utils";
import { Button, Stack, TextInput, Text, FileInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useState } from "react";
import { Hash, FileSymlink, ExternalLink, FileTime, Check, FileUpload, X } from "tabler-icons-react";
import { useRouter } from 'next/router';
import styles from '@/styles/Register.module.scss';
import { sha256 } from 'crypto-hash';

export default function CreateRecordForm(props: { updateModal: () => any, update: () => any, registerAddress: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [buttonContent, setButtonContent] = useState([<>Create Record</>, true] as [JSX.Element, boolean]);
  const [formInput, setFormInput] = useState({
    documentHash: '',
    sourceDocument: '',
    referenceDocument: '',
    startsAt: 0,
    expiresAt: 0,
    pastDocumentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  });
  const [docHash, setDocHash] = useState('');
  const [pastDocHash, setPastDocHash] = useState('');
  const [docExists, setDocExists] = useState(false);
  const [pastDocExists, setPastDocExists] = useState(false);


  function handleDrop(file: File, past: boolean) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContents = new Uint8Array(event?.target?.result as ArrayBuffer);

      let hash = await sha256(fileContents);
      hash = '0x' + hash;
      if (past) {
        setPastDocExists(true);
        setPastDocHash(hash);
        setFormInput({ ...formInput, pastDocumentHash: hash })
      } else {
        setDocExists(true);
        setDocHash(hash);
        setFormInput({ ...formInput, documentHash: hash })
      }

    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <Stack>
      <FileInput
        label='Upload Document'
        placeholder='Upload Document'
        icon={<FileUpload />}
        onChange={(file) => {
          console.log(formInput);
          file ? handleDrop(file, false) : console.log('no file');
        }}
      />
      <TextInput
        icon={<Hash />}
        placeholder='Document hash'
        label='Document hash'
        value={docExists ? docHash : undefined}
        onChange={(event) => setFormInput({ ...formInput, documentHash: event.currentTarget.value })}
      />
      <TextInput
        icon={<FileSymlink />}
        placeholder='Source Document Link'
        label='Source Document Link'
        onChange={(event) => setFormInput({ ...formInput, sourceDocument: event.currentTarget.value })}
      />
      <TextInput
        icon={<ExternalLink />}
        placeholder='Reference Document Link'
        label='Reference Document Link'
        onChange={(event) => setFormInput({ ...formInput, referenceDocument: event.currentTarget.value })}
      />
      <div className={styles.dates}>
        <div className={styles.date}>
          <Text>Starts at</Text>
          <DatePicker
            onChange={(value) => setFormInput({ ...formInput, startsAt: (() => value?.getTime() ?? 0)() })}
          />
        </div>
        <div className={styles.date}>
          <Text>Expires at</Text>
          <DatePicker
            onChange={(value) => setFormInput({ ...formInput, expiresAt: (() => value?.getTime() ?? 0)() })}
          />
        </div>
      </div>
      <FileInput
        label='Upload Document'
        placeholder='Upload Document'
        icon={<FileUpload />}
        onChange={(file) => {
          file ? handleDrop(file, true) : console.log('no file');
        }}
      />
      <TextInput
        icon={<Hash />}
        //{pastDocExists ? value = }
        // defaultValue={pastDocExists ? undefined : "0x0000000000000000000000000000000000000000000000000000000000000000"}
        // value={pastDocExists ? pastDocHash : undefined}
        value={pastDocExists ? pastDocHash : "0x0000000000000000000000000000000000000000000000000000000000000000"}
        placeholder='Past Document Hash'
        label='Past Document Hash'
        onChange={(event) => setFormInput({ ...formInput, pastDocumentHash: event.currentTarget.value })}
      />
      <Button
        radius='md'
        color='red'
        disabled={
          formInput.documentHash == '' ||
          formInput.pastDocumentHash == '' ||
          formInput.referenceDocument == '' ||
          formInput.sourceDocument == '' ||
          formInput.startsAt == 0 ||
          formInput.expiresAt == 0
        }
        onClick={async (e) => {
          props.updateModal();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Creating record...',
            message:
              'You cannot close this notification yet',
            autoClose: false,
            withCloseButton: false,
          });

          let signer = getSigner();
          if (signer == null) {
            showNotification({
              title: 'Error',
              message:
                'Please connect your wallet!',
            });
            return;
          }

          let reg = await getRegisterContract(
            props.registerAddress,
          );
          if (reg == null) {
            showNotification({
              title: 'Error',
              message:
                'An error occured.',
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
              formInput.pastDocumentHash
            )
            if (tx.hash == null) return;

            await getProvider()?.waitForTransaction(tx.hash);
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Record was successfully created',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              icon: <Check />,
              autoClose: 2000,
            });
          } catch {
            updateNotification({
              id: 'load-data',
              color: 'red',
              title: 'Transaction rejected.',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              icon: <X />,
              autoClose: 2000,
            });
          }
        }}

      >
        {buttonContent[0]}
      </Button>
    </Stack>
  )
}