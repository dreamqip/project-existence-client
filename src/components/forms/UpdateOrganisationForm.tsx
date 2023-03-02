import { getOrganisationContract, getProvider, getSigner } from "@/contract_interactions";
import { serializeMetadata } from "@/utils";
import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import React, { useEffect } from 'react';
import { useState } from "react";
import { TextColor, TextCaption, BrandMailgun, Check, X } from "tabler-icons-react";
import { showNotification, updateNotification } from '@mantine/notifications';
import { parseMetadata, waitFor, type Metadata } from '@/utils';

export default function UpdateOrganisationForm(props: { orgAddress: string, update?: () => any, updateModal: () => any }) {
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: '',
  });
  const [buttonContent, setButtonContent] = useState([<>Update Organisation</>, true] as [JSX.Element, boolean]);
  const [orgMetadata, setOrgMetadata] = useState({} as Metadata)

  const fetchData = async () => {
    let org = await getOrganisationContract(props.orgAddress);
    if (!org) { return; }
    let rawMetadata = await org.metadata();
    setOrgMetadata(parseMetadata(rawMetadata));
  };
  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, [])


  return (
    <Stack>
      <TextInput
        icon={<TextColor />}
        defaultValue={orgMetadata.name ?? ""}
        placeholder='Organisation name'
        label='Organisation name'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            name: event.currentTarget.value,
          })
        }
      />
      <TextInput
        icon={<TextCaption />}
        defaultValue={orgMetadata.description ?? ""}
        placeholder='Organisation description'
        label='Organisation description'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            description: event.currentTarget.value,
          })
        }
      />
      <TextInput
        icon={<BrandMailgun />}
        defaultValue={orgMetadata.contacts ?? ""}
        placeholder='Organisation contacts'
        label='Organisation contacts'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            contacts: event.currentTarget.value,
          })
        }
      />
      <Button
        radius='md'
        color='red'
        disabled={
          formInput.name == '' ||
          formInput.description == '' ||
          formInput.contacts == ''
        }
        onClick={async (e) => {
          props.updateModal();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Deploying register...',
            message:
              'You cannot close this notification yet',
            autoClose: false,
            withCloseButton: false,
          });

          let signer = getSigner();
          if (signer == null) {
            setButtonContent([
              <>Please connect your wallet</>,
              false,
            ]);
            return;
          }

          let org = await getOrganisationContract(props.orgAddress);
          if (org == null) {
            setButtonContent([<>error</>, false]);
            return;
          }

          let rawMetadata = serializeMetadata(formInput);
          try {
            let tx = await org.editOrganisationMetadata(rawMetadata);
            if (tx.hash == null) return;
            await getProvider()?.waitForTransaction(tx.hash);
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Register was successfully deployed',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              icon: <Check />,
              autoClose: 2000,
            });
            if (props.update) props.update();
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