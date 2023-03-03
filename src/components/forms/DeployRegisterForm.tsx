import {
  getOrganisationContract,
  getProvider,
  getSigner,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import { Button, LoadingOverlay, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { useState } from 'react';
import {
  TextColor,
  TextCaption,
  BrandMailgun,
  Check,
  X,
  Phone,
  ExternalLink,
} from 'tabler-icons-react';
import { showNotification, updateNotification } from '@mantine/notifications';

export default function UpdateOrganisationForm(props: {
  orgAddress: string;
  update?: () => any;
  updateModal: () => any;
}) {
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: {
      link: '',
      phone: '',
      email: '',
    },
  });
  const [buttonContent, setButtonContent] = useState([
    <>Deploy Register</>,
    true,
  ] as [JSX.Element, boolean]);

  return (
    <Stack>
      <TextInput
        icon={<TextColor />}
        placeholder='Register name'
        label='Register name'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            name: event.currentTarget.value,
          })
        }
      />
      <TextInput
        icon={<TextCaption />}
        placeholder='Register description'
        label='Register description'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            description: event.currentTarget.value,
          })
        }
      />
      <div>
        Contacts
        <TextInput
          icon={<ExternalLink />}
          placeholder='Link'
          label='Link'
          onChange={(event) =>
            setFormInput({
              ...formInput,
              contacts: {
                ...formInput.contacts,
                link: event.currentTarget.value,
              },
            })
          }
        />
        <TextInput sx={{marginTop: "5px"}}
          icon={<Phone />}
          placeholder='Phone'
          label='Phone'
          onChange={(event) =>
            setFormInput({
              ...formInput,
              contacts: {
                ...formInput.contacts,
                phone: event.currentTarget.value,
              },
            })
          }
        />
        <TextInput sx={{marginTop: "5px"}}
          icon={<BrandMailgun />}
          placeholder='Email'
          label='Email'
          onChange={(event) =>
            setFormInput({
              ...formInput,
              contacts: {
                ...formInput.contacts,
                email: event.currentTarget.value,
              },
            })
          }
        />
      </div>
      <Button
        radius='md'
        color='red'
        disabled={
          formInput.name == '' ||
          formInput.description == '' ||
          (formInput.contacts.link == '' &&
            formInput.contacts.phone == '' &&
            formInput.contacts.email == '')
        }
        onClick={async (e) => {
          props.updateModal();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Deploying register...',
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
            });
            updateNotification({
              id: 'load-data',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              autoClose: 2000,
            });
            return;
          }

          let org = await getOrganisationContract(props.orgAddress);
          if (org == null) {
            showNotification({
              title: 'Error',
              color: 'red',
              message: 'An error occured.',
            });
            updateNotification({
              id: 'load-data',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              autoClose: 2000,
            });
            return;
          }

          let rawMetadata = serializeMetadata(formInput);
          try {
            let tx = await org.deployRegister(rawMetadata);
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
  );
}
