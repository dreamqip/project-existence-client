import {
  getOrganisationContract,
  getProvider,
  getSigner,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import { Button, LoadingOverlay, Stack, TextInput } from '@mantine/core';
import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  TextColor,
  TextCaption,
  BrandMailgun,
  Check,
  X,
  ExternalLink,
  Phone,
} from 'tabler-icons-react';
import { showNotification, updateNotification } from '@mantine/notifications';
import { parseMetadata, waitFor, type Metadata } from '@/utils';
const emailRegex = /^\S+@\S+\.\S+$/; // This is a basic email regex pattern, modify it as needed

export default function UpdateOrganisationForm(props: {
  orgAddress: string;
  update?: () => any;
  updateModal: () => any;
}) {
  const [orgMetadata, setOrgMetadata] = useState({} as Metadata);
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: {
      link: '',
      phone: '',
      email: '',
    },
  });

  console.log(formInput);
  const [buttonContent, setButtonContent] = useState([
    <>Update Organisation</>,
    true,
  ] as [JSX.Element, boolean]);

  const fetchData = async () => {
    let org = await getOrganisationContract(props.orgAddress);
    if (!org) {
      return;
    }
    let rawMetadata = await org.metadata();
    setOrgMetadata(parseMetadata(rawMetadata));
  };
  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (orgMetadata.name && orgMetadata.description && orgMetadata.contacts) {
      setFormInput({
        name: orgMetadata.name,
        description: orgMetadata.description,
        contacts: {
          link: orgMetadata.contacts.link || '',
          phone: orgMetadata.contacts.phone || '',
          email: orgMetadata.contacts.email || '',
        },
      });
    }
  }, [orgMetadata]);

  return (
    <Stack>
      <TextInput
        icon={<TextColor />}
        placeholder='Organisation name'
        label='Organisation name'
        defaultValue={orgMetadata.name ?? ''}
        onChange={(event) =>
          setFormInput({
            ...formInput,
            name: event.currentTarget.value,
          })
        }
      />
      <TextInput
        icon={<TextCaption />}
        defaultValue={orgMetadata.description ?? ''}
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
          defaultValue={orgMetadata.contacts?.link ?? ''}
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
          defaultValue={orgMetadata.contacts?.phone ?? ''}
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
          defaultValue={orgMetadata.contacts?.email ?? ''}
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
          props.updateModal();
          showNotification({
            id: 'load-data',
            loading: true,
            title: 'Updating organisation...',
            message: 'You cannot close this notification yet',
            autoClose: false,
            withCloseButton: false,
          });
          let signer = getSigner();
          if (signer == null) {
            setButtonContent([<>Please connect your wallet</>, false]);
            return;
          }

          let org = await getOrganisationContract(props.orgAddress);
          if (org == null) {
            showNotification({
              title: 'Error',
              color: 'red',
              message: 'An error occured.',
              autoClose: 2000,
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
            let tx = await org.editOrganisationMetadata(rawMetadata);
            if (tx.hash == null) return;
            await getProvider()?.waitForTransaction(tx.hash);
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Organisation was successfully updated.',
              message:
                'Notification will close in 2 seconds, you can close this notification now',
              icon: <Check />,
              autoClose: 2000,
            });
            if (props.update) props.update();
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
              case 'CALL_EXCEPTION':
                updateNotification({
                  id: 'load-data',
                  color: 'red',
                  title: 'Transaction rejected: '+error.reason,
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
        }}
      >
        {buttonContent[0]}
      </Button>
    </Stack>
  );
}
