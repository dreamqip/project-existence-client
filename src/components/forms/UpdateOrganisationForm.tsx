import {
  getOrganisationContract,
  getProvider,
  getSigner,
} from '@/contract_interactions';
import { serializeMetadata } from '@/utils';
import {
  Button,
  LoadingOverlay,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
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
  PictureInPictureOff,
} from 'tabler-icons-react';
import { showNotification, updateNotification } from '@mantine/notifications';
import { parseMetadata, waitFor, type Metadata } from '@/utils';
const emailRegex = /^\S+@\S+\.\S+$/; // This is a basic email regex pattern, modify it as needed
const phoneRegex = /^\+\d+$/;

export default function UpdateOrganisationForm(props: {
  orgAddress: string;
  update?: () => any;
  updateModal: () => any;
}) {
  const [orgMetadata, setOrgMetadata] = useState({} as Metadata);
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    banner: '',
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
        banner: orgMetadata.banner || '',
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
        value={formInput.name ?? ''}
        onChange={(event) =>
          setFormInput({
            ...formInput,
            name: event.currentTarget.value,
          })
        }
      />
      <Textarea
        icon={<TextCaption />}
        defaultValue={orgMetadata.description ?? ''}
        value={formInput.description ?? ''}
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
        sx={{ marginTop: '5px' }}
        icon={<PictureInPictureOff />}
        placeholder='Logo/Banner'
        label='Logo/Banner'
        defaultValue={orgMetadata.banner ?? ''}
        onChange={(event) =>
          setFormInput({
            ...formInput,
            banner: event.currentTarget.value,
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
          value={formInput.contacts?.link ?? ''}
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
          value={formInput.contacts?.phone ?? ''}
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
          defaultValue={orgMetadata.contacts?.email ?? ''}
          value={formInput.contacts?.email ?? ''}
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
          formInput.name.trim() == '' ||
          formInput.description.trim() == '' ||
          (emailRegex.test(formInput.contacts.email) == false &&
            formInput.contacts.email.trim() != '') ||
          (phoneRegex.test(formInput.contacts.phone) == false &&
            formInput.contacts.phone.trim() != '')
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
              autoClose: 5000,
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
