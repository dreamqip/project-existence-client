import { ORGANISATION_FACTORY_ADDRESS } from '@/config';
import {
  getSigner,
  getOrganisationFactoryContract,
  getProvider,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import { TextInput, Button, LoadingOverlay, Stack } from '@mantine/core';
import React, { useState } from 'react';
import {
  BrandMailgun,
  TextCaption,
  TextColor,
  Check,
  Cross,
  X,
} from 'tabler-icons-react';
import { showNotification, updateNotification } from '@mantine/notifications';
import { update } from '@/pages/organisations/[id]';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

export default function CreateOrganisationForm(props: { update: () => any }) {
  const router = useRouter();
  const [buttonContent, setButtonContent] = useState([
    <>Create Organisation</>,
    true,
  ] as [JSX.Element, boolean]);
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: '',
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
      <TextInput
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
      <TextInput
        icon={<BrandMailgun />}
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
            return;
          }
          let orgFactory = await getOrganisationFactoryContract(
            ORGANISATION_FACTORY_ADDRESS,
          );
          if (orgFactory == null) {
            showNotification({
              title: 'Error',
              message: 'An error occured.',
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
            router.push('/');
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
