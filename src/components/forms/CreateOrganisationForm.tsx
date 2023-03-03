import { ORGANISATION_FACTORY_ADDRESS } from '@/config';
import {
  getSigner,
  getOrganisationFactoryContract,
  getProvider,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import {
  TextInput,
  Button,
  LoadingOverlay,
  Stack,
  Textarea,
} from '@mantine/core';
import React, { useState } from 'react';
import {
  BrandMailgun,
  TextCaption,
  TextColor,
  Check,
  Cross,
  X,
  Phone,
  ExternalLink,
} from 'tabler-icons-react';
import { showNotification, updateNotification } from '@mantine/notifications';
import { update } from '@/pages/organisations/[id]';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

const emailRegex = /^\S+@\S+\.\S+$/; // This is a basic email regex pattern, modify it as needed

export default function CreateOrganisationForm(props: { update: () => any }) {
  const router = useRouter();
  const [buttonContent, setButtonContent] = useState([
    <>Create Organisation</>,
    true,
  ] as [JSX.Element, boolean]);
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: {
      link: '',
      phone: '',
      email: '',
    },
  });
  return (
    <Stack>
      <TextInput
        icon={<TextColor />}
        placeholder='Organisation name'
        label='Organisation name'
        onChange={(event) =>
          setFormInput({
            ...formInput,
            name: event.currentTarget.value,
          })
        }
      />

      <Textarea
        icon={<TextCaption />}
        placeholder='Organisation description'
        label='Organisation description'
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
        <TextInput
          sx={{ marginTop: '5px' }}
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
        <TextInput
          sx={{ marginTop: '5px' }}
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
            formInput.contacts.email == '') ||
          emailRegex.test(formInput.contacts.email) == false
        }
        onClick={async (e) => {
          props.update();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Creating organisation...',
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
          let orgFactory = await getOrganisationFactoryContract(
            ORGANISATION_FACTORY_ADDRESS,
          );
          if (orgFactory == null) {
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
            let tx = await orgFactory.deployOrganisation(
              rawMetadata,
              await signer.getAddress(),
            );
            if (tx.hash == null) return;
            await getProvider()?.waitForTransaction(tx.hash);

            setTimeout(() => {
              updateNotification({
                id: 'load-data',
                color: 'teal',
                title: 'Organisation was successfully created',
                message:
                  'Notification will close in 2 seconds, you can close this notification now',
                icon: <Check />,
                autoClose: 2000,
              });
            }, 3000);
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
                  autoClose: 2000,
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
                  autoClose: 2000,
                });
                break;
            }
          }
          router.push('/');
        }}
      >
        {buttonContent[0]}
      </Button>
    </Stack>
  );
}
