import { getOrganisationContract, getProvider, getRegisterContract, getSigner } from "@/contract_interactions";
import { serializeMetadata } from "@/utils";
import { Button, LoadingOverlay, Stack, TextInput } from "@mantine/core";
import React from "react";
import { useState } from "react";
import { TextColor, TextCaption, BrandMailgun, Check, X } from "tabler-icons-react";
import { showNotification, updateNotification } from '@mantine/notifications';


export default function UpdateRegisterForm(props: { regAddress: string, update?: () => any, updateModal: () => any }) {
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    contacts: '',
  });
  const [buttonContent, setButtonContent] = useState([<>Update Register</>, true] as [JSX.Element, boolean]);

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
      <TextInput
        icon={<BrandMailgun />}
        placeholder='Register contacts'
        label='Register contacts'
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
            title: 'Updating register...',
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

          let reg = await getRegisterContract(props.regAddress)
          if (reg == null) {
            showNotification({
              title: 'Error',
              message:
                'An error occured.',
            });
            return;
          }

          let rawMetadata = serializeMetadata(formInput);
          try {
            let tx = await reg.editRegisterMetadata(rawMetadata);
            if (tx.hash == null) return;
            await getProvider()?.waitForTransaction(tx.hash);
            updateNotification({
              id: 'load-data',
              color: 'teal',
              title: 'Register was successfully updated',
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